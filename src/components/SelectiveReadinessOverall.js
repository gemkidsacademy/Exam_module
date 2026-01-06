import { useEffect, useState } from "react";
import "./SelectiveReadinessOverall.css";

const BACKEND_URL = "https://web-production-481a5.up.railway.app";

export default function SelectiveReadinessOverall() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [reports, setReports] = useState([]);
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
     Load AVAILABLE EXAM DATES
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
        setReports([]);
        setOverall(null);
      })
      .finally(() => setLoading(false));
  }, [selectedStudent]);

  /* ============================
     Load selective reports FOR DATE
  ============================ */
  useEffect(() => {
    if (!selectedStudent || !selectedDate) return;

    setLoading(true);

    fetch(
      `${BACKEND_URL}/api/admin/students/${selectedStudent}/selective-reports?exam_date=${selectedDate}`
    )
      .then((res) => res.json())
      .then((data) => {
        setReports(Array.isArray(data) ? data : []);
        setOverall(null);
      })
      .finally(() => setLoading(false));
  }, [selectedStudent, selectedDate]);

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
     UI
  ============================ */
  return (
    <div className="overall-readiness-container">
      <h2>Selective Readiness (Overall)</h2>

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
        <div className="generate-row">
          <button className="generate-button" onClick={generateOverallReport}>
            Generate Overall Readiness Report
          </button>
        </div>
      )}

      {loading && <p className="loading">Loading report...</p>}

      {/* ============================
         OVERALL REPORT
      ============================ */}
      {overall && (
        <div className="overall-summary">
          <h3 className="overall-title">Overall Selective Readiness</h3>

          <div className="score-row">
            <div className="score-box">
              <span className="label">Overall Score: </span>
              <span className="value">{overall.overall_percent}%</span>
            </div>

            <div className="score-box">
              <span className="label">Readiness Band: </span>
              <span className="value">{overall.readiness_band}</span>
            </div>
          </div>

          {overall.override_flag && (
            <div className="override-warning">
              ⚠️ {overall.override_message}
            </div>
          )}

          <h4>Component Breakdown</h4>

          <table className="breakdown-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(overall.components || {}).map(
                ([subject, score]) => (
                  <tr key={subject}>
                    <td>{SUBJECT_LABELS[subject] || subject}</td>
                    <td>{score}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          <h4 className="recommendation-title">
            {overall.readiness_band.startsWith("Band 4")
              ? "Recommended Next Steps"
              : "Recommended School Targets"}
          </h4>

          <div
            className={
              overall.readiness_band.startsWith("Band 4")
                ? "recommendation-box warning"
                : "recommendation-box"
            }
          >
            <ul>
              {overall.school_recommendation?.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <p className="explanation">
            Overall Selective Readiness is calculated as an equal-weight
            average of Reading, Mathematical Reasoning, Thinking Skills,
            and Writing. Results are rule-based and advisory only.
          </p>
        </div>
      )}

      {!loading && selectedDate && !overall && (
        <p className="empty">
          Overall readiness will be available once all four exams are completed
          for this attempt.
        </p>
      )}
    </div>
  );
}
