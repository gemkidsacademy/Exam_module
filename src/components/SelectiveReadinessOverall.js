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
     Load students
  ============================ */
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/admin/students`)
      .then((res) => res.json())
      .then((data) => setStudents(Array.isArray(data) ? data : []));
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
      .then((res) => res.json())
      .then((data) => {
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
     Prepare chart data
  ============================ */
  const subjectChartData = overall
    ? Object.entries(overall.components).map(([key, value]) => ({
        subject: SUBJECT_LABELS[key] || key,
        score:
          key === "writing"
            ? Math.round((value / 20) * 100)
            : value,
      }))
    : [];

  const writingPercent = overall
    ? Math.round((overall.components.writing / 20) * 100)
    : 0;

  /* ============================
     UI
  ============================ */
  return (
    <div className="overall-readiness-container">
      <h2 className="overall-title">Overall Selective Readiness</h2>

      {/* Student Selector */}
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

      {/* Exam Date Selector */}
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

      {/* Generate Button */}
      {selectedStudent && selectedDate && (
        <button className="generate-button" onClick={generateOverallReport}>
          Generate Overall Readiness Report
        </button>
      )}

      {loading && <p className="loading">Loading report...</p>}

      {/* ============================
         OVERALL REPORT
      ============================ */}
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

          {/* Subject comparison chart */}
          <div className="chart-section">
            <div className="chart-title">Subject Performance Overview</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectChartData}>
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar
                  dataKey="score"
                  fill="#2563eb"     // ✅ same blue as your button
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Writing focus */}
          <div className="writing-focus">
            <h4>Writing Performance</h4>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${writingPercent}%` }}
              />
            </div>
            <p>
              Writing Score: {overall.components.writing} / 20 (
              {writingPercent}%)
            </p>
          </div>

          {/* Override warning */}
          {overall.override_flag && (
            <div className="override-warning">
              ⚠️ {overall.override_message}
            </div>
          )}

          {/* Component table */}
          <h4>Component Breakdown</h4>
          <table className="breakdown-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Raw Score</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(overall.components).map(([subject, score]) => (
                <tr key={subject}>
                  <td>{SUBJECT_LABELS[subject]}</td>
                  <td>{score}</td>
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
                {overall.school_recommendation.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="explanation">
            Overall Selective Readiness is calculated as an equal-weight average
            of Reading, Mathematical Reasoning, Thinking Skills, and Writing.
            Results are rule-based and advisory only.
          </p>
        </div>
      )}
    </div>
  );
}
