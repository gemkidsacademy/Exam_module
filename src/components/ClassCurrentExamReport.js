import "./ClassCurrentExamReport.css";

export default function ClassCurrentExamReport({ data }) {
  if (!data) return null;

  const { meta, summary, leaderboard, score_distribution } = data;

  return (
    <div className="class-report">

      {/* ================= HEADER ================= */}
      <div className="report-header">
        <h2>
          {meta.class_name} – {meta.class_day}
        </h2>
        <p className="report-subtitle">
          {meta.exam} · {new Date(meta.date).toLocaleDateString()}
        </p>
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="summary-grid">
        <div className="summary-card">
          <span className="label">Average Score</span>
          <span className="value">{summary.average_score}%</span>
        </div>

        <div className="summary-card">
          <span className="label">Highest Score</span>
          <span className="value">{summary.highest_score}%</span>
        </div>

        <div className="summary-card">
          <span className="label">Students Attempted</span>
          <span className="value">
            {summary.students_attempted} / {summary.students_total}
          </span>
        </div>
      </div>

      {/* ================= SCORE DISTRIBUTION ================= */}
      {/* Score Distribution */}
        <div className="score-distribution">
          <h3>Score Distribution</h3>
        
          {score_distribution.map(bucket => {
            const maxCount = Math.max(
              ...score_distribution.map(b => b.count)
            );
        
            const widthPercent =
              maxCount === 0 ? 0 : (bucket.count / maxCount) * 100;
        
            return (
              <div key={bucket.range} className="score-row">
                <div className="score-label">{bucket.range}</div>
        
                <div className="score-bar-wrapper">
                  <div
                    className="score-bar"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
        
                <div className="score-count">{bucket.count}</div>
              </div>
            );
          })}
        </div>

      {/* ================= LEADERBOARD ================= */}
      <div className="leaderboard-section">
        <h3>Leaderboard</h3>

        {leaderboard.length === 0 ? (
          <p className="muted">No student attempts for this exam.</p>
        ) : (
          <table className="leaderboard">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>Score</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map(row => (
                <tr
                  key={row.rank}
                  className={
                    row.rank === 1
                      ? "rank-1"
                      : row.rank === 2
                      ? "rank-2"
                      : row.rank === 3
                      ? "rank-3"
                      : ""
                  }
                >
                  <td>{row.rank}</td>
                  <td>{row.student}</td>
                  <td>{row.score}%</td>
                  <td>{row.accuracy}%</td>
                </tr>
              ))}
            </tbody>

          </table>
        )}
      </div>
    </div>
  );
}
