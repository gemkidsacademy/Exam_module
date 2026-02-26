import React from "react";
import "./NaplanReadingReport.css";

export default function NaplanReadingReport({
  report,
  onViewExamDetails
}) {
  if (!report) {
    return <p className="loading">Generating your report…</p>;
  }

  const {
    overall = {},
    topic_wise_performance = [],
    improvement_areas = []
  } = report;

  return (
    <div className="report-dashboard">

      {/* =====================================================
         HEADER / ACTION
      ====================================================== */}
      <div className="report-header">
        <button
          className="btn-primary"
          onClick={onViewExamDetails}
        >
          View Exam Details
        </button>
      </div>

      {/* =====================================================
         TOP GRID
      ====================================================== */}
      <div className="report-grid">

        {/* ================= OVERALL ACCURACY ================= */}
        <div className="report-card overall-card">
          <h3 className="card-title">Overall Accuracy</h3>

          <div className="overall-content">
            {/* Donut */}
            <div className="donut">
              <span>{overall.accuracy_percent ?? 0}%</span>
            </div>

            {/* Stats */}
            <div className="overall-stats">
              <div>
                <span>Total Questions</span>
                <strong>{overall.total_questions ?? 0}</strong>
              </div>
              <div>
                <span>Attempted</span>
                <strong>{overall.attempted ?? 0}</strong>
              </div>
              <div>
                <span>Correct</span>
                <strong>{overall.correct ?? 0}</strong>
              </div>
              <div>
                <span>Incorrect</span>
                <strong>{overall.incorrect ?? 0}</strong>
              </div>
              <div>
                <span>Not Attempted</span>
                <strong>{overall.not_attempted ?? 0}</strong>
              </div>
              <div className="score-row">
                <span>Score</span>
                <strong>{overall.score_percent ?? 0}%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ================= TOPIC PERFORMANCE ================= */}
        <div className="report-card">
          <h3 className="card-title">Topic-wise Performance</h3>

          {topic_wise_performance.length === 0 ? (
            <p className="muted">No topic breakdown available.</p>
          ) : (
            topic_wise_performance.map((topic, idx) => (
              <div key={idx} className="topic-row">
                <div className="topic-name">
                  {topic.topic || "Unknown Topic"}
                </div>

                <div className="pill-row">
                  <span className="pill neutral">
                    Attempted {topic.attempted ?? 0}
                  </span>
                  <span className="pill success">
                    Correct {topic.correct ?? 0}
                  </span>
                  <span className="pill danger">
                    Incorrect {topic.incorrect ?? 0}
                  </span>
                  <span className="pill muted">
                    Not Attempted {topic.not_attempted ?? 0}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* =====================================================
         IMPROVEMENT AREAS
      ====================================================== */}
      <div className="report-card">
        <h3 className="card-title">Improvement Areas</h3>

        {improvement_areas.length === 0 ? (
          <p className="positive">
            🎉 Great work! No major weak areas detected.
          </p>
        ) : (
          improvement_areas.map((area, idx) => (
            <div key={idx} className="improvement-row">
              <span className="improve-label">
                {area.topic || "Unknown Topic"}
              </span>

              <div className="progress">
                <div
                  className="progress-fill"
                  style={{
                    width: `${area.accuracy_percent ?? 0}%`
                  }}
                />
              </div>

              <span className="percent">
                {area.accuracy_percent ?? 0}%
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
