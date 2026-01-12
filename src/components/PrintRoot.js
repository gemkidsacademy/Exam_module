// PrintRoot.jsx
import { forwardRef } from "react";

const PrintRoot = forwardRef(function PrintRoot(props, ref) {
  const {
    overall,
    balanceIndex,
    strengths,
    improvements,
    SUBJECT_LABELS,
  } = props;

  return (
    // ✅ REF IS ALWAYS ATTACHED TO A REAL DOM NODE
    <div ref={ref} className="pdf-print-root">
      {/* ================= EMPTY STATE ================= */}
      {!overall && (
        <div className="pdf-placeholder">
          Preparing report…
        </div>
      )}

      {/* ================= PRINT CONTENT ================= */}
      {overall && (
        <div className="pdf-content">

          {/* ===== HEADER ===== */}
          <h2 className="pdf-title">
            Selective Readiness Report
          </h2>

          {/* ===== SUMMARY ROW ===== */}
          <div className="score-row">
            <div className="score-box">
              <div className="label">Overall Score</div>
              <div className="value">
                {overall.overall_percent}%
              </div>
            </div>

            <div className="score-box">
              <div className="label">Readiness Band</div>
              <div className="value">
                {overall.readiness_band}
              </div>
            </div>

            <div className="score-box">
              <div className="label">Balance Index</div>
              <div className="value">
                {balanceIndex}
              </div>
            </div>
          </div>

          {/* ===== COMPONENT TABLE ===== */}
          <h3 className="section-title">
            Component Breakdown
          </h3>

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
                  <td>
                    {key === "writing"
                      ? `${value} / 20`
                      : `${value} / 100`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ===== STRENGTHS ===== */}
          {strengths?.length > 0 && (
            <>
              <h3 className="section-title">Strengths</h3>
              <ul className="tag-list">
                {strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </>
          )}

          {/* ===== IMPROVEMENTS ===== */}
          {improvements?.length > 0 && (
            <>
              <h3 className="section-title">Areas for Improvement</h3>
              <ul className="tag-list warning">
                {improvements.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </>
          )}

        </div>
      )}
    </div>
  );
});

export default PrintRoot;
