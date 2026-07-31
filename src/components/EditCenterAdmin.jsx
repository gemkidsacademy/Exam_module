// EditCenterAdmin.jsx

import { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL;

export default function EditCenterAdmin() {
  const [admins, setAdmins] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    adminId: "",
    centerCode: "",
    adminName: "",
    email: "",
    phoneNumber: "",
    username: "",
    password: "",
  });

  useEffect(() => {
    loadAdmins();
    loadCenters();
  }, []);

  const loadAdmins = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/center-admin/get-all-center-admins`
      );

      if (!response.ok) {
        throw new Error("Failed to load Center Admins");
      }

      const data = await response.json();

      setAdmins(data.admins);
    } catch (err) {
      console.error(err);
      alert("Unable to load Center Admins.");
    }
  };

  const loadCenters = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/centers/get-all-centers`
      );

      if (!response.ok) {
        throw new Error("Failed to load centers");
      }

      const data = await response.json();

      setCenters(data.centers);
    } catch (err) {
      console.error(err);
      alert("Unable to load centers.");
    }
  };

  const handleAdminSelect = (e) => {
    const id = e.target.value;

    setSelectedAdminId(id);

    const admin = admins.find(
      (a) => String(a.id) === String(id)
    );

    if (admin) {
      setFormData({
        adminId: admin.id,
        centerCode: admin.center_code,
        adminName: admin.full_name,
        email: admin.email,
        phoneNumber: admin.phone_number,
        username: admin.username,
        password: "",
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
        `${API_BASE}/center-admin/update-center-admin/${selectedAdminId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            center_code: formData.centerCode,
            admin_name: formData.adminName,
            username: formData.username,
            password: formData.password,
            email: formData.email,
            phone_number: formData.phoneNumber,
          }),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to update Center Admin");
      }

      alert("Center Admin updated successfully.");

      await loadAdmins();
    } catch (err) {
        console.error(err);
        alert(err.message);
      } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8">

      <h2 className="text-3xl font-semibold mb-8">
        Edit Center Admin
      </h2>

      <div className="mb-8">

        <label className="block mb-2 font-medium">
          Select Center Admin
        </label>

        <select
          value={selectedAdminId}
          onChange={handleAdminSelect}
          className="w-full border rounded-lg px-4 py-3"
        >
          <option value="">
            Select Center Admin
          </option>

          {admins.map((admin) => (
            <option
              key={admin.id}
              value={admin.id}
            >
              {admin.full_name} ({admin.email})
            </option>
          ))}
        </select>

      </div>

      {selectedAdminId && (

        <form onSubmit={handleUpdate}>

          <div className="grid grid-cols-2 gap-6">

            <div>

              <label className="block mb-2 font-medium">
                Center
              </label>

              <select
                name="centerCode"
                value={formData.centerCode}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              >
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

            <div>

              <label>
                Admin Name
                </label>

                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                  required
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
                Username
              </label>

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
                required
              />

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
                required
              />

            </div>

            

          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg disabled:opacity-50"
          >
            {isSubmitting
              ? "Updating Center Admin..."
              : "Update Center Admin"}
          </button>

        </form>

      )}

    </div>
  );
}