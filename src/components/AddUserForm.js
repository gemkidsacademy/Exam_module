import { useState, useEffect } from "react";
import "./AddStudentForm.css";

export default function AddStudentForm() {
  const [studentId, setStudentId] = useState(""); // Editable ID field
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [classDay, setClassDay] = useState("");
  const [parentEmail, setParentEmail] = useState("");

  useEffect(() => {
    const fetchNextId = async () => {
      try {
        const response = await fetch(
          "https://web-production-481a5.up.railway.app/get_next_user_id_exam_module"
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const id = await response.json();
        setStudentId(id); // Pre-fill editable ID
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
      student_id: studentId, 
      name, 
      class_name: className, 
      class_day: classDay, 
      parent_email: parentEmail 
    };
    try {
      const response = await fetch(
        "https://web-production-481a5.up.railway.app/add_student_exam_module",
        { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(payload) 
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
        <input 
          type="text" 
          value={className} 
          onChange={(e) => setClassName(e.target.value)} 
          required 
        />

        <label>Class Day</label>
        <input 
          type="text" 
          value={classDay} 
          onChange={(e) => setClassDay(e.target.value)} 
          required 
        />

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
