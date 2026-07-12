import React from "react";
import "./NaplanReadingReport.css";

function NaplanReadingReport({
  report,
  examDates,
  selectedExamId,
  onExamChange,
  onViewExamDetails,
  onBackToDashboard
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
      <div
        className="report-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px"
        }}
      >
        <button
          className="btn-primary"
          onClick={onViewExamDetails}
        >
          View Exam Details
        </button>

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

      {/* =====================================================
         TOP GRID
      ====================================================== */}
      <div className="report-grid">

        {/* ================= OVERALL ACCURACY ================= */}
        <div className="report-card overall-card">
          <h3 className="card-title">Overall Score</h3>

          <div className="overall-content">
            {/* Donut */}
            <div className="donut">
              <span>
                {overall.attempted
                  ? ((overall.correct / overall.total_questions) * 100).toFixed(2)
                  : "0.00"}
                %
              </span>
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
                <span>Accuracy</span>
                <strong>
                  {overall.attempted > 0
                    ? ((overall.correct / overall.attempted) * 100).toFixed(2)
                    : 0}
                  %
                </strong>
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

                <div
                style={{
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid #e5e7eb"
                }}
              >
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "14px",
                    marginBottom: "6px"
                  }}
                >
                  {topic.topic}
                </div>

                <div
                  style={{
                    color: "#22c55e",
                    fontWeight: "700",
                    marginBottom: "10px"
                  }}
                >
                  {topic.correct}/{topic.total} Correct
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px"
                  }}
                >
                  <span className="pill neutral">
                    Attempted {topic.attempted}
                  </span>

                  <span className="pill success">
                    Correct {topic.correct}
                  </span>

                  <span className="pill danger">
                    Incorrect {topic.incorrect}
                  </span>

                  <span className="pill muted">
                    Not Attempted {topic.not_attempted}
                  </span>
                </div>
              </div>

                <div className="topic-progress">
                  <div
                    className="topic-progress-fill"
                    style={{
                      width: `${
                        (topic.correct / topic.total) * 100
                      }%`
                    }}
                  />
                </div>

                <div className="pill-row">
                  <span className="pill neutral">
                    Attempted {topic.attempted}
                  </span>

                  <span className="pill success">
                    Correct {topic.correct}
                  </span>

                  <span className="pill danger">
                    Incorrect {topic.incorrect}
                  </span>

                  <span className="pill muted">
                    Not Attempted {topic.not_attempted}
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
            <div
              key={idx}
              className="improvement-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}
            >
              <span
                className="improve-label"
                style={{
                  minWidth: "180px",
                  fontWeight: "600"
                }}
              >
                {area.topic || "Unknown Topic"}
              </span>

              <span
                className="percent"
                style={{
                  color: "#dc2626",
                  fontWeight: "600"
                }}
              >
                {area.accuracy_percent ?? 0}%
              </span>

              <div
                className="progress"
                style={{
                  flex: 1
                }}
              >
                <div
                  className="progress-fill"
                  style={{
                    width: `${area.accuracy_percent ?? 0}%`
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default NaplanReadingReport