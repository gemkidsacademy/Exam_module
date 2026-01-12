// PrintRoot.jsx
import { forwardRef } from "react";

const PrintRoot = forwardRef(function PrintRoot(
  {
    overall,
    balanceIndex,
    strengths,
    improvements,
    SUBJECT_LABELS,
  },
  ref
) {
  return (
    <div ref={ref} className="pdf-print-root">
      {!overall ? (
        <div style={{ padding: "40px", textAlign: "center" }}>
          Preparing report…
        </div>
      ) : (
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

        </div>
      )}
    </div>
  );
});

export default PrintRoot;
