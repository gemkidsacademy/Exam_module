import React, { useEffect, useState } from "react";

import "./DeleteUserExamAttempt.css";
const DeleteUserExamAttempt = ({
  onClose,
  centerCode
}) => {
  const [studentsList, setStudentsList] = useState([]);

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const BACKEND_URL = process.env.REACT_APP_API_URL;
  

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
      
      const response = await fetch(
        `${BACKEND_URL}/students/by-center/${encodeURIComponent(centerCode)}`
      );
      const data = await response.json();

      setStudentsList(data.students || []);
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
    console.log({
      exam: selectedClassType.toLowerCase(),
      mode: "homework",
      subject: selectedExamType,
      student_id: selectedStudentId,
    });

    const response = await fetch(
      `${BACKEND_URL}/api/admin/delete-exam-attempt-2`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exam: selectedClassType.toLowerCase(), // selective / oc / naplan
          mode: "homework",
          subject: selectedExamType,             // thinking_skills, reading, etc.
          student_id: selectedStudentId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(`❌ ${data.detail || "Failed to delete homework attempt"}`);
      return;
    }

    alert(`✅ ${data.message || "Homework attempt deleted successfully."}`);
    onClose();

  } catch (error) {
    console.error("❌ Delete failed", error);
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
  `${BACKEND_URL}/api/admin/delete-exam-attempt-2`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: selectedStudentId,
          exam: selectedClassType.toLowerCase(),
          mode: "exam",
          subject: selectedExamType,
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

      <label>Search Student</label>
      <input
        type="text"
        placeholder="Search student by ID or name..."
        value={studentSearch}
        onChange={(e) => {
          setStudentSearch(e.target.value);
          setSelectedStudentId("");
          setSelectedClassType("");
          setSelectedExamType("");
          setExamOptionsList([]);
        }}
      />

      {studentSearch && !selectedStudentId && (
        <div role="listbox" style={{ width: "100%" }}>
          {studentsList
            .filter((studentItem) => {
              const searchValue = studentSearch.toLowerCase();

              return (
                String(studentItem.student_id)
                  .toLowerCase()
                  .includes(searchValue) ||
                String(studentItem.name).toLowerCase().includes(searchValue)
              );
            })
            .map((studentItem) => (
              <div
                key={studentItem.id}
                role="option"
                aria-selected="false"
                onClick={() => {
                  setSelectedStudentId(String(studentItem.student_id));
                  setStudentSearch(
                    `${studentItem.student_id} - ${studentItem.name}`
                  );
                  setSelectedClassType(studentItem.class_name || "");
                  setSelectedExamType("");
                  updateExamOptionsBasedOnClass(studentItem.class_name);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                }}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "8px 10px",
                  backgroundColor: "#ffffff",
                  color: "#222222",
                  border: "1px solid #d9d9d9",
                  textAlign: "left",
                  fontWeight: "normal",
                  cursor: "pointer",
                }}
              >
                {studentItem.student_id} - {studentItem.name}
              </div>
            ))}
        </div>
      )}

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
