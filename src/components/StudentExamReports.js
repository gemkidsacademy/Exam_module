import React, { useEffect, useState } from "react";
import "./StudentExamReports.css";


export default function StudentExamReports() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  /* ============================
     Load Students
  ============================ */
  useEffect(() => {
    fetch(`${BACKEND_URL}/students`)
      .then((res) => res.json())
      .then(setStudents)
      .catch(() => alert("Failed to load students"));
  }, []);

  /* ============================
     Load Selective Reports
  ============================ */
  useEffect(() => {
    if (!selectedStudent) return;

    fetch(
      `${BACKEND_URL}/api/admin/students/${selectedStudent.id}/selective-reports`
    )
      .then((res) => res.json())
      .then(setReports)
      .catch(() => alert("Failed to load reports"));
  }, [selectedStudent]);

  /* ============================
     UI
  ============================ */
  return (
    <div className="student-exam-reports">
      <h2>Student Exam Reports</h2>

      {/* ============================
         STEP 1: SELECT STUDENT
      ============================ */}
      {!selectedStudent && (
        <>
          <h4>Select Student</h4>
          <ul>
            {Array.isArray(students) && students.map((student) => (

              <li key={student.id}>
                <button
                  className="dashboard-button"
                  onClick={() => setSelectedStudent(student)}
                >
                  {student.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* ============================
         STEP 2: SELECT EXAM ATTEMPT
      ============================ */}
      {selectedStudent && !selectedReport && (
        <>
          <button onClick={() => setSelectedStudent(null)}>
            ← Back to Students
          </button>

          <h4>
            Selective Exam Reports for {selectedStudent.name}
          </h4>

          {reports.length === 0 && (
            <p className="empty-state">No Selective exam reports found.</p>
          )}

          <ul>
            {Array.isArray(reports) && reports.map((report, index) => (

              <li key={report.id}>
                <button
                  className="dashboard-button"
                  onClick={() => setSelectedReport(report)}
                >
                  Selective Exam – {report.exam_date} (Attempt {index + 1})
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* ============================
         STEP 3: VIEW REPORT (READ ONLY)
      ============================ */}
      {selectedReport && (
        <>
          <button onClick={() => setSelectedReport(null)}>
            ← Back to Exams
          </button>

          <h3>Selective Readiness Report</h3>

          <p>
            <strong>Overall Readiness:</strong>{" "}
            {selectedReport.readiness_band}
          </p>

          <p>
            <strong>School Guidance:</strong>{" "}
            {selectedReport.school_guidance_level}
          </p>

          <h4>Section Performance</h4>
          <ul className="section-list">
            {Array.isArray(selectedReport.sections) &&
              selectedReport.sections.map((section) => (

              <li key={section.section_name}>
                <strong>{section.section_name}</strong> –{" "}
                {section.performance_band}
                <br />
                Strengths: {section.strengths_summary}
                <br />
                Improvement: {section.improvement_summary}
              </li>
            ))}
          </ul>

          <p style={{ marginTop: "20px", fontStyle: "italic" }}>
            {selectedReport.disclaimer}
          </p>
        </>
      )}
    </div>
  );
}
