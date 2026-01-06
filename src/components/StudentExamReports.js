import React, { useEffect, useState } from "react";
import "./StudentExamReports.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

const BACKEND_URL = "https://web-production-481a5.up.railway.app";

/* ============================
   CONSTANTS
============================ */

const READINESS_SCORE_MAP = {
  "Not Yet Selective Ready": 30,
  "Developing Selective Potential": 50,
  "Approaching Selective Readiness": 70,
  "Strong Selective Potential": 90,
  "Ready": 85
};

const SECTION_GRADE_MAP = {
  A: 90,
  B: 75,
  C: 60,
  D: 40
};

/* ============================
   COMPONENT
============================ */

export default function StudentExamReports() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentDetails, setStudentDetails] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  /* ============================
     Helpers
  ============================ */

  const formatExamName = (type) =>
    type ? type.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase()) : "Unknown Exam";

  /* ============================
     Data Fetching
  ============================ */

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/admin/students`)
      .then(res => res.json())
      .then(data => setStudents(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (!selectedStudentId) return;

    fetch(`${BACKEND_URL}/api/admin/students/${selectedStudentId}`)
      .then(res => res.json())
      .then(data => {
        setStudentDetails(data);
        setReports([]);
        setSelectedDate("");
      });
  }, [selectedStudentId]);

  useEffect(() => {
    if (!selectedStudentId) return;

    fetch(
      `${BACKEND_URL}/api/admin/students/${selectedStudentId}/selective-report-dates`
    )
      .then(res => res.json())
      .then(data => setAvailableDates(Array.isArray(data) ? data : []));
  }, [selectedStudentId]);

  useEffect(() => {
    if (!selectedStudentId || !selectedDate) return;

    setReportsLoading(true);

    fetch(
      `${BACKEND_URL}/api/admin/students/${selectedStudentId}/selective-reports?exam_date=${selectedDate}`
    )
      .then(res => res.json())
      .then(data => setReports(Array.isArray(data) ? data : []))
      .finally(() => setReportsLoading(false));
  }, [selectedStudentId, selectedDate]);

  /* ============================
     UI
  ============================ */

  return (
    <div className="student-exam-reports">
      <h2>Student Exam Reports</h2>

      {!studentDetails && (
        <select
          value={selectedStudentId}
          onChange={e => setSelectedStudentId(e.target.value)}
        >
          <option value="">-- Select Student --</option>
          {students.map(s => (
            <option key={s.student_id} value={s.student_id}>
              {s.student_id} – {s.name}
            </option>
          ))}
        </select>
      )}

      {studentDetails && (
        <>
          <button onClick={() => {
            setSelectedStudentId("");
            setStudentDetails(null);
            setReports([]);
            setSelectedDate("");
          }}>
            ← Back
          </button>

          <h4>{studentDetails.name}</h4>

          <select
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          >
            <option value="">-- Select Attempt Date --</option>
            {availableDates.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </>
      )}

      {reportsLoading && <p>Loading reports…</p>}

      {reports.map(report => {
        const sectionChartData = report.sections.map(s => ({
          section: s.section_name,
          score: SECTION_GRADE_MAP[s.performance_band] || 0
        }));

        
        return (
          <div key={report.id} className="exam-report-card">

            <h4>{formatExamName(report.exam_type)}</h4>

            {/* Overall Readiness */}
            <div className="summary-box">
              <strong>{report.readiness_band}</strong>
              <div className="readiness-bar">
                <div
                  className="readiness-fill"
                  style={{
                    width: `${READINESS_SCORE_MAP[report.readiness_band] || 0}%`
                  }}
                />
              </div>
            </div>

            
            {report.exam_type !== "writing" && (
              <>
                <h5>Section Performance</h5>
                <div style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer>
                    <BarChart data={sectionChartData}>
                      <XAxis dataKey="section" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            
            <p className="report-disclaimer">{report.disclaimer}</p>
          </div>
        );
      })}

      
    </div>
  );
}
