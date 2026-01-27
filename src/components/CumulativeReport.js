import React from "react";

/**
 * CumulativeReport
 * ----------------
 * Renders topic-level cumulative progress over time
 * for a single student and a single exam.
 *
 * Data is fully aggregated by backend.
 */
export default function CumulativeReport({ data }) {
  if (!data) return null;

  const {
    student_id,
    student_name,
    exam,
    topic,
    attempts = [],
    summary
  } = data;

  const topicLabel = topic?.label ?? "Unknown topic";

  if (attempts.length === 0) {
    return (
      <div className="cumulative-report">
        <p>No data available for this topic.</p>
      </div>
    );
  }

  return (
    <div className="cumulative-report">
      {/* ================= HEADER ================= */}
      <div className="report-header">
        <h2>Topic Progress Over Time</h2>
        <p className="subtext">
          {student_name} ({student_id}) · {exam} · Topic:{" "}
          <strong>{topicLabel}</strong>
        </p>
      </div>

      {/* ================= CHART ================= */}
      <div className="chart-container">
        <SimpleLineChart attempts={attempts} />
      </div>

      {/* ================= SUMMARY ================= */}
      {summary && (
        <div className="progress-summary">
          <h3>Progress Summary</h3>

          <div className="summary-metrics">
            <Metric
              label="Start Score"
              value={`${summary.first_attempt_score}%`}
            />
            <Metric
              label="Latest Score"
              value={`${summary.latest_attempt_score}%`}
            />
            <Metric
              label="Score Change"
              value={`${summary.score_change > 0 ? "+" : ""}${summary.score_change}%`}
            />
            <Metric
              label="Start Accuracy"
              value={`${summary.first_attempt_accuracy}%`}
            />
            <Metric
              label="Latest Accuracy"
              value={`${summary.latest_attempt_accuracy}%`}
            />
            <Metric
              label="Accuracy Change"
              value={`${summary.accuracy_change > 0 ? "+" : ""}${summary.accuracy_change}%`}
            />
            <Metric
              label="Trend"
              value={summary.trend}
            />
          </div>
        </div>
      )}

      {/* ================= ATTEMPT TABLE ================= */}
      <div className="attempt-table">
        <h3>Attempt Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Score (%)</th>
              <th>Accuracy (%)</th>
              <th>Questions</th>
              <th>Correct</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map(a => (
              <tr key={a.date}>
                <td>{new Date(a.date).toLocaleDateString()}</td>
                <td>{a.score}%</td>
                <td>{a.accuracy}%</td>
                <td>{a.questions_attempted}</td>
                <td>{a.correct_answers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= SUB-COMPONENTS ================= */

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
    </div>
  );
}

/**
 * SimpleLineChart
 * ---------------
 * Minimal SVG-based chart to stay PDF-safe.
 */
function SimpleLineChart({ attempts }) {
  const width = 600;
  const height = 220;
  const padding = 30;

  const scores = attempts.map(a => a.score);
  const accuracies = attempts.map(a => a.accuracy);
  const maxY = 100;

  const xStep =
    attempts.length > 1
      ? (width - padding * 2) / (attempts.length - 1)
      : 0;

  const yScale = val =>
    height - padding - (val / maxY) * (height - padding * 2);

  const points = values =>
    values
      .map((v, i) => {
        const x = padding + i * xStep;
        const y = yScale(v);
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <svg width={width} height={height} className="line-chart">
      {/* Axes */}
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#ccc" />
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ccc" />

      {/* Score line */}
      <polyline
        fill="none"
        stroke="#2563eb"
        strokeWidth="2"
        points={points(scores)}
      />

      {/* Accuracy line */}
      <polyline
        fill="none"
        stroke="#16a34a"
        strokeWidth="2"
        points={points(accuracies)}
      />
    </svg>
  );
}
