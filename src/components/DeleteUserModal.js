import React, { useState, useEffect } from "react";
import "./AddStudentForm.css";

function DeleteUserModal({ onClose, onUserDeleted }) {
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  // Read-only fields
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [className, setClassName] = useState("");
  const [classDay, setClassDay] = useState("");

  const centerCode = sessionStorage.getItem("center_code");
  const BACKEND_URL = process.env.REACT_APP_API_URL;

  // Fetch all students once
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/students/by-center/${centerCode}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch students");
        }

        const data = await res.json();
        setStudentOptions(data.students || []);
      } catch (err) {
        console.error(err);
        alert("Unable to load students");
      }
    };

    fetchStudents();
  }, []);

  // Populate fields from local list
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

  // Delete handler
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
        `${BACKEND_URL}/delete_student_exam_module/${id}`,
        {
          method: "DELETE",
        }
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

      <label>Search Student</label>

      <input
        type="text"
        placeholder="Search student by ID or name..."
        value={studentSearch}
        onChange={(e) => {
          setStudentSearch(e.target.value);
          setSelectedStudentId("");
        }}
      />

      {/* Student search results */}
      {studentSearch && !selectedStudentId && (
        <div
          style={{
            width: "100%",
            border: "1px solid #ccc",
            borderTop: "none",
            backgroundColor: "#fff",
          }}
        >
          {studentOptions
            .filter((s) => {
              const searchValue = studentSearch.toLowerCase();

              return (
                String(s.student_id)
                  .toLowerCase()
                  .includes(searchValue) ||
                String(s.name).toLowerCase().includes(searchValue)
              );
            })
            .map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  setSelectedStudentId(String(s.id));
                  setStudentSearch(`${s.student_id} - ${s.name}`);
                }}
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #ccc",
                  backgroundColor: "#fff",
                  color: "#222",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                }}
              >
                {s.student_id} - {s.name}
              </div>
            ))}
        </div>
      )}

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