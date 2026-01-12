// PrintRoot.jsx
import { forwardRef } from "react";

const PrintRoot = forwardRef(({ overall, balanceIndex, strengths, improvements, subjectChartData, SUBJECT_LABELS }, ref) => {
  if (!overall) return null;

  return (
    <div ref={ref} className="pdf-print-root">
      <div className="overall-summary">

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

        <div className="chart-section">
          <div className="chart-title">Overall Balance Index</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${balanceIndex}%` }} />
          </div>
        </div>

        {/* rest of report — no modal logic here */}
      </div>
    </div>
  );
});

export default PrintRoot;
