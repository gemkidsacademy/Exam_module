import { useEffect, useState } from "react";

const BACKEND_URL = process.env.REACT_APP_API_URL;

export default function DeleteClass({ onClose }) {
  const rawCenterCode = sessionStorage.getItem("center_code") || "";

  const centerCode = rawCenterCode.includes("|")
    ? rawCenterCode.split("|")[1].trim()
    : rawCenterCode;

  const [classes, setClasses] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/classes/${centerCode}`
      );

      if (!response.ok) {
        throw new Error("Failed to load classes");
      }

      const data = await response.json();
      setClasses(data);
    } catch (err) {
      console.error(err);
      alert("Unable to load classes.");
    }
  };

  const handleDelete = async () => {
    if (!selectedId) {
      alert("Please select a class.");
      return;
    }

    const selectedClass = classes.find(
      (cls) => cls.id === Number(selectedId)
    );

    const confirmed = window.confirm(
      `Are you sure you want to delete "${selectedClass?.class_name}"?`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      const response = await fetch(
        `${BACKEND_URL}/classes/${selectedId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete class");
      }

      alert("Class deleted successfully!");

      onClose();
    } catch (err) {
      console.error(err);
      alert("Error deleting class.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="add-student-container">
      <h2>Delete Class</h2>

      <label>Select Class</label>

      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        <option value="">Select a Class</option>

        {classes.map((cls) => (
          <option key={cls.id} value={cls.id}>
            {cls.id} - {cls.class_name}
          </option>
        ))}
      </select>

      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={isDeleting ? "submit-btn disabled" : "submit-btn"}
      >
        {isDeleting ? "Deleting..." : "Delete Class"}
      </button>

      <button
        type="button"
        onClick={onClose}
        style={{ marginTop: "10px" }}
      >
        Back
      </button>
    </div>
  );
}