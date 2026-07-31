// DeleteCenter.jsx

import { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL;

export default function DeleteCenter() {
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        throw new Error(error.detail || "Failed to delete center");
      }

      

      const data = await response.json();

      setCenters(data.centers);
    } catch (err) {
        console.error(err);
        alert(err.message);
      }
  };

  const handleDelete = async () => {
    if (!selectedCenter) {
      alert("Please select a center.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this center?"
    );

    if (!confirmed) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `${API_BASE}/centers/delete-center/${selectedCenter}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete center");
      }

      alert("Center deleted successfully.");

      setSelectedCenter("");

      await loadCenters();
    } catch (err) {
      console.error(err);
      alert("Unable to delete center.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8">

      <h2 className="text-3xl font-semibold mb-8">
        Delete Center
      </h2>

      <div>

        <label className="block mb-2 font-medium">
          Select Center
        </label>

        <select
          value={selectedCenter}
          onChange={(e) => setSelectedCenter(e.target.value)}
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

      <div className="mt-8 p-6 rounded-lg border bg-red-50">

        <h3 className="text-lg font-semibold text-red-700 mb-2">
          Warning
        </h3>

        <p className="text-gray-700 mb-6">
          This action will permanently delete the selected center.
          This action cannot be undone.
        </p>

        <button
          onClick={handleDelete}
          disabled={isSubmitting}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg disabled:opacity-50"
        >
          {isSubmitting
            ? "Deleting Center..."
            : "Delete Center"}
        </button>

      </div>

    </div>
  );
}