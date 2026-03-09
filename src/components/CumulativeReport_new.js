import React, { useState, useEffect } from "react";
import "./CumulativeReport.css";

/**
 * CumulativeReport_new
 * --------------------
 * Self-contained topic progress report.
 * Fetches its own data from backend.
 */

export default function CumulativeReport_new({
  studentId,
  exam,
  topic,
  attemptDates,
  API_BASE,
  shouldGenerate,
  setShouldGenerate
}) {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {

    if (!shouldGenerate) return;

    if (!studentId || !exam || !topic || attemptDates.length === 0) {
      setShouldGenerate(false);
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    const params = new URLSearchParams();

    params.append("student_id", studentId);
    params.append("exam", exam);
    params.append("topic", topic);

    attemptDates.forEach(d =>
      params.append("attempt_dates", d)
    );

    fetch(`${API_BASE}/api/reports/student/cumulative?${params}`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => setError(err.message))
      .finally(() => {
        setLoading(false);
        setShouldGenerate(false);
      });

  }, [shouldGenerate, studentId, exam, topic, attemptDates, API_BASE]);

  if (loading) {
    return <p>Loading topic progress…</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!data) return null;

  const {
    student_id,
    student_name,
    exam: examName,
    topic: topicData,
    attempts = [],
    summary
  } = data;

  const topicLabel = topicData?.label ?? "Unknown topic";

  if (attempts.length === 0) {
    return (
      <div className="cumulative-report">
        <p>No data available for this topic.</p>
      </div>
    );
  }

  const narrative = buildProgressNarrative(summary, attempts.length);

  return (
    <div className="cumulative-report">

      {/* ================= HEADER ================= */}
      <div className="report-header">
        <h2>Topic Progress Over Time</h2>
        <p className="subtext">
          {student_name} ({student_id}) · {examName} · Topic:{" "}
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

          {narrative && (
            <p className="progress-narrative">
              {narrative}
            </p>
          )}

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

/* ================= HELPERS ================= */

function buildProgressNarrative(summary, attemptsCount) {

  if (!summary || attemptsCount < 2) return null;

  const {
    first_attempt_score,
    latest_attempt_score,
    score_change,
    trend
  } = summary;

  const direction =
    trend === "improving"
      ? "steady improvement"
      : trend === "declining"
      ? "decline"
      : "stable performance";

  return (
    `The student’s score changed from ${first_attempt_score}% to ` +
    `${latest_attempt_score}% over ${attemptsCount} attempts.\n\n` +
    `This indicates a ${direction} of ${Math.abs(score_change)} percentage points, ` +
    `suggesting that practice and feedback are having a positive impact.`
  );
}

/* ================= SUB COMPONENTS ================= */

function Metric({ label, value }) {

  return (
    <div className="metric">
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
    </div>
  );

}

/**
 * Minimal SVG chart (PDF-safe)
 */

function SimpleLineChart({ attempts }) {

  const width = 600;
  const height = 220;
  const padding = 30;
  const maxY = 100;

  const scores = attempts.map(a => a.score);
  const accuracies = attempts.map(a => a.accuracy);

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

      {/* axes */}

      <line
        x1={padding}
        y1={padding}
        x2={padding}
        y2={height - padding}
        stroke="#ccc"
      />

      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="#ccc"
      />

      {/* score line */}

      {attempts.length > 1 && (
        <>
          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            points={points(scores)}
          />

          <polyline
            fill="none"
            stroke="#16a34a"
            strokeWidth="2"
            points={points(accuracies)}
          />
        </>
      )}

    </svg>
  );
}
