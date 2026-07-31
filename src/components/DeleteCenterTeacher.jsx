// DeleteCenterTeacher.jsx

import { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL;

export default function DeleteCenterTeacher() {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/get-all-center-teachers`
      );

      if (!response.ok) {
        throw new Error("Failed to load Center Teachers.");
      }

      const data = await response.json();

      setTeachers(data.teachers);
    } catch (err) {
      console.error(err);
      alert("Unable to load Center Teachers.");
    }
  };

  const handleDelete = async () => {
    if (!selectedTeacherId) {
      alert("Please select a Center Teacher.");
      return;
    }

    const teacher = teachers.find(
      (t) => String(t.id) === String(selectedTeacherId)
    );

    const confirmed = window.confirm(
      `Are you sure you want to delete "${teacher?.full_name}"?`
    );

    if (!confirmed) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `${API_BASE}/delete-center-teacher/${selectedTeacherId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.detail || "Failed to delete Center Teacher."
        );
      }

      alert("Center Teacher deleted successfully.");

      setSelectedTeacherId("");

      await loadTeachers();

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
        Delete Center Teacher
      </h2>

      <div className="mb-8">

        <label className="block mb-2 font-medium">
          Select Center Teacher
        </label>

        <select
          value={selectedTeacherId}
          onChange={(e) => setSelectedTeacherId(e.target.value)}
          className="w-full border rounded-lg px-4 py-3"
        >
          <option value="">
            Select Center Teacher
          </option>

          {teachers.map((teacher) => (
            <option
              key={teacher.id}
              value={teacher.id}
            >
              {teacher.full_name} ({teacher.username})
            </option>
          ))}

        </select>

      </div>

      {selectedTeacherId && (

        <div className="mt-8 p-6 rounded-lg border bg-red-50">

          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Warning
          </h3>

          <p className="text-gray-700 mb-6">
            This action will permanently delete the selected Center Teacher.
            This action cannot be undone.
          </p>

          <button
            onClick={handleDelete}
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg disabled:opacity-50"
          >
            {isSubmitting
              ? "Deleting Center Teacher..."
              : "Delete Center Teacher"}
          </button>

        </div>

      )}

    </div>
  );
}