import "./SelectiveReadinessOverall.css"; 

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          margin: "20px 0 12px"
        }}
      >
        <div
          style={{
            background: "#eff6ff",
            padding: "18px 20px",
            borderRadius: "10px",
            border: "1px solid #bfdbfe",
            width: "100%"
          }}
        >
          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>
            Overall Score
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#111827",
              whiteSpace: "nowrap"
            }}
          >
            {overall.overall_percent}%
          </div>
        </div>
      
        <div
          style={{
            background: "#f8fafc",
            padding: "18px 20px",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            width: "100%"
          }}
        >
          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>
            Readiness Band
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#111827"
            }}
          >
            {overall.readiness_band}
          </div>
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
      <div className="schools-section card">
        <div className="chart-title">Recommended Schools</div>
      
        <div className="schools-list">
          {overall.school_recommendation?.map((school, index) => (
            <div key={index} className="school-pill">
              {school}
            </div>
          ))}
        </div>
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
