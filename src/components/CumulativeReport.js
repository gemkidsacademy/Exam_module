import React from "react";
import "./CumulativeReport.css";

/**
 * CumulativeReport
 * ----------------
 * Topic-level cumulative progress report
 * for a single student, exam and topic.
 *
 * Backend data structure remains unchanged.
 */
export default function CumulativeReport({ data }) {
  if (!data) return null;

  const {
    student_id,
    student_name,
    exam,
    topic,
    attempts = [],
    summary,
  } = data;

  const topicLabel = topic?.label ?? "Unknown topic";

  if (attempts.length === 0) {
    return (
      <div className="cumulative-report">
        <div className="empty-report">
          <p>No data available for this topic.</p>
        </div>
      </div>
    );
  }

  const latestAttempt = attempts[attempts.length - 1];

  const bestScore = Math.max(
    ...attempts.map((attempt) => Number(attempt.score) || 0)
  );

  const narrative = buildProgressNarrative(summary, attempts.length);
  const insight = buildInsight(summary, attempts);
  const performance = getPerformanceLabel(latestAttempt?.score);

  return (
    <div className="cumulative-report">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="report-top-header">
        <div>
          <h1>Topic Progress Report</h1>

          <p>
            Track student improvement for a specific topic over multiple
            attempts.
          </p>
        </div>

        
      </div>

      {/* =====================================================
          FILTER / CONTEXT BAR
      ===================================================== */}
      

      {/* =====================================================
          KPI CARDS
      ===================================================== */}
      {summary && (
        <div className="kpi-grid">

          <KpiCard
            type="latest"
            label="Latest Score"
            value={`${summary.latest_attempt_score}%`}
            secondary={`${latestAttempt?.correct_answers ?? 0} / ${
              latestAttempt?.questions_attempted ?? 0
            } correct`}
            date={formatDate(latestAttempt?.date)}
          />

          <KpiCard
            type="starting"
            label="Starting Score"
            value={`${summary.first_attempt_score}%`}
            secondary={`${attempts[0]?.correct_answers ?? 0} / ${
              attempts[0]?.questions_attempted ?? 0
            } correct`}
            date={formatDate(attempts[0]?.date)}
          />

          <KpiCard
            type="improvement"
            label="Improvement"
            value={`${summary.score_change > 0 ? "+" : ""}${
              summary.score_change
            }%`}
            secondary="Percentage Points"
            badge={capitalize(summary.trend)}
          />

          <KpiCard
            type="attempts"
            label="Attempts Analysed"
            value={attempts.length}
            secondary={getAttemptDateRange(attempts)}
          />

        </div>
      )}

      {/* =====================================================
          PROGRESS OVER TIME
      ===================================================== */}
      <section className="report-section chart-section">

        <div className="section-heading">
          <div>
            <h2>Progress Over Time</h2>
            <p>
              Score percentage over time based on the total marks of
              each attempt.
            </p>
          </div>

          <div className="chart-legend">
            <span>
              <span className="legend-dot score-dot" />
              Score (%)
            </span>

            <span>
              <span className="legend-dot accuracy-dot" />
              Accuracy (%)
            </span>
          </div>
        </div>

        <ProgressChart attempts={attempts} />

      </section>

      {/* =====================================================
          PROGRESS SUMMARY
      ===================================================== */}
      {summary && (
        <section className="progress-summary-section">

          <div className="summary-left">

            <div className="summary-title-row">
              <div className="summary-icon">↗</div>

              <div>
                <h2>Progress Summary</h2>

                <span className="trend-badge">
                  ↗ {capitalize(summary.trend)}
                </span>
              </div>
            </div>

            {narrative && (
              <p className="summary-narrative">
                {narrative}
              </p>
            )}

          </div>

          <div className="summary-divider" />

          <div className="summary-metrics-grid">

            <Metric
              label="Start Score"
              value={`${summary.first_attempt_score}%`}
              secondary={`${
                attempts[0]?.correct_answers ?? 0
              } / ${attempts[0]?.questions_attempted ?? 0}`}
            />

            <Metric
              label="Latest Score"
              value={`${summary.latest_attempt_score}%`}
              secondary={`${
                latestAttempt?.correct_answers ?? 0
              } / ${latestAttempt?.questions_attempted ?? 0}`}
            />

            <Metric
              label="Score Change"
              value={`${summary.score_change > 0 ? "+" : ""}${
                summary.score_change
              }%`}
              secondary="points"
              positive={summary.score_change > 0}
            />

            <Metric
              label="Best Score"
              value={`${bestScore}%`}
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
              value={`${summary.accuracy_change > 0 ? "+" : ""}${
                summary.accuracy_change
              }%`}
              secondary="points"
              positive={summary.accuracy_change > 0}
            />

            <Metric
              label="Trend"
              value={capitalize(summary.trend)}
            />

          </div>

        </section>
      )}

      {/* =====================================================
          INSIGHT
      ===================================================== */}
      <section className="insight-card">

        <div className="insight-icon">♧</div>

        <div>
          <strong>Insight</strong>

          <p>{insight}</p>
        </div>

      </section>

      {/* =====================================================
          ATTEMPT BREAKDOWN
      ===================================================== */}
      <section className="report-section attempt-section">

        <div className="section-heading">
          <div>
            <h2>Attempt Breakdown</h2>
            <p>
              Detailed performance across each attempt.
            </p>
          </div>
        </div>

        <div className="table-wrapper">

          <table className="attempt-table">

            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Score (%)</th>
                <th>Score (Correct / Total)</th>
                <th>Accuracy (%)</th>
                <th>Performance</th>
              </tr>
            </thead>

            <tbody>

              {attempts.map((attempt, index) => {

                const performanceLabel = getPerformanceLabel(
                  attempt.score
                );

                return (
                  <tr key={`${attempt.date}-${index}`}>

                    <td>{index + 1}</td>

                    <td>
                      {formatDate(attempt.date)}
                    </td>

                    <td>
                      <div className="score-cell">
                        <span>{attempt.score}%</span>

                        <div className="mini-progress">
                          <div
                            className="mini-progress-fill"
                            style={{
                              width: `${Math.min(
                                Number(attempt.score) || 0,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>
                      {attempt.correct_answers} /{" "}
                      {attempt.questions_attempted}
                    </td>

                    <td>
                      <div className="score-cell">
                        <span>{attempt.accuracy}%</span>

                        <div className="mini-progress">
                          <div
                            className="mini-progress-fill"
                            style={{
                              width: `${Math.min(
                                Number(attempt.accuracy) || 0,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`performance-badge ${getPerformanceClass(
                          performanceLabel
                        )}`}
                      >
                        {performanceLabel}
                      </span>
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </section>

      {/* =====================================================
          RECOMMENDATIONS
      ===================================================== */}
      <section className="recommendations-card">

        <div className="recommendation-item">
          <div className="recommendation-icon">◎</div>

          <div>
            <strong>Review fundamentals</strong>

            <p>
              Review the fundamental concepts related to{" "}
              {topicLabel.toLowerCase()}.
            </p>
          </div>
        </div>

        <div className="recommendation-item">
          <div className="recommendation-icon">▱</div>

          <div>
            <strong>Practice regularly</strong>

            <p>
              Continue practicing easy-to-medium questions to
              build accuracy.
            </p>
          </div>
        </div>

        <div className="recommendation-item">
          <div className="recommendation-icon">▥</div>

          <div>
            <strong>Increase difficulty</strong>

            <p>
              Gradually introduce more challenging questions as
              performance improves.
            </p>
          </div>
        </div>

        <div className="recommendation-item">
          <div className="recommendation-icon">◷</div>

          <div>
            <strong>Improve consistency</strong>

            <p>
              Use timed practice sets to improve speed and
              consistency.
            </p>
          </div>
        </div>

      </section>

      <div className="report-footer">
        All percentages are based on the total marks of each attempt.
        Scores are normalized for comparison across attempts.
      </div>

    </div>
  );
}


/* ============================================================
   KPI CARD
============================================================ */

function KpiCard({
  type,
  label,
  value,
  secondary,
  date,
  badge,
}) {
  return (
    <div className={`kpi-card kpi-${type}`}>

      <div className="kpi-icon">
        {type === "latest" && "↗"}
        {type === "starting" && "◎"}
        {type === "improvement" && "↗"}
        {type === "attempts" && "▣"}
      </div>

      <div className="kpi-content">

        <span className="kpi-label">
          {label}
        </span>

        <strong className="kpi-value">
          {value}
        </strong>

        {secondary && (
          <span className="kpi-secondary">
            {secondary}
          </span>
        )}

        {date && (
          <span className="kpi-date">
            {date}
          </span>
        )}

        {badge && (
          <span className="kpi-badge">
            ↗ {badge}
          </span>
        )}

      </div>

    </div>
  );
}


/* ============================================================
   REPORT FILTER
============================================================ */

function ReportFilter({ label, value }) {
  return (
    <div className="report-filter">

      <span className="filter-label">
        {label}
      </span>

      <div className="filter-value">
        {value}
      </div>

    </div>
  );
}


/* ============================================================
   METRIC
============================================================ */

function Metric({
  label,
  value,
  secondary,
  positive,
}) {
  return (
    <div className="summary-metric">

      <span className="metric-label">
        {label}
      </span>

      <strong
        className={`metric-value ${
          positive ? "metric-positive" : ""
        }`}
      >
        {value}
      </strong>

      {secondary && (
        <span className="metric-secondary">
          {secondary}
        </span>
      )}

    </div>
  );
}


/* ============================================================
   PROGRESS CHART
============================================================ */

function ProgressChart({ attempts }) {

  const width = 900;
  const height = 320;

  const paddingLeft = 60;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 60;

  const chartWidth =
    width - paddingLeft - paddingRight;

  const chartHeight =
    height - paddingTop - paddingBottom;

  const maxY = 100;

  const getX = (index) => {

    if (attempts.length === 1) {
      return paddingLeft + chartWidth / 2;
    }

    return (
      paddingLeft +
      (index / (attempts.length - 1)) * chartWidth
    );
  };

  const getY = (value) => {

    const numericValue =
      Number(value) || 0;

    return (
      paddingTop +
      chartHeight -
      (numericValue / maxY) * chartHeight
    );
  };

  const createPoints = (field) => {

    return attempts
      .map((attempt, index) => {

        return `${getX(index)},${getY(
          attempt[field]
        )}`;

      })
      .join(" ");
  };

  const scorePoints = createPoints("score");
  const accuracyPoints = createPoints("accuracy");

  return (
    <div className="progress-chart-wrapper">

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="progress-chart"
        preserveAspectRatio="none"
      >

        {/* GRID LINES */}

        {[0, 20, 40, 60, 80, 100].map(
          (value) => {

            const y = getY(value);

            return (
              <g key={value}>

                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  className="chart-grid-line"
                />

                <text
                  x={paddingLeft - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="chart-axis-label"
                >
                  {value}%
                </text>

              </g>
            );
          }
        )}

        {/* SCORE LINE */}

        {attempts.length > 1 && (
          <polyline
            points={scorePoints}
            className="score-line"
          />
        )}

        {/* ACCURACY LINE */}

        {attempts.length > 1 && (
          <polyline
            points={accuracyPoints}
            className="accuracy-line"
          />
        )}

        {/* DATA POINTS */}

        {attempts.map((attempt, index) => {

          const x = getX(index);
          const scoreY = getY(attempt.score);

          return (
            <g key={`score-${index}`}>

              <circle
                cx={x}
                cy={scoreY}
                r="5"
                className="score-point"
              />

              <text
                x={x}
                y={scoreY - 16}
                textAnchor="middle"
                className="chart-value-label"
              >
                {attempt.score}%
              </text>

              <text
                x={x}
                y={scoreY - 3}
                textAnchor="middle"
                className="chart-correct-label"
              >
                ({attempt.correct_answers} /{" "}
                {attempt.questions_attempted})
              </text>

            </g>
          );
        })}

        {/* X AXIS DATES */}

        {attempts.map((attempt, index) => {

          return (
            <text
              key={`date-${index}`}
              x={getX(index)}
              y={height - 22}
              textAnchor="middle"
              className="chart-date-label"
            >
              {formatDate(attempt.date)}
            </text>
          );
        })}

      </svg>

    </div>
  );
}


/* ============================================================
   HELPERS
============================================================ */

function formatDate(date) {

  if (!date) return "";

  return new Date(date).toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}


function getAttemptDateRange(attempts) {

  if (!attempts.length) {
    return "No attempts";
  }

  const first = formatDate(attempts[0].date);
  const last = formatDate(
    attempts[attempts.length - 1].date
  );

  if (first === last) {
    return first;
  }

  return `${first} – ${last}`;
}


function capitalize(value) {

  if (!value) return "";

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}


function getPerformanceLabel(score) {

  const numericScore =
    Number(score) || 0;

  if (numericScore < 30) {
    return "Needs Support";
  }

  if (numericScore < 60) {
    return "Developing";
  }

  if (numericScore < 80) {
    return "Proficient";
  }

  return "Strong";
}


function getPerformanceClass(label) {

  return label
    .toLowerCase()
    .replace(/\s+/g, "-");
}


function buildProgressNarrative(
  summary,
  attemptsCount
) {

  if (!summary || attemptsCount < 2) {
    return null;
  }

  const {
    first_attempt_score,
    latest_attempt_score,
    score_change,
    trend,
  } = summary;

  const direction =
    trend === "improving"
      ? "improvement"
      : trend === "declining"
      ? "decline"
      : "stable performance";

  return (
    `The student's score changed from ${
      first_attempt_score
    }% to ${
      latest_attempt_score
    }% across ${
      attemptsCount
    } attempts. Overall ${
      direction
    } of ${
      Math.abs(score_change)
    } percentage points was observed.`
  );
}


function buildInsight(summary, attempts) {

  if (!summary || !attempts.length) {
    return "Continue practicing this topic and review areas where errors occur.";
  }

  if (summary.trend === "improving") {

    return (
      "Great progress! Focus on consistent practice to convert " +
      "improving accuracy into stronger scores."
    );
  }

  if (summary.trend === "declining") {

    return (
      "Performance has declined across recent attempts. " +
      "Review fundamental concepts and focus on the questions " +
      "where errors are occurring."
    );
  }

  return (
    "Performance is relatively stable. Additional targeted " +
    "practice may help move the student's score to the next level."
  );
}