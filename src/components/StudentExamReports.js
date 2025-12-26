import React, { useEffect, useState } from "react";
import "./StudentExamReports.css";

const BACKEND_URL = "https://web-production-481a5.up.railway.app";

export default function StudentExamReports() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentDetails, setStudentDetails] = useState(null);

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState("");

  /* ============================
     Helpers
  ============================ */
  const groupReportsByDate = (reports) => {
    const grouped = {};
    reports.forEach((r) => {
      const date = new Date(r.created_at).toISOString().split("T")[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(r);
    });
    return grouped;
  };

  const formatExamName = (type) => {
    if (!type) return "";
    if (type === "mathematical_reasoning") return "Mathematical Reasoning";
    if (type === "thinking_skills" || type === "Thinking Skills")
      return "Thinking Skills";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  /* ============================
     Load Students
  ============================ */
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/admin/students`)
      .then((res) => res.json())
      .then(setStudents)
      .catch(() => alert("Failed to load students"));
  }, []);

  /* ============================
     Load Student Details
  ============================ */
  useEffect(() => {
    if (!selectedStudentId) return;

    fetch(`${BACKEND_URL}/api/admin/students/${selectedStudentId}`)
      .then((res) => res.json())
      .then((data) => {
        setStudentDetails(data);
        setReports([]);
        setSelectedDate("");
      })
      .catch(() => alert("Failed to load student details"));
  }, [selectedStudentId]);

  /* ============================
     Load Selective Reports
  ============================ */
  useEffect(() => {
    if (!selectedStudentId) return;

    setReportsLoading(true);

    fetch(
      `${BACKEND_URL}/api/admin/students/${selectedStudentId}/selective-reports`
    )
      .then((res) => res.json())
      .then((data) => {
        setReports(Array.isArray(data.reports) ? data.reports : []);
      })
      .catch(() => setReports([]))
      .finally(() => setReportsLoading(false));
  }, [selectedStudentId]);

  /* ============================
     Derived State
  ============================ */
  const groupedReports = groupReportsByDate(reports);
  const availableDates = Object.keys(groupedReports).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  /* ============================
     UI
  ============================ */
  return (
    <div className="student-exam-reports">
      <h2>Student Exam Reports</h2>

      {/* STEP 1: SELECT STUDENT */}
      {!studentDetails && (
        <>
          <h4>Select Student</h4>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            <option value="">-- Select Student ID --</option>
            {students.map((s) => (
              <option key={s.student_id} value={s.student_id}>
                {s.student_id} – {s.name}
              </option>
            ))}
          </select>
        </>
      )}

      {/* STEP 2: STUDENT CONTEXT */}
      {studentDetails && (
        <>
          <button
            onClick={() => {
              setSelectedStudentId("");
              setStudentDetails(null);
              setReports([]);
              setSelectedDate("");
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

          <h4>Selective Exam Attempts</h4>

          {reportsLoading && <p>Loading reports…</p>}

          {!reportsLoading && availableDates.length === 0 && (
            <p className="empty-state">No Selective exam reports found.</p>
          )}

          {/* STEP 3: SELECT ATTEMPT DATE */}
          {availableDates.length > 0 && (
            <>
              <label>Select Attempt</label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <option value="">-- Select Attempt --</option>
                {availableDates.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </>
          )}
        </>
      )}

      {/* STEP 4: SHOW ALL EXAMS FOR DATE */}
      {selectedDate && (
        <div className="attempt-report-group">
          <h3>Exam Reports – {selectedDate}</h3>

          {groupedReports[selectedDate].map((report) => (
            <div key={report.id} className="exam-report-card">
              <h4>{formatExamName(report.exam_type)}</h4>

              <p>
                <strong>Overall Readiness:</strong>{" "}
                {report.readiness_band}
              </p>

              <p>
                <strong>School Guidance:</strong>{" "}
                {report.school_guidance_level}
              </p>

              <h5>Section Performance</h5>
              <ul className="section-list">
                {Array.isArray(report.sections) &&
                  report.sections.map((section) => (
                    <li key={section.section_name}>
                      <strong>{section.section_name}</strong> –{" "}
                      {section.performance_band}
                    </li>
                  ))}
              </ul>

              <p className="report-disclaimer">{report.disclaimer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
