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
      if (!r.exam_date) return;
  
      if (!grouped[r.exam_date]) {
        grouped[r.exam_date] = [];
      }
  
      grouped[r.exam_date].push(r);
    });
  
    return grouped;
  };


  const formatExamName = (type) => {
    if (!type) return "Unknown Exam";
    if (type === "mathematical_reasoning") return "Mathematical Reasoning";
    if (type === "thinking_skills" || type === "Thinking Skills")
      return "Thinking Skills";
    return type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  /* ============================
     Load Students
  ============================ */
  useEffect(() => {
  console.log("📡 Fetching students list…");

  fetch(`${BACKEND_URL}/api/admin/students`)
    .then((res) => res.json())
    .then((data) => {
      console.log("✅ Students fetched:", data);
      setStudents(Array.isArray(data) ? data : []);
    })
    .catch((err) => {
      console.error("❌ Failed to load students:", err);
      alert("Failed to load students");
    });
}, []);

  /* ============================
     Load Student Details
  ============================ */
  useEffect(() => {
    if (!selectedStudentId) return;

    console.log("👤 Selected student:", selectedStudentId);
    console.log(
      "➡️ Fetching student details:",
      `${BACKEND_URL}/api/admin/students/${selectedStudentId}`
    );

    fetch(`${BACKEND_URL}/api/admin/students/${selectedStudentId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Student details fetched:", data);
        setStudentDetails(data);
        setReports([]);
        setSelectedDate("");
      })
      .catch((err) => {
        console.error("❌ Failed to load student details:", err);
        alert("Failed to load student details");
      });
  }, [selectedStudentId]);

  /* ============================
     Load Selective Reports
  ============================ */
  useEffect(() => {
  if (!selectedStudentId) return;

  console.log("📊 Fetching selective reports for:", selectedStudentId);
  setReportsLoading(true);

  fetch(
    `${BACKEND_URL}/api/admin/students/${selectedStudentId}/selective-reports`
  )
    .then((res) => res.json())
    .then((data) => {
      console.log("📦 Raw selective-reports response:", data);

      // Backend returns an ARRAY directly
      if (Array.isArray(data)) {
        console.log("✅ Reports array received. Count:", data.length);
        setReports(data);
      } else {
        console.warn("⚠️ Unexpected reports response shape:", data);
        setReports([]);
      }
    })
    .catch((err) => {
      console.error("❌ Failed to load selective reports:", err);
      setReports([]);
    })
    .finally(() => {
      setReportsLoading(false);
      console.log("📊 Reports loading finished");
    });
}, [selectedStudentId]);


  /* ============================
     Derived State
  ============================ */
  const groupedReports = groupReportsByDate(reports);

  const availableDates = Object.keys(groupedReports).sort(
    (a, b) => new Date(b) - new Date(a)
  );


  

  console.log("🧪 availableDates:", availableDates);
  console.log("🧪 selectedDate:", selectedDate);

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
            onChange={(e) => {
              console.log("🟡 Student dropdown changed:", e.target.value);
              setSelectedStudentId(e.target.value);
            }}
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
              console.log("↩️ Resetting student selection");
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
            <>
              <p className="empty-state">
                No Selective exam reports found.
              </p>
              <pre className="debug-box">
                reports.length = {reports.length}
              </pre>
            </>
          )}

          {/* STEP 3: SELECT ATTEMPT DATE */}
          {availableDates.length > 0 && (
            <>
              <label>Select Attempt Date</label>

                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                >
                  <option value="">-- Select Date --</option>
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
          <h3 className="attempt-title">
            Exam Reports – {selectedDate}
          </h3>
        
          {groupedReports[selectedDate]?.map((report) => (
            <div key={report.id} className="exam-report-card">
              {/* Header */}
              <div className="exam-header">
                <h4>{formatExamName(report.exam_type)}</h4>
              </div>
        
              {/* Summary Row */}
              <div className="exam-summary-row">
                <div className="summary-box">
                  <span className="label">Overall Readiness</span>
                  <span className="value">
                    {report.readiness_band}
                  </span>
                </div>
        
                <div className="summary-box">
                  <span className="label">School Guidance</span>
                  <span className="value">
                    {report.school_guidance_level}
                  </span>
                </div>
              </div>
        
              {/* Section Performance */}
              <h5 className="section-title">Section Performance</h5>
        
              <div className="section-grid">
                {Array.isArray(report.sections) &&
                  report.sections.map((section) => (
                    <div
                      key={section.section_name}
                      className="section-card"
                    >
                      <span className="section-name">
                        {section.section_name}
                      </span>
                      <span className="section-band">
                        {section.performance_band}
                      </span>
                    </div>
                  ))}
              </div>
        
              {/* Disclaimer */}
              <p className="report-disclaimer">
                {report.disclaimer}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
