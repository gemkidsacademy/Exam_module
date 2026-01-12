export default function ReportContent({
  overall,
  balanceIndex,
  strengths,
  improvements,
  subjectChartData,
  SUBJECT_LABELS,
  SubjectFocusCard
}) {
  return (
    <>
      {/* SCORE CARDS */}
      <div className="score-row">
        <div className="score-box">
          <div className="label">Overall Score</div>
          <div className="value">{overall.overall_percent}%</div>
        </div>
        <div className="score-box">
          <div className="label">Readiness Band</div>
          <div className="value">{overall.readiness_band}</div>
        </div>
      </div>

      {/* BALANCE INDEX */}
      <div className="chart-section">
        <div className="chart-title">Overall Balance Index</div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${balanceIndex}%` }}
          />
        </div>
        <p className="explanation">
          Balance Score: {balanceIndex}% (higher means more evenly balanced performance)
        </p>
      </div>

      {/* STRENGTHS */}
      <div className="chart-section">
        <div className="chart-title">Strengths & Focus Areas</div>
        <p><strong>Strengths:</strong> {strengths.join(", ") || "—"}</p>
        <p><strong>Needs Improvement:</strong> {improvements.join(", ") || "None identified"}</p>
      </div>

      {/* SUBJECT DETAIL */}
      <div className="chart-section">
        <div className="chart-title">Subject Performance Detail</div>
        {Object.entries(overall.components).map(([k, v]) => (
          <SubjectFocusCard
            key={k}
            subjectKey={k}
            label={SUBJECT_LABELS[k]}
            rawScore={v}
          />
        ))}
      </div>
    </>
  );
}
