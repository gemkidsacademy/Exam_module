import React from "react";
import "./ExamPage.css";

function NaplanNumeracyReport({
  report,
  examDates,
  selectedExamId,
  onExamChange,
  onViewExamDetails,
  onBackToDashboard
}) {
  // 🔥 1. Loading state
if (report === undefined) {
  return <p className="loading">Loading report…</p>;
}

// 🔥 2. No data state
if (!report || report.status === "no_data" || !report.overall) {
  return (
    <div className="empty-state">
      <h3>📭 No reports available</h3>
      <p>This student has not completed this exam yet.</p>

      {examDates?.length > 0 && (
        <select
          className="exam-dropdown"
          value={selectedExamId || ""}
          onChange={(e) => onExamChange(Number(e.target.value))}
        >
          {examDates.map((d) => (
            <option key={d.exam_id} value={d.exam_id}>
              {new Date(d.date).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

  const {
    overall,
    topic_wise_performance,
    improvement_areas
  } = report;
  
console.log(
  "📊 IMPROVEMENT AREAS DATA",
  improvement_areas
);

  return (
    <div className="report-page">

      {/* ===============================
          HEADER
      =============================== */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "20px"
        }}
      >
        <button
          onClick={onBackToDashboard}
          style={{
            padding: "10px 18px",
            background: "#0d8ecf",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
      <h2 className="report-title">
        You scored {overall.correct} out of {overall.total_questions} in NAPLAN Numeracy
      </h2>

      {/* 🔥 DROPDOWN (NEW POSITION) */}
      <div className="report-header-row">
        {examDates?.length > 0 && (
          <select
            className="exam-dropdown"
            value={selectedExamId || ""}
            onChange={(e) => onExamChange(Number(e.target.value))}
          >
            {examDates.map((d) => (
              <option key={d.exam_id} value={d.exam_id}>
                {new Date(d.date).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </option>
            ))}
          </select>
        )}
      
        <button
          className="view-exam-btn"
          onClick={onViewExamDetails}
        >
          View Exam Details
        </button>
      </div>
      

      <div className="report-grid">

        {/* ===============================
            OVERALL ACCURACY
        =============================== */}
        <div className="report-card">
          <h3>Overall Score</h3>

          {(() => {
            const accuracy = Math.round(
              (overall.correct / overall.total_questions) * 100
            );

            const donutBackground =
              accuracy === 0
                ? "#e5e7eb"
                : `conic-gradient(
                    #22c55e ${accuracy * 3.6}deg,
                    #e5e7eb 0deg
                  )`;

            return (
              <div className="donut-wrapper">
                <div
                  className="donut"
                  style={{ background: donutBackground }}
                >
                  <span className="donut-text">
                    {accuracy}%
                  </span>
                </div>
              </div>
            );
          })()}

          <div className="stats">
            <p>Total Questions: {overall.total_questions}</p>
            <p>Attempted: {overall.attempted}</p>
            <p>Correct: {overall.correct}</p>
            <p>Incorrect: {overall.incorrect}</p>
            <p>Not Attempted: {overall.not_attempted}</p>
            <p>Accuracy: {overall.score_percent}%</p>
          </div>
        </div>

        {/* ===============================
            TOPIC-WISE PERFORMANCE
        =============================== */}
        <div className="topic-performance-card">
          <h3>Topic-wise Performance</h3>

          {topic_wise_performance.map((t) => (
            <div key={t.topic} className="topic-row">
              <div className="topic-title">
                {t.topic}
              </div>

              <div className="stack-bar">
                <div
                  className="stack correct"
                  style={{
                    width: `${(t.correct / t.total) * 100}%`
                  }}
                />
                <div
                  className="stack incorrect"
                  style={{
                    width: `${(t.incorrect / t.total) * 100}%`
                  }}
                />
                <div
                  className="stack not-attempted"
                  style={{
                    width: `${(t.not_attempted / t.total) * 100}%`
                  }}
                />
              </div>

              <div className="topic-metrics">
                <span>Attempted: {t.attempted}</span>
                <span className="correct">Correct: {t.correct}</span>
                <span className="incorrect">Incorrect: {t.incorrect}</span>
                <span className="not-attempted">Not Attempted: {t.not_attempted}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ===============================
            IMPROVEMENT AREAS
        =============================== */}
        <div className="report-card">
          <h3>Improvement Areas</h3>

          {improvement_areas.map((t) => (
            <div key={t.topic} className="topic-bar">
              <span>{t.topic}</span>

              <div className="bar">
                <div
                  className="bar-fill"
                  style={{
                    width: `${t.mastery_percent}%`
                  }}
                />
              </div>

              <span>{t.mastery_percent}%</span>

              {t.limited_data && (
                <small className="warning">
                  Limited data
                </small>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
export default NaplanNumeracyReport;