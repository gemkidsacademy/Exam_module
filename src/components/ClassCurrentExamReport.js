export default function ClassCurrentExamReport({ data }) {
  const { meta, summary, leaderboard, score_distribution } = data;

  return (
    <div className="class-report">

      {/* Header */}
      <h2>
        {meta.class_name} – {meta.class_day} | {meta.exam} ({meta.date})
      </h2>

      {/* Summary */}
      <div className="summary-card">
        <p>
          Average Score: <strong>{summary.average_score}%</strong>
        </p>
        <p>
          Highest Score: <strong>{summary.highest_score}%</strong>
        </p>
        <p>
          Students Attempted:{" "}
          <strong>
            {summary.students_attempted} / {summary.students_total}
          </strong>
        </p>
      </div>

      {/* Leaderboard */}
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
            <tr key={row.rank}>
              <td>{row.rank}</td>
              <td>{row.student}</td>
              <td>{row.score}%</td>
              <td>{row.accuracy}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Score Distribution */}
      <div className="score-distribution">
        {score_distribution.map(b => (
          <div key={b.range}>
            {b.range}: {b.count}
          </div>
        ))}
      </div>
    </div>
  );
}
