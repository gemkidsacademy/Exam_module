import { useEffect, useState, useRef } from "react";
import PrintRoot from "./PrintRoot";
import ReportContent from "./ReportContent";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useReactToPrint } from "react-to-print";

import "./SelectiveReadinessOverall.css";

const BACKEND_URL = "https://web-production-481a5.up.railway.app";

export default function SelectiveReadinessOverall() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [overall, setOverall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef();
  
  const handlePrint = useReactToPrint({
  content: () => printRef.current,
  documentTitle: "Selective_Readiness_Report",
  removeAfterPrint: false,
});



  
  const SUBJECT_LABELS = {
    reading: "Reading",
    mathematical_reasoning: "Mathematical Reasoning",
    thinking_skills: "Thinking Skills",
    writing: "Writing",
  };

  /* ============================
     Helpers
  ============================ */
  const normalizeScore = (subject, value) =>
    subject === "writing" ? Math.round((value / 20) * 100) : value;

  

  /* ============================
     Load students
  ============================ */
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/admin/students`)
      .then(res => res.json())
      .then(data => setStudents(Array.isArray(data) ? data : []));
  }, []);

  /* ============================
     Load available exam dates
  ============================ */
  useEffect(() => {
    if (!selectedStudent) return;

    setLoading(true);
    fetch(
      `${BACKEND_URL}/api/admin/students/${selectedStudent}/selective-report-dates`
    )
      .then(res => res.json())
      .then(data => {
        setAvailableDates(Array.isArray(data) ? data : []);
        setSelectedDate("");
        setOverall(null);
      })
      .finally(() => setLoading(false));
  }, [selectedStudent]);

  /* ============================
     Generate Overall Report
  ============================ */
  const generateOverallReport = async () => {
    if (!selectedStudent || !selectedDate) return;

    setLoading(true);
    const res = await fetch(
      `${BACKEND_URL}/api/admin/students/${selectedStudent}/overall-selective-report?exam_date=${selectedDate}`,
      { method: "POST" }
    );
    const data = await res.json();
    setOverall(data);
    setLoading(false);
  };

  /* ============================
     Derived visuals
  ============================ */
  const subjectChartData = overall
    ? Object.entries(overall.components).map(([k, v]) => ({
        subject: SUBJECT_LABELS[k],
        score: normalizeScore(k, v),
      }))
    : [];

  let balanceIndex = null;
  let rawBalance = null;
  let strengths = [];
  let improvements = [];
  
  if (overall) {
    const normalizedScores = Object.entries(overall.components).map(
      ([k, v]) => normalizeScore(k, v)
    );
  
    // 1️⃣ Compute raw balance (true mathematical value)
    rawBalance =
      100 - (Math.max(...normalizedScores) - Math.min(...normalizedScores));
  
    // 2️⃣ Clamp for UI so bar never appears "empty"
    balanceIndex = Math.max(15, Math.round(rawBalance));
  
    // 3️⃣ Strengths vs improvements
    Object.entries(overall.components).forEach(([k, v]) => {
      const pct = normalizeScore(k, v);
      if (pct >= 90) strengths.push(SUBJECT_LABELS[k]);
      else improvements.push(SUBJECT_LABELS[k]);
    });
  }

  /* ============================
     Subject Focus Card
  ============================ */
  function SubjectFocusCard({ subjectKey, label, rawScore }) {
    const percent = normalizeScore(subjectKey, rawScore);
  
    const isWarning =
      subjectKey === "writing" && percent < 95;
  
    return (
      <div className={`subject-focus ${isWarning ? "warning" : ""}`}>
        <h4>{label} Performance</h4>
  
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${percent}%`,
              background: isWarning
                ? "linear-gradient(90deg,#f59e0b,#f97316)"
                : "#2563eb"
            }}
          />
        </div>
  
        <p>
          {label} Score: {rawScore}
          {subjectKey === "writing" ? " / 20" : " / 100"} ({percent}%)
        </p>
      </div>
    );
  }

  
  /* ============================
     UI
  ============================ */
  return (
  <div className="overall-readiness-container">
    <h2 className="overall-title">Overall Selective Readiness</h2>

    {/* ================= STUDENT SELECTOR ================= */}
    <div className="selector-row">
      <label>Student ID</label>
      <select
        value={selectedStudent}
        onChange={(e) => setSelectedStudent(e.target.value)}
      >
        <option value="">Select student</option>
        {students.map((s) => (
          <option key={s.student_id} value={s.student_id}>
            {s.student_id}
          </option>
        ))}
      </select>
    </div>

    {/* ================= DATE SELECTOR ================= */}
    {selectedStudent && availableDates.length > 0 && (
      <div className="selector-row">
        <label>Exam Attempt Date</label>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          <option value="">Select date</option>
          {availableDates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>
    )}

    {/* ================= ACTION BUTTONS ================= */}
    {selectedStudent && selectedDate && (
      <div className="action-row">
        <button
          className="generate-button"
          onClick={generateOverallReport}
        >
          Generate Overall Readiness Report
        </button>

        {overall && (
          <button
            className="generate-button secondary"
            onClick={() => setShowPreview(true)}
          >
            Preview PDF
          </button>
        )}
      </div>
    )}

    {/* ================= SCREEN REPORT ================= */}
    {overall && (
      <div className="overall-summary">
        <ReportContent
          overall={overall}
          balanceIndex={balanceIndex}
          strengths={strengths}
          improvements={improvements}
          subjectChartData={subjectChartData}
          SUBJECT_LABELS={SUBJECT_LABELS}
          SubjectFocusCard={SubjectFocusCard}
        />
      </div>
    )}

    {/* ================= PDF PREVIEW MODAL ================= */}
    {showPreview && overall && (
      <div className="pdf-modal-overlay">
        <div className="pdf-modal">
          <div className="pdf-toolbar">
            <button
              onClick={handlePrint}
              disabled={!printRef.current}
            >
              Save / Print PDF
            </button>

            <button onClick={() => setShowPreview(false)}>Close</button>
          </div>

          <div className="pdf-preview-body">
            <div className="overall-summary">
              <ReportContent
                overall={overall}
                balanceIndex={balanceIndex}
                strengths={strengths}
                improvements={improvements}
                subjectChartData={subjectChartData}
                SUBJECT_LABELS={SUBJECT_LABELS}
                SubjectFocusCard={SubjectFocusCard}
              />
            </div>
          </div>
        </div>
      </div>
    )}

    {overall && (
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <PrintRoot
          ref={printRef}
          overall={overall}
          balanceIndex={balanceIndex}
          strengths={strengths}
          improvements={improvements}
          subjectChartData={subjectChartData}
          SUBJECT_LABELS={SUBJECT_LABELS}
        />
      </div>
    )}
    
   </div>
);
}
