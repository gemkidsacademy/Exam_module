import React, { useState, useEffect } from "react";
import "./AddStudentForm.css";

function DeleteUserModal({ onClose, onUserDeleted }) {
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Read-only fields
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [className, setClassName] = useState("");
  const [classDay, setClassDay] = useState("");

  // 1️⃣ Fetch all students once (same as Edit)
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(
          "https://web-production-481a5.up.railway.app/get_all_students_exam_module"
        );

        if (!res.ok) {
          throw new Error("Failed to fetch students");
        }

        const data = await res.json();
        setStudentOptions(data);
      } catch (err) {
        console.error(err);
        alert("Unable to load students");
      }
    };

    fetchStudents();
  }, []);

  // 2️⃣ Populate fields from local list (NO API CALL)
  useEffect(() => {
    if (!selectedStudentId) {
      setId("");
      setName("");
      setParentEmail("");
      setClassName("");
      setClassDay("");
      return;
    }

    const student = studentOptions.find(
      (s) => String(s.id) === String(selectedStudentId)
    );

    if (student) {
      setId(student.id);
      setName(student.name);
      setParentEmail(student.parent_email);
      setClassName(student.class_name);
      setClassDay(student.class_day);
    }
  }, [selectedStudentId, studentOptions]);

  // 3️⃣ Delete handler
  const handleDelete = async () => {
    if (!id) {
      alert("Please select a student to delete");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete:\n\n${name} (${id}) ?`
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `https://web-production-481a5.up.railway.app/delete_student_exam_module/${id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        throw new Error("Failed to delete student");
      }

      alert("Student deleted successfully");
      onUserDeleted?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error deleting student");
    }
  };

  return (
  <div className="add-student-container">
    <h2>Delete Student</h2>

    {/* Dropdown */}
    <label>Select Student</label>
    <select
      value={selectedStudentId}
      onChange={(e) => setSelectedStudentId(e.target.value)}
    >
      <option value="">-- Select Student --</option>
      {studentOptions.map((s) => (
        <option key={s.id} value={s.id}>
          {s.student_id} - {s.name}
        </option>
      ))}
    </select>

    {/* Read-only details */}
    <label>ID</label>
    <input type="text" value={id} readOnly />

    <label>Name</label>
    <input type="text" value={name} readOnly />

    <label>Class</label>
    <input type="text" value={className} readOnly />

    <label>Day</label>
    <input type="text" value={classDay} readOnly />

    <label>Parent Email</label>
    <input type="email" value={parentEmail} readOnly />

    <button
      className="danger-btn"
      type="button"
      onClick={handleDelete}
      disabled={!id}
    >
      Delete Student
    </button>

    
  </div>
);

}

export default DeleteUserModal;
