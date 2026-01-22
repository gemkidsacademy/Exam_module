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
  const [error, setError] = useState(null);

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [overall, setOverall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
  contentRef: printRef,
  documentTitle: "Selective_Readiness_Report",
});
const MAX_SCORES = {
  reading: 100,
  mathematical_reasoning: 100,
  thinking_skills: 100,
  writing: 25,
};







  
  const SUBJECT_LABELS = {
    reading: "Reading",
    mathematical_reasoning: "Mathematical Reasoning",
    thinking_skills: "Thinking Skills",
    writing: "Writing",
  };

  /* ============================
     Helpers
  ============================ */
  const normalizeScore = (subject, value) => {
    const max = MAX_SCORES[subject];
    return Math.round((value / max) * 100);
  };

  

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
  setError(null);
  setOverall(null);

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/admin/students/${selectedStudent}/overall-selective-report?exam_date=${selectedDate}`,
      { method: "POST" }
    );

    const data = await res.json();

    if (!res.ok) {
      // Backend-controlled error handling
      setError(data);
      setShowPreview(false);

      return;
    }

    setOverall(data);
  } catch (err) {
    setError({
      code: "NETWORK_ERROR",
      message: "Unable to reach server. Please try again."
    });
  } finally {
    setLoading(false);
  }
};


  /* ============================
     Derived visuals
  ============================ */
  const subjectChartData =
  overall && overall.components
    ? Object.entries(overall.components).map(([k, v]) => ({
        subject: SUBJECT_LABELS[k],
        score: normalizeScore(k, v),
      }))
    : [];


  let balanceIndex = null;
  let rawBalance = null;
  let strengths = [];
  let improvements = [];
  
  if (overall && overall.components) {
  const normalizedScores = Object.entries(overall.components).map(
    ([k, v]) => normalizeScore(k, v)
  );

  rawBalance =
    100 - (Math.max(...normalizedScores) - Math.min(...normalizedScores));

  balanceIndex = Math.max(15, Math.round(rawBalance));

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
          {label} Score: {rawScore} / {MAX_SCORES[subjectKey]} ({percent}%)
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
              Week starting {date}
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
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Overall Readiness Report"}
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
    {error && (
      <div className="error-box">
        <h4>Unable to Generate Report because the student has not attempted all four exams</h4>
    
        <p>{error.message}</p>
    
        {error.code === "INCOMPLETE_EXAMS" && (
          <p>
            Missing exams:{" "}
            <strong>{error.missing_subjects.join(", ")}</strong>
          </p>
        )}
    
        {error.code === "NO_EXAMS_FOUND" && (
          <p>
            The student has not attempted any exams on the selected date.
          </p>
        )}
      </div>
    )}

    {/* ================= SCREEN REPORT ================= */}
    {overall && !error && (

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
  onClick={() => {
    console.group("🖨️ PRINT DEBUG");

    console.log("1️⃣ printRef.current:", printRef.current);

    if (printRef.current) {
      console.log(
        "2️⃣ innerHTML length:",
        printRef.current.innerHTML.length
      );

      console.log(
        "3️⃣ innerHTML preview:",
        printRef.current.innerHTML.slice(0, 300)
      );

      console.log(
        "4️⃣ childElementCount:",
        printRef.current.childElementCount
      );

      console.log(
        "5️⃣ offsetHeight:",
        printRef.current.offsetHeight
      );
    }

    console.groupEnd();

    handlePrint();
  }}
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

    <div className="print-only">
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

    
   </div>
);
}
