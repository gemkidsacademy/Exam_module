// EditCenter.jsx

import { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL;

export default function EditCenter() {
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    centerCode: "",
    centerName: "",
    phoneNumber: "",
    email: "",
    address: "",
    status: "ACTIVE",
    timeZone: "Australia/Sydney",
  });

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/centers/get-all-centers`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to update center");
      }

      const data = await response.json();

      setCenters(data.centers);
    } catch (err) {
        console.error(err);
        alert(err.message);
      }
  };

  const handleCenterChange = (e) => {
    const code = e.target.value;

    setSelectedCenter(code);

    const center = centers.find(
      (c) => c.center_code === code
    );

    if (center) {
      setFormData({
        centerCode: center.center_code,
        centerName: center.center_name,
        phoneNumber: center.phone_number,
        email: center.email,
        address: center.address,
        status: center.status,
        timeZone: center.time_zone,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `${API_BASE}/centers/update-center/${formData.centerCode}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            center_code: formData.centerCode,
            center_name: formData.centerName,
            phone_number: formData.phoneNumber,
            email: formData.email,
            address: formData.address,
            time_zone: formData.timeZone,
            status: formData.status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update center");
      }

      alert("Center updated successfully.");

      setSelectedCenter("");

      setFormData({
        centerCode: "",
        centerName: "",
        phoneNumber: "",
        email: "",
        address: "",
        status: "ACTIVE",
        timeZone: "Australia/Sydney",
      });

      await loadCenters();
    } catch (err) {
      console.error(err);
      alert("Unable to update center.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8">

      <h2 className="text-3xl font-semibold mb-8">
        Edit Center
      </h2>

      <div className="mb-8">

        <label className="block mb-2 font-medium">
          Select Center
        </label>

        <select
          value={selectedCenter}
          onChange={handleCenterChange}
          className="w-full border rounded-lg px-4 py-3"
        >
          <option value="">
            Select Center
          </option>

          {centers.map((center) => (
            <option
              key={center.center_code}
              value={center.center_code}
            >
              {center.center_code} - {center.center_name}
            </option>
          ))}
        </select>

      </div>

      {selectedCenter && (

        <form onSubmit={handleUpdate}>

          <div className="grid grid-cols-2 gap-6">

            <div>

              <label className="block mb-2 font-medium">
                Center Code
              </label>

              <input
                type="text"
                value={formData.centerCode}
                readOnly
                className="w-full border rounded-lg px-4 py-3 bg-gray-100"
              />

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Center Name
              </label>

              <input
                type="text"
                name="centerName"
                value={formData.centerName}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
                required
              />

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Phone Number
              </label>

              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              />

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              />

            </div>

          </div>

          <div className="mt-6">

            <label className="block mb-2 font-medium">
              Address
            </label>

            <textarea
              rows={4}
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />

          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">

            <div>

              <label className="block mb-2 font-medium">
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              >
                <option value="ACTIVE">
                  ACTIVE
                </option>

                <option value="INACTIVE">
                  INACTIVE
                </option>

              </select>

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Time Zone
              </label>

              <select
                name="timeZone"
                value={formData.timeZone}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              >
                <option value="Australia/Sydney">
                  Australia/Sydney
                </option>

                <option value="Australia/Melbourne">
                  Australia/Melbourne
                </option>

                <option value="Australia/Brisbane">
                  Australia/Brisbane
                </option>

                <option value="Australia/Perth">
                  Australia/Perth
                </option>

                <option value="UTC">
                  UTC
                </option>

              </select>

            </div>

          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg disabled:opacity-50"
          >
            {isSubmitting
              ? "Updating Center..."
              : "Update Center"}
          </button>

        </form>

      )}

    </div>
  );
}