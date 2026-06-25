import "./ClassCurrentExamReport.css";

export default function ClassCurrentExamReport({ data }) {
  if (!data) return null;

  

  const {
  class_name,
  exam,
  date,
  summary = {
    average_score: 0,
    highest_score: 0,
    students_attempted: 0,
    students_total: 0
  },
  leaderboard = [],
  score_distribution = []
} = data;


  return (
    <div className="class-report">

      {/* ================= HEADER ================= */}
      <div className="report-header">
        <h2>
          {class_name} | {exam}
        </h2>
        
       

        <p className="report-subtitle">
        {exam} · {new Date(date).toLocaleDateString()}
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

            const percentage =
              summary.students_attempted === 0
                ? 0
                : (bucket.count / summary.students_attempted) * 100;

            console.log(
              bucket.range,
              bucket.count,
              summary.students_attempted,
              percentage
            );

            return (
              <div
                key={bucket.range}
                className="score-row"
              >
                <div className="score-label">
                  {bucket.range}
                </div>

                  <div
                  style={{
                    background: "#e5e7eb",
                    height: "14px",
                    borderRadius: "999px",
                    overflow: "hidden",
                    width: "100%"
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: "100%",
                      background: "#2563eb",
                      borderRadius: "999px",
                      transition: "width 0.4s ease"
                    }}
                  />
                </div>

                <div className="score-count">
                  {percentage.toFixed(0)}% ({bucket.count})
                </div>
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
