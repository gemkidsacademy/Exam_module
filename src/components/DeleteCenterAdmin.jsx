// DeleteCenterAdmin.jsx

import { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL;

export default function DeleteCenterAdmin() {
  const [admins, setAdmins] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/center-admin/get-all-center-admins`
      );

      if (!response.ok) {
        throw new Error("Failed to load Center Admins.");
      }

      const data = await response.json();

      setAdmins(data.admins);
    } catch (err) {
      console.error(err);
      alert("Unable to load Center Admins.");
    }
  };

  const handleDelete = async () => {
    if (!selectedAdminId) {
      alert("Please select a Center Admin.");
      return;
    }

    const admin = admins.find(
      (a) => String(a.id) === String(selectedAdminId)
    );

    const confirmed = window.confirm(
      `Are you sure you want to delete "${admin?.full_name}"?`
    );

    if (!confirmed) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `${API_BASE}/center-admin/delete-center-admin/${selectedAdminId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.detail || "Failed to delete Center Admin."
        );
      }

      alert("Center Admin deleted successfully.");

      setSelectedAdminId("");

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
        Delete Center Admin
      </h2>

      <div className="mb-8">

        <label className="block mb-2 font-medium">
          Select Center Admin
        </label>

        <select
          value={selectedAdminId}
          onChange={(e) => setSelectedAdminId(e.target.value)}
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
              {admin.full_name} ({admin.username})
            </option>
          ))}

        </select>

      </div>

      {selectedAdminId && (

        <div className="mt-8 p-6 rounded-lg border bg-red-50">

          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Warning
          </h3>

          <p className="text-gray-700 mb-6">
            This action will permanently delete the selected Center Admin.
            This action cannot be undone.
          </p>

          <button
            onClick={handleDelete}
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg disabled:opacity-50"
          >
            {isSubmitting
              ? "Deleting Center Admin..."
              : "Delete Center Admin"}
          </button>

        </div>

      )}

    </div>
  );
}