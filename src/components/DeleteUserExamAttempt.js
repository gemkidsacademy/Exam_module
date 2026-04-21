import React, { useEffect, useState } from "react";

import "./DeleteUserExamAttempt.css";
const DeleteUserExamAttempt = ({ onClose }) => {
  const [studentsList, setStudentsList] = useState([]);

  const [selectedStudentId, setSelectedStudentId] = useState("");
  

  const [selectedClassType, setSelectedClassType] = useState("");
  const [examOptionsList, setExamOptionsList] = useState([]);
  const [selectedExamType, setSelectedExamType] = useState("");
  const formatExamLabel = (exam) => {
    return exam
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  /* ============================
     FETCH STUDENTS
  ============================ */
  const fetchStudentsFromBackend = async () => {
    try {
      
      const response = await fetch("https://web-production-481a5.up.railway.app/api/students/basic"); // adjust later
      const data = await response.json();

      setStudentsList(data);
    } catch (error) {
      console.error("❌ Failed to fetch students", error);
    }
  };

  useEffect(() => {
    fetchStudentsFromBackend();
  }, []);

  /* ============================
     HANDLE STUDENT CHANGE
  ============================ */
  const handleStudentChange = (event) => {
    const studentId = event.target.value;

    const matchedStudent = studentsList.find(
      (studentItem) => String(studentItem.student_id) === String(studentId)
    );

    setSelectedStudentId(studentId);
    setSelectedExamType("");
    
    setSelectedClassType(matchedStudent?.class_name || "");

    updateExamOptionsBasedOnClass(matchedStudent?.class_name);
  };

  /* ============================
     SET EXAM OPTIONS
  ============================ */
  const updateExamOptionsBasedOnClass = (classType) => {
    const normalizedClassType = classType?.toLowerCase();

    if (normalizedClassType === "selective" || normalizedClassType === "oc") {
      setExamOptionsList([
        "thinking_skills",
        "mathematical_reasoning",
        "reading",
        "writing",
      ]);
    } else if (normalizedClassType === "naplan") {
      setExamOptionsList([
        "numeracy",
        "language_conventions",
        "reading",
        "writing",
      ]);
    } else {
      setExamOptionsList([]);
    }

    setSelectedExamType("");
  };

  /* ============================
     DELETE HANDLER
  ============================ */
  const handleDeleteHomeworkAttemptClick = async () => {
  try {
    const response = await fetch(
      "https://web-production-481a5.up.railway.app/api/delete-homework-attempt",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: selectedStudentId,
          exam_type: selectedExamType,
          class_name: selectedClassType,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(`❌ ${data.detail || "Failed to delete homework attempt"}`);
      return;
    }

    alert(`✅ ${data.message || "Homework attempt deleted"}`);
    onClose();

  } catch (error) {
    alert("❌ Network error. Please try again.");
  }
};
  const handleDeleteExamAttemptClick = async () => {
  try {
    console.log({
      student_id: selectedStudentId,
      exam_type: selectedExamType,
      class_name: selectedClassType,
    });

    const response = await fetch(
      "https://web-production-481a5.up.railway.app/api/delete-exam-attempt",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: selectedStudentId,
          exam_type: selectedExamType,
          class_name: selectedClassType,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(`❌ ${data.detail || "Failed to delete exam attempt"}`);
      return;
    }

    alert(`✅ ${data.message || "Exam attempt deleted"}`);
    onClose();

  } catch (error) {
    console.error("❌ Delete failed", error);
    alert("❌ Network error. Please try again.");
  }
};
  return (
    <div className="modal">
      <h2>Delete User Exam Attempt</h2>

      {/* ============================
          STUDENT DROPDOWN
      ============================ */}
      <label>Student</label>
      <select value={selectedStudentId} onChange={handleStudentChange}>
        <option value="">Select Student</option>
        {studentsList.map((studentItem) => (
          <option key={studentItem.id} value={studentItem.student_id}>
            {studentItem.name}
          </option>
        ))}
      </select>

      {/* ============================
          STUDENT ID FIELD (AUTO FILLED)
      ============================ */}
      <label>Student ID</label>
      <input type="text" value={selectedStudentId} readOnly />

      {/* ============================
          CLASS TYPE (AUTO)
      ============================ */}
      <label>Class</label>
      <input type="text" value={selectedClassType} readOnly />

      {/* ============================
          EXAM DROPDOWN
      ============================ */}
      <label>Exam</label>
      <select
        value={selectedExamType}
        onChange={(e) => setSelectedExamType(e.target.value)}
      >
        <option value="">Select Exam</option>
        {examOptionsList.map((examItem) => (
          <option key={examItem} value={examItem}>
            {formatExamLabel(examItem)}
          </option>
        ))}
      </select>

      {/* ============================
          ACTION BUTTONS
      ============================ */}
      
      <div className="button-group">
        <button
          className="danger-btn"
          onClick={handleDeleteExamAttemptClick}
        >
          Delete Exam Attempt
        </button>

        <button
          className="danger-btn"
          onClick={handleDeleteHomeworkAttemptClick}
        >
          Delete Homework Attempt
        </button>

        <button onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeleteUserExamAttempt;
