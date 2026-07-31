// AddCenterAdmin.jsx

import { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL;

export default function AddCenterAdmin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [centers, setCenters] = useState([]);

  const [formData, setFormData] = useState({
    centerCode: "",
    adminName: "",
    email: "",
    phoneNumber: "",
    username: "",
    password: "",
    status: "ACTIVE",
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
        throw new Error("Failed to load centers");
      }

      const data = await response.json();

      setCenters(data.centers);
    } catch (err) {
      console.error(err);
      alert("Unable to load centers.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      centerCode: "",
      adminName: "",
      email: "",
      phoneNumber: "",
      username: "",
      password: "",
      status: "ACTIVE",
    });;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `${API_BASE}/center-admin/add-center-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            center_code: formData.centerCode,
            admin_name: formData.adminName,
            email: formData.email,
            phone_number: formData.phoneNumber,
            username: formData.username,
            password: formData.password,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create Center Admin");
      }

      alert("Center Admin created successfully.");

      resetForm();
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
        Add Center Admin
      </h2>

      <form onSubmit={handleSubmit}>

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
              required
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

          <div>
            <label className="block mb-2 font-medium">
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

        </div>

        <div className="flex gap-4 mt-8">

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg disabled:opacity-50"
          >
            {isSubmitting
              ? "Creating Center Admin..."
              : "Add Center Admin"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg"
          >
            Reset
          </button>

        </div>

      </form>

    </div>
  );
}