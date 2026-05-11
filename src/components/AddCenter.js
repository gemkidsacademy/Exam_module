// AddCenter.jsx

import { useEffect, useState } from "react";

export default function AddCenter() {

  const [centerCode, setCenterCode] = useState("");
  const [centerName, setCenterName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [allCenters, setAllCenters] = useState([]);
  const [mode, setMode] = useState("");
  const [selectedCenterCode, setSelectedCenterCode] = useState("");
  const BACKEND_URL = process.env.REACT_APP_API_URL;

    const [status, setStatus] = useState("ACTIVE");
    const fetchAllCenters = async () => {

      try {

        const response = await fetch(
          `${BACKEND_URL}/centers/get-all-centers`
        );

        const data = await response.json();
        console.log(
            "Fetched centers:",
            data
          );
        setAllCenters(data.centers);

      } catch (error) {

        console.error(
          "Error fetching centers:",
          error
        );

      }

    };
    useEffect(() => {

      const fetchNextCenterCode = async () => {

        try {

          const response = await fetch(
            `${BACKEND_URL}/centers/get-next-center-code`
          );

          const data = await response.json();

          setCenterCode(data.center_code);

        } catch (error) {

          console.error(
            "Error fetching center code:",
            error
          );

        }

      };

      fetchNextCenterCode();

    }, [BACKEND_URL]);

  const handleAddCenter = async () => {

  try {

    const payload = {
      center_code: centerCode,
      center_name: centerName,
      address: address,
      phone_number: phoneNumber,
      email: email,
      status: status,
    };

    console.log(
      "Submitting center payload:",
      payload
    );

    const response = await fetch(
      `${BACKEND_URL}/centers/add-center`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {

      throw new Error(
        data.detail || "Failed to add center"
      );

    }

    alert("Center added successfully");

    console.log(
      "Center saved:",
      data
    );

  } catch (error) {

    console.error(
      "Error adding center:",
      error
    );

    alert(
      "Failed to add center"
    );

  }

};
  const handleDeleteCenter = async () => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this center?"
    );

    if (!confirmDelete) {
      return;
    }

    try {

      const response = await fetch(
        `${BACKEND_URL}/centers/delete-center/${centerCode}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail || "Failed to delete center"
        );

      }

      alert("Center deleted successfully");

      // Clear form
      setCenterCode("");
      setCenterName("");
      setAddress("");
      setPhoneNumber("");
      setEmail("");
      setStatus("ACTIVE");

      setSelectedCenterCode("");

      // Refresh dropdown
      fetchAllCenters();

    } catch (error) {

      console.error(
        "Error deleting center:",
        error
      );

      alert("Failed to delete center");

    }

  };

  const handleUpdateCenter = async () => {

  try {

    const payload = {
      center_code: centerCode,
      center_name: centerName,
      address: address,
      phone_number: phoneNumber,
      email: email,
      status: status,
    };

    console.log(
      "Updating center payload:",
      payload
    );

    const response = await fetch(
      `${BACKEND_URL}/centers/update-center/${centerCode}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {

      throw new Error(
        data.detail || "Failed to update center"
      );

    }

    alert("Center updated successfully");

    console.log(
      "Updated center:",
      data
    );

  } catch (error) {

    console.error(
      "Error updating center:",
      error
    );

    alert(
      "Failed to update center"
    );

  }

};

  return (

    <div className="bg-white shadow-md rounded-xl p-8 max-w-3xl border">

      <h2 className="text-3xl font-semibold mb-8">
        Manage Center
      </h2>
      {mode === "UPDATE" && allCenters.length > 0 && (

      <div className="mt-6">

        <label className="block text-sm font-medium mb-2">
          Select Center
        </label>

        <select
          value={selectedCenterCode}
          onChange={(e) => {

            const selectedCode = e.target.value;

            setSelectedCenterCode(selectedCode);

            const selectedCenter = allCenters.find(
              (center) =>
                center.center_code === selectedCode
            );

            if (selectedCenter) {

              setCenterCode(selectedCenter.center_code);

              setCenterName(selectedCenter.center_name);

              setAddress(selectedCenter.address || "");

              setPhoneNumber(
                selectedCenter.phone_number || ""
              );

              setEmail(selectedCenter.email || "");

              setStatus(selectedCenter.status || "ACTIVE");

            }

          }}
          className="w-full border rounded-lg px-4 py-3"
        >

          <option value="">
            Select Center
          </option>

          {allCenters.map((center) => (

            <option
              key={center.center_code}
              value={center.center_code}
            >
              {center.center_name}
            </option>

          ))}

        </select>

      </div>
    )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Center Code */}
        <div>

          <label className="block text-sm font-medium mb-2">
            Center Code
          </label>

          <input
            type="text"
            value={centerCode}
            readOnly
            className="w-full border rounded-lg px-4 py-3 bg-gray-100"
          />

        </div>

        {/* Center Name */}
        <div>

          <label className="block text-sm font-medium mb-2">
            Center Name
          </label>

          <input
            type="text"
            value={centerName}
            onChange={(e) => setCenterName(e.target.value)}
            placeholder="Enter center name"
            className="w-full border rounded-lg px-4 py-3"
          />

        </div>

        {/* Phone Number */}
        <div>

          <label className="block text-sm font-medium mb-2">
            Phone Number
          </label>

          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
            className="w-full border rounded-lg px-4 py-3"
          />

        </div>

        {/* Email */}
        <div>

          <label className="block text-sm font-medium mb-2">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            className="w-full border rounded-lg px-4 py-3"
          />

        </div>

      </div>

      {/* Address */}
      <div className="mt-6">

        <label className="block text-sm font-medium mb-2">
          Address
        </label>

        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter center address"
          rows={4}
          className="w-full border rounded-lg px-4 py-3"
        />

      </div>

      {/* Status */}
      <div className="mt-6">

        <label className="block text-sm font-medium mb-2">
          Status
        </label>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded-lg px-4 py-3"
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>

      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-8">

        {/* Add Mode Button */}
        <button
          onClick={() => {

            setMode("ADD");

            setAllCenters([]);

            setSelectedCenterCode("");

            setCenterName("");
            setAddress("");
            setPhoneNumber("");
            setEmail("");

            setStatus("ACTIVE");

          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
        >
          Add New Center
        </button>

        {/* Update Mode Button */}
        <button
          onClick={async () => {

            setMode("UPDATE");

            await fetchAllCenters();

          }}
          className="bg-gray-700 hover:bg-gray-800 text-white px-8 py-3 rounded-lg"
        >
          Edit Existing Center
        </button>

        {/* Save Button */}
        {mode === "ADD" && (

          <button
            onClick={handleAddCenter}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg"
          >
            Save Center
          </button>

        )}

        {/* Update Button */}
        {mode === "UPDATE" && (

          <button
            onClick={handleUpdateCenter}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg"
          >
            Update Center
          </button>

        )}
        {/* Delete Button */}
        {mode === "UPDATE" && selectedCenterCode && (

          <button
            onClick={handleDeleteCenter}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg"
          >
            Delete Center
          </button>

        )}

      </div>

    </div>
  );
}