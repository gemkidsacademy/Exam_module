import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import "./SelectiveReadinessOverall.css";

const BACKEND_URL = "https://web-production-481a5.up.railway.app";

export default function SelectiveReadinessOverall() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [overall, setOverall] = useState(null);
  const [loading, setLoading] = useState(false);

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

      {/* Student selector */}
      <div className="selector-row">
        <label>Student ID</label>
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">Select student</option>
          {students.map(s => (
            <option key={s.student_id} value={s.student_id}>
              {s.student_id}
            </option>
          ))}
        </select>
      </div>

      {/* Date selector */}
      {selectedStudent && availableDates.length > 0 && (
        <div className="selector-row">
          <label>Exam Attempt Date</label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            <option value="">Select date</option>
            {availableDates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>
      )}

      {selectedStudent && selectedDate && (
        <button className="generate-button" onClick={generateOverallReport}>
          Generate Overall Readiness Report
        </button>
      )}

      {loading && <p className="loading">Loading report...</p>}

      {overall && (
        <div className="overall-summary">
          {/* Score cards */}
          <div className="score-row">
            <div className="score-box">
              <div className="label">Overall Score</div>
              <div className="value">{overall.overall_percent}%</div>
            </div>
            <div className="score-box">
              <div className="label">Readiness Band</div>
              <div className="value">{overall.readiness_band}</div>
            </div>
          </div>

          {/* Balance index */}
          <div className="chart-section">
            <div className="chart-title">Overall Balance Index</div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${balanceIndex}%` }}
              />
            </div>
            <p className="explanation">
              Balance Score: {balanceIndex}% (higher means more evenly balanced
              performance across subjects)
            </p>
          </div>

          {/* Strengths & focus */}
          <div className="chart-section">
            <div className="chart-title">Strengths & Focus Areas</div>
            <p><strong>Strengths:</strong> {strengths.join(", ") || "—"}</p>
            <p><strong>Needs Improvement:</strong> {improvements.join(", ") || "None identified"}</p>
          </div>

          {/* Subject bar chart */}
          <div className="chart-section">
            <div className="chart-title">Subject Performance Overview</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectChartData}>
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Subject focus cards */}
          <div className="chart-section">
            <div className="chart-title">Subject Performance Detail</div>
            {Object.entries(overall.components).map(([k, v]) => (
              <SubjectFocusCard
                key={k}
                subjectKey={k}
                label={SUBJECT_LABELS[k]}
                rawScore={v}
              />
            ))}
          </div>

          {overall.override_flag && (
            <div className="override-warning">
              ⚠️ {overall.override_message}
            </div>
          )}

          {/* Table */}
          <h4>Component Breakdown</h4>
          <table className="breakdown-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Raw Score</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(overall.components).map(([k, v]) => (
                <tr key={k}>
                  <td>{SUBJECT_LABELS[k]}</td>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Recommendations */}
          <div className="school-targets">
            <h4 className="recommendation-title">
              {overall.readiness_band.startsWith("Band 4")
                ? "Recommended Next Steps"
                : "Recommended School Targets"}
            </h4>
            <div
              className={`recommendation-box ${
                overall.readiness_band.startsWith("Band 4") ? "warning" : ""
              }`}
            >
              <ul>
                {overall.school_recommendation.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="explanation">
            Overall Selective Readiness is calculated as an equal-weight average
            of Reading, Mathematical Reasoning, Thinking Skills, and Writing.
            Results are advisory only.
          </p>
        </div>
      )}
    </div>
  );
}
