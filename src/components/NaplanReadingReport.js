export default function NaplanReadingReport({ report, onViewExamDetails }) {
  if (!report) return null;

  const {
    overall,
    topic_wise_performance,
    improvement_areas
  } = report;

  return (
    <div className="report-dashboard">

      {/* HEADER */}
      <div className="report-header">
        <button className="btn-primary" onClick={onViewExamDetails}>
          View Exam Details
        </button>
      </div>

      {/* TOP ROW */}
      <div className="report-grid-2">

        {/* OVERALL ACCURACY */}
        <div className="report-card">
          <h3>Overall Accuracy</h3>

          <div className="donut-wrapper">
            <div className="donut">
              <span>{overall.accuracy_percent}%</span>
            </div>
          </div>

          <div className="stats">
            <div>Total Questions: {overall.total_questions}</div>
            <div>Attempted: {overall.attempted}</div>
            <div>Correct: {overall.correct}</div>
            <div>Incorrect: {overall.incorrect}</div>
            <div>Not Attempted: {overall.not_attempted}</div>
            <div>Score: {overall.score_percent}%</div>
          </div>
        </div>

        {/* TOPIC PERFORMANCE */}
        <div className="report-card">
          <h3>Topic-wise Performance</h3>

          {topic_wise_performance.map((t, idx) => (
            <div key={idx} className="topic-row">
              <div className="topic-title">{t.topic}</div>

              <div className="pill-group">
                <span className="pill neutral">Attempted: {t.attempted}</span>
                <span className="pill success">Correct: {t.correct}</span>
                <span className="pill danger">Incorrect: {t.incorrect}</span>
                <span className="pill muted">
                  Not Attempted: {t.not_attempted}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* IMPROVEMENT AREAS */}
      <div className="report-card">
        <h3>Improvement Areas</h3>

        {improvement_areas.map((i, idx) => (
          <div key={idx} className="improvement-row">
            <div className="label">{i.topic}</div>
            <div className="bar">
              <div
                className="fill"
                style={{ width: `${i.accuracy_percent}%` }}
              />
            </div>
            <div className="percent">{i.accuracy_percent}%</div>
          </div>
        ))}
      </div>

    </div>
  );
}
