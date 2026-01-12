// PrintRoot.jsx
import { forwardRef } from "react";

const PrintRoot = forwardRef(
  ({ overall, balanceIndex, strengths, improvements, SUBJECT_LABELS }, ref) => {
    return (
      <div ref={ref} className="pdf-print-root">
        {!overall ? (
          <div style={{ minHeight: "1px" }} />
        ) : (
          <div className="overall-summary">
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
            </div>

            {/* STRENGTHS */}
            <div className="chart-section">
              <p>
                <strong>Strengths:</strong>{" "}
                {strengths.length ? strengths.join(", ") : "—"}
              </p>
              <p>
                <strong>Needs Improvement:</strong>{" "}
                {improvements.length ? improvements.join(", ") : "None"}
              </p>
            </div>

            {/* TABLE */}
            <h4>Component Breakdown</h4>
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(overall.components).map(([k, v]) => (
                  <tr key={k}>
                    <td>{SUBJECT_LABELS[k]}</td>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="explanation">
              Results are advisory only.
            </p>
          </div>
        )}
      </div>
    );
  }
);

export default PrintRoot;
