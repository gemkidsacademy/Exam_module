import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Foundational_dashboard() {
  const navigate = useNavigate();

  /* -----------------------------
     STATE
  ----------------------------- */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);

  /* -----------------------------
     EFFECT
  ----------------------------- */
  useEffect(() => {
    const studentId = sessionStorage.getItem("student_id");

    if (!studentId) {
      setError("Student ID not found in session");
      setLoading(false);
      return;
    }

    const loadStudent = async () => {
      try {
        setLoading(true);

        // Temporary placeholder (replace with real API call)
        const data = {
          student_id: studentId,
          class_name: "Foundational",
          exam_type: "Selective",
        };

        setStudent(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load student data");
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, []);

  /* -----------------------------
     RENDER STATES
  ----------------------------- */
  if (loading) {
    return <div>Loading Foundational Selective Dashboard...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  /* -----------------------------
     MAIN UI
  ----------------------------- */
  return (
    <div className="dashboard-container">
      <h2>Selective Foundational Dashboard</h2>

      <div className="dashboard-card">
        <p>
          <strong>Student ID:</strong> {student.student_id}
        </p>
        <p>
          <strong>Class:</strong> {student.class_name}
        </p>
        <p>
          <strong>Exam Type:</strong> {student.exam_type}
        </p>
      </div>

      <div className="dashboard-actions">
        <button onClick={() => navigate("/ExamModule")}>
          Start Foundational Exam
        </button>
      </div>
    </div>
  );
}
