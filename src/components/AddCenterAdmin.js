// AddCenterAdmin.jsx

import { useEffect, useState } from "react";

export default function AddCenterAdmin() {

  const BACKEND_URL = process.env.REACT_APP_API_URL;

  const [allCenters, setAllCenters] = useState([]);

  const [selectedCenter, setSelectedCenter] = useState("");

  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [allAdmins, setAllAdmins] = useState([]);
  const [username, setUsername] = useState("");

  const [selectedAdminId, setSelectedAdminId] = useState("");

  const [mode, setMode] = useState("ADD");

  useEffect(() => {

    fetchCenters();

  }, []);
  const fetchCenterAdmins = async () => {

  try {

    const response = await fetch(
      `${BACKEND_URL}/center-admin/get-all-center-admins`
    );

    const data = await response.json();

    setAllAdmins(data.admins || []);

  } catch (error) {

    console.error(
      "Error fetching center admins:",
      error
    );

  }

};
  const handleUpdateCenterAdmin = async () => {

  try {

    const payload = {

      username: username,

      center_code: selectedCenter,

      admin_name: adminName,

      email: email,

      phone_number: phoneNumber,

      password: password,

    };

    const response = await fetch(
      `${BACKEND_URL}/center-admin/update-center-admin/${selectedAdminId}`,
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
        data.detail || "Failed to update admin"
      );

    }

    alert(
      "Center admin updated successfully"
    );

  } catch (error) {

    console.error(
      "Error updating admin:",
      error
    );

    alert(
      "Failed to update admin"
    );

  }

};
  const handleDeleteCenterAdmin = async () => {

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this admin?"
  );

  if (!confirmDelete) {
    return;
  }

  try {

    const response = await fetch(
      `${BACKEND_URL}/center-admin/delete-center-admin/${selectedAdminId}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {

      throw new Error(
        data.detail || "Failed to delete admin"
      );

    }

    alert(
      "Center admin deleted successfully"
    );

    setSelectedAdminId("");

    setAdminName("");
    setEmail("");
    setPhoneNumber("");
    setPassword("");

    fetchCenterAdmins();

  } catch (error) {

    console.error(
      "Error deleting admin:",
      error
    );

    alert(
      "Failed to delete admin"
    );

  }

};
  const fetchCenters = async () => {

    try {

      const response = await fetch(
        `${BACKEND_URL}/centers/get-all-centers`
      );

      const data = await response.json();

      setAllCenters(data.centers || []);

    } catch (error) {

      console.error(
        "Error fetching centers:",
        error
      );

    }

  };

  const handleAddCenterAdmin = async () => {

    try {

      const payload = {

        username: username,

        center_code: selectedCenter,

        admin_name: adminName,

        email: email,

        phone_number: phoneNumber,

        password: password,

      };

      console.log(
        "Submitting center admin:",
        payload
      );

      const response = await fetch(
        `${BACKEND_URL}/center-admin/add-center-admin`,
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
          data.detail || "Failed to add center admin"
        );

      }

      alert(
        "Center admin added successfully"
      );

      console.log(data);

    } catch (error) {

      console.error(
        "Error adding center admin:",
        error
      );

      alert(
        "Failed to add center admin"
      );

    }

  };

  return (

    <div className="bg-white shadow-md rounded-xl p-8 max-w-3xl border">

      <h2 className="text-3xl font-semibold mb-8">
        Add Center Admin
      </h2>

      {/* Select Center */}
      <div className="mb-6">

        <label className="block text-sm font-medium mb-2">
          Select Center
        </label>

        <select
          value={selectedCenter}
          onChange={(e) =>
            setSelectedCenter(e.target.value)
          }
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

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Admin Name */}
        <div>

          <label className="block text-sm font-medium mb-2">
            Admin Name
          </label>

          <input
            type="text"
            value={adminName}
            onChange={(e) =>
              setAdminName(e.target.value)
            }
            placeholder="Enter admin name"
            className="w-full border rounded-lg px-4 py-3"
          />

        </div>
        {/* Username */}
        <div>

          <label className="block text-sm font-medium mb-2">
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            placeholder="Enter username"
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
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Enter email"
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
            onChange={(e) =>
              setPhoneNumber(e.target.value)
            }
            placeholder="Enter phone number"
            className="w-full border rounded-lg px-4 py-3"
          />

        </div>

        {/* Password */}
        <div>

          <label className="block text-sm font-medium mb-2">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter password"
            className="w-full border rounded-lg px-4 py-3"
          />

        </div>

      </div>

      {/* Button */}
      {/* Select Existing Admin */}
      {mode === "UPDATE" && (

        <div className="mb-6">

          <label className="block text-sm font-medium mb-2">
            Select Center Admin
          </label>

          <select
            value={selectedAdminId}
            onChange={(e) => {

              const adminId = e.target.value;

              setSelectedAdminId(adminId);

              const selectedAdmin = allAdmins.find(
                (admin) =>
                  String(admin.id) === adminId
              );

              if (selectedAdmin) {

                setSelectedCenter(
                  selectedAdmin.center_code
                );

                setAdminName(
                  selectedAdmin.full_name
                );

                setEmail(
                  selectedAdmin.email
                );

                setPhoneNumber(
                  selectedAdmin.phone_number || ""
                );

              }

            }}
            className="w-full border rounded-lg px-4 py-3"
          >

            <option value="">
              Select Admin
            </option>

            {allAdmins.map((admin) => (

              <option
                key={admin.id}
                value={admin.id}
              >
                {admin.full_name}
              </option>

            ))}

          </select>

        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4 mt-8">

        {/* Add Mode */}
        <button
          onClick={() => {

            setMode("ADD");

            setSelectedAdminId("");

            setAdminName("");
            setEmail("");
            setPhoneNumber("");
            setPassword("");

          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
        >
          Add Center Admin
        </button>

        {/* Edit Mode */}
        <button
          onClick={async () => {

            setMode("UPDATE");

            await fetchCenterAdmins();

          }}
          className="bg-gray-700 hover:bg-gray-800 text-white px-8 py-3 rounded-lg"
        >
          Edit Center Admin
        </button>

        {/* Save */}
        {mode === "ADD" && (

          <button
            onClick={handleAddCenterAdmin}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg"
          >
            Save Admin
          </button>

        )}

        {/* Update */}
        {mode === "UPDATE" && (

          <button
            onClick={handleUpdateCenterAdmin}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg"
          >
            Update Admin
          </button>

        )}

        {/* Delete */}
        {mode === "UPDATE" && selectedAdminId && (

          <button
            onClick={handleDeleteCenterAdmin}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg"
          >
            Delete Admin
          </button>

        )}

      </div>

    </div>
  );
}