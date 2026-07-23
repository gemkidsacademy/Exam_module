import { useEffect, useState } from "react";

const BACKEND_URL = process.env.REACT_APP_API_URL;

export default function EditClassForm({ onClose }) {
  const rawCenterCode = sessionStorage.getItem("center_code") || "";

  const centerCode = rawCenterCode.includes("|")
    ? rawCenterCode.split("|")[1].trim()
    : rawCenterCode;

  const [classes, setClasses] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [className, setClassName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleClassChange = (e) => {
    const id = e.target.value;

    setSelectedId(id);

    const selected = classes.find(
      (cls) => cls.id === Number(id)
    );

    if (selected) {
      setClassName(selected.class_name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `${BACKEND_URL}/classes/${selectedId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            class_name: className,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update class");
      }

      alert("Class updated successfully!");

      onClose();
    } catch (err) {
      console.error(err);
      alert("Error updating class.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-student-container">
      <h2>Edit Class</h2>

      <form onSubmit={handleSubmit}>

        <label>Select Class</label>

        <select
          value={selectedId}
          onChange={handleClassChange}
          required
        >
          <option value="">
            Select a Class
          </option>

          {classes.map((cls) => (
            <option
              key={cls.id}
              value={cls.id}
            >
              {cls.id} - {cls.class_name}
            </option>
          ))}
        </select>

        <label>Class Name</label>

        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className={isSubmitting ? "submit-btn disabled" : "submit-btn"}
        >
          {isSubmitting ? "Updating..." : "Update Class"}
        </button>

        <button
          type="button"
          onClick={onClose}
          style={{ marginTop: "10px" }}
        >
          Back
        </button>

      </form>
    </div>
  );
}