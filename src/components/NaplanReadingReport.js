export default function NaplanReadingReport({ report, onViewExamDetails }) {
  if (!report) {
    return <p className="loading">Generating your report…</p>;
  }

  const {
    overall,
    topic_wise_performance,
    improvement_areas
  } = report;

  return (
    <div className="reading-report-container">

      {/* HEADER */}
      <div className="reading-report-header">
        <h2>NAPLAN Reading Report</h2>
        <p>Here’s a summary of your performance</p>
      </div>

      {/* SUMMARY */}
      <div className="reading-summary-grid">
        <div className="reading-summary-card">
          <h3>{overall.correct} / {overall.total_questions}</h3>
          <span>Score</span>
        </div>

        <div className="reading-summary-card">
          <h3>{overall.accuracy_percent}%</h3>
          <span>Accuracy</span>
        </div>

        <div className="reading-summary-card">
          <h3>{overall.time_taken_minutes ?? "--"} min</h3>
          <span>Time Taken</span>
        </div>
      </div>

      {/* PERFORMANCE BY TOPIC */}
      <div className="reading-performance">
        <h3>Performance by Topic</h3>

        {topic_wise_performance.map((row, idx) => (
          <div key={idx} className="performance-row">
            <span className="performance-topic">{row.topic}</span>
            <span className="performance-score">
              {row.correct} / {row.total} ({row.accuracy_percent}%)
            </span>
          </div>
        ))}
      </div>

      {/* IMPROVEMENT */}
      <div className="reading-improvement">
        <h3>Areas to Improve</h3>

        {improvement_areas.length === 0 ? (
          <p>🎉 Great work! No weak areas detected.</p>
        ) : (
          <ul>
            {improvement_areas.map((area, idx) => (
              <li key={idx}>
                {area.topic} — {area.accuracy_percent}%
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ACTIONS */}
      <div className="reading-report-actions">
        <button className="btn-review" onClick={onViewExamDetails}>
          Review Exam
        </button>
      </div>
    </div>
  );
}
