import React from "react";
import "./ExamPage.css";

export default function NaplanLanguageConventionsReport({
  report,
  onViewExamDetails
}) {
  if (!report?.overall) {
    return <p className="loading">Generating your report…</p>;
  }

  const {
    overall,
    topic_wise_performance,
    improvement_areas
  } = report;

  return (
    <div className="report-page">

      {/* ===============================
          HEADER
      =============================== */}
      <h2 className="report-title">
        You scored {overall.correct} out of {overall.total_questions} in NAPLAN
        Language Conventions
      </h2>

      <button
        className="view-exam-btn"
        onClick={onViewExamDetails}
      >
        View Exam Details
      </button>

      <div className="report-grid">

        {/* ===============================
            OVERALL ACCURACY
        =============================== */}
        <div className="report-card">
          <h3>Overall Accuracy</h3>

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
            <p>Score: {overall.score_percent}%</p>
          </div>
        </div>

        {/* ===============================
            TOPIC-WISE PERFORMANCE
        =============================== */}
        <div className="topic-performance-card">
          <h3>Topic-wise Performance</h3>

          {topic_wise_performance.map(t => (
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
                <span className="correct">
                  Correct: {t.correct}
                </span>
                <span className="incorrect">
                  Incorrect: {t.incorrect}
                </span>
                <span className="not-attempted">
                  Not Attempted: {t.not_attempted}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ===============================
            IMPROVEMENT AREAS
        =============================== */}
        <div className="report-card">
          <h3>Improvement Areas</h3>

          {improvement_areas.map(t => (
            <div key={t.topic} className="topic-bar">
              <span>{t.topic}</span>

              <div className="bar">
                <div
                  className="bar-fill"
                  style={{
                    width: `${t.accuracy_percent}%`
                  }}
                />
              </div>

              <span>{t.accuracy_percent}%</span>

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
