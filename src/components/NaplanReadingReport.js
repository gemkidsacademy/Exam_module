import React from "react";
import "./NaplanReadingReport.css";

/* ============================================================
   NAPLAN READING REPORT
============================================================ */
export default function NaplanReadingReport({
  report,
  onViewExamDetails
}) {
  if (!report) {
    return <p className="loading">Generating your report…</p>;
  }

  const {
    overall,
    topic_wise_performance,
    improvement_areas
  } = report;

  return (
    <div className="report-container">
      <h2 className="report-title">NAPLAN Reading Report</h2>

      {/* =============================
          OVERALL SUMMARY
      ============================== */}
      <div className="report-card summary">
        <h3>Overall Performance</h3>

        <div className="summary-grid">
          <div>
            <span className="label">Score</span>
            <span className="value">
              {overall.correct} / {overall.total}
            </span>
          </div>

          <div>
            <span className="label">Accuracy</span>
            <span className="value">
              {overall.percentage}%
            </span>
          </div>

          <div>
            <span className="label">Time Taken</span>
            <span className="value">
              {overall.time_taken_minutes} min
            </span>
          </div>
        </div>
      </div>

      {/* =============================
          TOPIC PERFORMANCE
      ============================== */}
      <div className="report-card">
        <h3>Performance by Topic</h3>

        {topic_wise_performance.length === 0 ? (
          <p>No topic breakdown available.</p>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Correct</th>
                <th>Total</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {topic_wise_performance.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.topic}</td>
                  <td>{row.correct}</td>
                  <td>{row.total}</td>
                  <td>{row.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* =============================
          IMPROVEMENT AREAS
      ============================== */}
      <div className="report-card">
        <h3>Areas to Improve</h3>

        {improvement_areas.length === 0 ? (
          <p className="positive">
            🎉 Great work! No major weak areas detected.
          </p>
        ) : (
          <ul className="improvement-list">
            {improvement_areas.map((area, idx) => (
              <li key={idx}>
                <strong>{area.topic}</strong> — accuracy {area.percentage}%
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* =============================
          ACTIONS
      ============================== */}
      <div className="report-actions">
        <button
          className="btn-primary"
          onClick={onViewExamDetails}
        >
          Review Exam
        </button>
      </div>
    </div>
  );
}
