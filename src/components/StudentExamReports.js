import React, { useEffect, useState } from "react";
import "./StudentExamReports.css";

export default function StudentExamReports() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentDetails, setStudentDetails] = useState(null);

  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  /* ============================
     Load Students (dropdown list)
     Uses student_id as key
  ============================ */
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/admin/students`)
      .then((res) => res.json())
      .then(setStudents)
      .catch(() => alert("Failed to load students"));
  }, []);

  /* ============================
     Load Student Details
     Triggered by student_id
  ============================ */
  useEffect(() => {
    if (!selectedStudentId) return;

    fetch(`${BACKEND_URL}/api/admin/students/${selectedStudentId}`)
      .then((res) => res.json())
      .then((data) => {
        setStudentDetails(data);
        setReports([]);
        setSelectedReport(null);
      })
      .catch(() => alert("Failed to load student details"));
  }, [selectedStudentId]);

  /* ============================
     Load Selective Reports
     Triggered by studentDetails
  ============================ */
  useEffect(() => {
    if (!studentDetails) return;

    fetch(
      `${BACKEND_URL}/api/admin/students/${studentDetails.student_id}/selective-reports`
    )
      .then((res) => res.json())
      .then(setReports)
      .catch(() => alert("Failed to load reports"));
  }, [studentDetails]);

  /* ============================
     UI
  ============================ */
  return (
    <div className="student-exam-reports">
      <h2>Student Exam Reports</h2>

      {/* ============================
         STEP 1: SELECT STUDENT ID
      ============================ */}
      {!studentDetails && (
        <>
          <h4>Select Student</h4>

          <div className="student-select-box">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">-- Select Student ID --</option>
              {Array.isArray(students) &&
                students.map((student) => (
                  <option
                    key={student.student_id}
                    value={student.student_id}
                  >
                    {student.student_id} – {student.name}
                  </option>
                ))}
            </select>
          </div>
        </>
      )}

      {/* ============================
         STEP 2: STUDENT CONTEXT
      ============================ */}
      {studentDetails && !selectedReport && (
        <>
          <button
            onClick={() => {
              setSelectedStudentId("");
              setStudentDetails(null);
              setReports([]);
            }}
          >
            ← Back to Students
          </button>

          <div className="student-info-box">
            <p><strong>Student ID:</strong> {studentDetails.student_id}</p>
            <p><strong>Name:</strong> {studentDetails.name}</p>
            <p><strong>Class:</strong> {studentDetails.class_name}</p>
            <p><strong>Class Day:</strong> {studentDetails.class_day}</p>
            <p><strong>Parent Email:</strong> {studentDetails.parent_email}</p>
          </div>

          <h4>Selective Exam Reports</h4>

          {reports.length === 0 && (
            <p className="empty-state">No Selective exam reports found.</p>
          )}

          <ul>
            {Array.isArray(reports) &&
              reports.map((report, index) => (
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
         STEP 3: VIEW REPORT
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

          <p className="report-disclaimer">
            {selectedReport.disclaimer}
          </p>
        </>
      )}
    </div>
  );
}
