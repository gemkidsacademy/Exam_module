import { useState, useEffect } from "react";

export default function AddStudentForm() {
  const [nextId, setNextId] = useState("");     // Auto-filled student_id
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [classDay, setClassDay] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  import "./AddStudentForm.css";

  // -----------------------------
  // Fetch previous user ID
  // -----------------------------
  useEffect(() => {
    const fetchNextId = async () => {
      try {
        const response = await fetch(
          "https://web-production-481a5.up.railway.app/get_next_user_id_exam_module"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const id = await response.json();
        console.log("[DEBUG] Received next user ID:", id);
        setNextId(id);
      } catch (err) {
        console.error("[ERROR] Failed to fetch next user ID:", err);
        alert("Unable to fetch next user ID");
      }
    };

    fetchNextId();
  }, []); // <-- properly closed useEffect

  // -----------------------------
  // Submit Student
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      student_id: nextId,
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert("Student added successfully!");
    } catch (err) {
      console.error("[ERROR] Failed to add student:", err);
      alert("Error adding student");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px" }}>
      <h2>Add New Student</h2>
      <form onSubmit={handleSubmit}>
        
        {/* student_id (auto-filled) */}
        <label>Student ID</label>
        <input
          type="text"
          value={nextId}
          readOnly
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <label>Class Name</label>
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <label>Class Day</label>
        <input
          type="text"
          value={classDay}
          onChange={(e) => setClassDay(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <label>Parent Email</label>
        <input
          type="email"
          value={parentEmail}
          onChange={(e) => setParentEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <button type="submit">Add Student</button>
      </form>
    </div>
  );
}
