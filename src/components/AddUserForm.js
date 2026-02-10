import { useState, useEffect } from "react";
import "./AddStudentForm.css";

export default function AddStudentForm() {
  const [id, setId] = useState(""); // Non-editable ID from backend
  const [studentId, setStudentId] = useState(""); // Editable Student ID entered by admin
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [classDay, setClassDay] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const CLASS_NAME_OPTIONS = [
  "NAPLAN",
  "Selective",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
];

const CLASS_DAY_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

  useEffect(() => {
    const fetchNextId = async () => {
      try {
        const response = await fetch(
          "https://web-production-481a5.up.railway.app/get_next_user_id_exam_module"
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        // Assuming backend returns { next_id: "Gem001" }
        const backendId = data.next_id || data;
        setId(backendId); // Pre-fill non-editable ID field
      } catch (err) {
        console.error(err);
        alert("Unable to fetch next user ID");
      }
    };
    fetchNextId();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      id,               // Backend-suggested ID
      student_id: studentId, // Admin-entered student ID
      name,
      class_name: className,
      class_day: classDay,
      parent_email: parentEmail,
    };

    try {
      const response = await fetch(
        "https://web-production-481a5.up.railway.app/add_student_exam_module",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Failed to add student");
      alert("Student added successfully!");

      // Reset form
      setStudentId("");
      setName("");
      setClassName("");
      setClassDay("");
      setParentEmail("");
    } catch (err) {
      console.error(err);
      alert("Error adding student");
    }
  };

  return (
    <div className="add-student-container">
      <h2>Add New Student</h2>
      <form onSubmit={handleSubmit}>
        {/* Non-editable ID from backend */}
        <label>ID</label>
        <input type="text" value={id} readOnly />

        {/* Editable Student ID entered by admin */}
        <label>Student ID</label>
        <input
          type="text"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
        />

        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Class Name</label>
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
          >
            <option value="">Select class</option>
            {CLASS_NAME_OPTIONS.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>


        <label>Class Day</label>
          <select
            value={classDay}
            onChange={(e) => setClassDay(e.target.value)}
            required
          >
            <option value="">Select day</option>
            {CLASS_DAY_OPTIONS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>

        <label>Parent Email</label>
        <input
          type="email"
          value={parentEmail}
          onChange={(e) => setParentEmail(e.target.value)}
          required
        />

        <button type="submit">Add Student</button>
      </form>
    </div>
  );
}
