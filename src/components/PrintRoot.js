// PrintRoot.js
import { forwardRef } from "react";

const PrintRoot = forwardRef(
  (
    {
      overall,
      balanceIndex,
      strengths,
      improvements,
      SUBJECT_LABELS
    },
    ref
  ) => {
    return (
      <div ref={ref} className="pdf-print-root">
        {overall ? (
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
                {improvements.length ? improvements.join(", ") : "None identified"}
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
                {Object.entries(overall.components).map(([key, value]) => (
                  <tr key={key}>
                    <td>{SUBJECT_LABELS[key]}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* FOOTNOTE */}
            <p className="explanation">
              Overall Selective Readiness is calculated as an equal-weight average
              of Reading, Mathematical Reasoning, Thinking Skills, and Writing.
              Results are advisory only.
            </p>

          </div>
        ) : (
          // IMPORTANT: ref must still exist
          <div style={{ minHeight: "1px" }} />
        )}
      </div>
    );
  }
);

export default PrintRoot;
