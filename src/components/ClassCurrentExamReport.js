import "./ClassCurrentExamReport.css";

export default function ClassCurrentExamReport({ data }) {
  if (!data) return null;

  const {
    summary = {
      average_score: 0,
      highest_score: 0,
      students_attempted: 0,
      students_total: 0,
    },
    leaderboard = [],
    score_distribution = [],
  } = data;

  // --------------------------------------------------
  // TOTAL MARKS
  // --------------------------------------------------
  // Your current OC reports are based on 40 marks.
  // Later we can move this into the backend response.
  const totalMarks = data.total_marks || 40;

  // --------------------------------------------------
  // PERFORMANCE BAND
  // --------------------------------------------------
  const getPerformanceBand = (percentage) => {
    if (percentage <= 40) return "Needs Support";
    if (percentage <= 60) return "Developing";
    if (percentage <= 80) return "Good";
    return "Excellent";
  };

  const getBandClass = (percentage) => {
    if (percentage <= 40) return "needs-support";
    if (percentage <= 60) return "developing";
    if (percentage <= 80) return "good";
    return "excellent";
  };

  // --------------------------------------------------
  // DISTRIBUTION HELPERS
  // --------------------------------------------------
  const getDistributionLabel = (range) => {
    switch (range) {
      case "0-40":
        return "Needs Support";
      case "41-60":
        return "Developing";
      case "61-80":
        return "Good";
      case "81-100":
        return "Excellent";
      default:
        return range;
    }
  };

  const getDistributionClass = (range) => {
    switch (range) {
      case "0-40":
        return "needs-support";
      case "41-60":
        return "developing";
      case "61-80":
        return "good";
      case "81-100":
        return "excellent";
      default:
        return "";
    }
  };

  const getMarksRange = (range) => {
    switch (range) {
      case "0-40":
        return `0 - ${Math.round(totalMarks * 0.4)} marks`;

      case "41-60":
        return `${Math.round(totalMarks * 0.4) + 1} - ${Math.round(
          totalMarks * 0.6
        )} marks`;

      case "61-80":
        return `${Math.round(totalMarks * 0.6) + 1} - ${Math.round(
          totalMarks * 0.8
        )} marks`;

      case "81-100":
        return `${Math.round(totalMarks * 0.8) + 1} - ${totalMarks} marks`;

      default:
        return "-";
    }
  };

  // --------------------------------------------------
  // SCORE DISTRIBUTION
  // --------------------------------------------------
  const attempted = summary.students_attempted || 0;

  const distributionWithPercentages = score_distribution.map((bucket) => {
    const percentage =
      attempted === 0 ? 0 : Math.round((bucket.count / attempted) * 100);

    return {
      ...bucket,
      percentage,
    };
  });

  // --------------------------------------------------
  // MOST COMMON PERFORMANCE BAND
  // --------------------------------------------------
  const dominantBand =
    distributionWithPercentages.length > 0
      ? distributionWithPercentages.reduce(
          (highest, current) =>
            current.count > highest.count ? current : highest,
          distributionWithPercentages[0]
        )
      : null;

  // --------------------------------------------------
  // NEEDS SUPPORT COUNT
  // --------------------------------------------------
  const needsSupportBucket = score_distribution.find(
    (bucket) => bucket.range === "0-40"
  );

  const needsSupportCount = needsSupportBucket?.count || 0;

  // --------------------------------------------------
  // CLASS AVERAGE
  // --------------------------------------------------
  const averageScore = summary.average_score || 0;

  // --------------------------------------------------
  // LEADERBOARD MARKS
  // --------------------------------------------------
  const getMarksFromPercentage = (percentage) => {
    return Math.round((Number(percentage) / 100) * totalMarks);
  };

  return (
    <div className="class-report">

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}
      <section className="report-summary-card">

        <div className="summary-item">
          <div className="summary-icon purple">
            📊
          </div>

          <div className="summary-content">
            <span className="summary-label">
              AVERAGE SCORE
            </span>

            <strong className="summary-value">
              {averageScore}%
            </strong>
          </div>
        </div>


        <div className="summary-item">
          <div className="summary-icon green">
            🏆
          </div>

          <div className="summary-content">
            <span className="summary-label">
              HIGHEST SCORE
            </span>

            <strong className="summary-value">
              {summary.highest_score}%
            </strong>

            {leaderboard.length > 0 && (
              <span className="summary-subtext">
                {leaderboard[0]?.student}
              </span>
            )}
          </div>
        </div>


        <div className="summary-item">
          <div className="summary-icon blue">
            👥
          </div>

          <div className="summary-content">
            <span className="summary-label">
              STUDENTS ATTEMPTED
            </span>

            <strong className="summary-value">
              {summary.students_attempted} /{" "}
              {summary.students_total}
            </strong>

            <span className="summary-subtext">
              {summary.students_total > 0
                ? Math.round(
                    (summary.students_attempted /
                      summary.students_total) *
                      100
                  )
                : 0}
              % attempted
            </span>
          </div>
        </div>


        

      </section>


      {/* =====================================================
          SCORE DISTRIBUTION
      ===================================================== */}
      <section className="report-section">

        <div className="section-heading">
          <h3>SCORE DISTRIBUTION</h3>

          <p>
            Distribution is based on total marks ({totalMarks}).
          </p>
        </div>


        <div className="distribution-table">

          {/* HEADER */}
          <div className="distribution-header">
            <span>PERFORMANCE BAND</span>
            <span>PERCENTAGE</span>
            <span>MARKS RANGE</span>
            <span>STUDENTS</span>
            <span>DISTRIBUTION</span>
          </div>


          {/* ROWS */}
          {distributionWithPercentages.map((bucket) => (
            <div
              key={bucket.range}
              className="distribution-row"
            >

              <div className="performance-name">
                <span
                  className={`performance-dot ${getDistributionClass(
                    bucket.range
                  )}`}
                />

                <span>
                  {getDistributionLabel(bucket.range)}
                </span>
              </div>


              <div>
                {bucket.range.replace("-", " - ")}%
              </div>


              <div>
                {getMarksRange(bucket.range)}
              </div>


              <div>
                {bucket.count}
              </div>


              <div className="distribution-bar-wrapper">

                <div className="distribution-bar-background">

                  <div
                    className={`distribution-bar ${getDistributionClass(
                      bucket.range
                    )}`}
                    style={{
                      width: `${bucket.percentage}%`,
                    }}
                  />

                </div>

                <span className="distribution-percentage">
                  {bucket.percentage}%
                </span>

              </div>

            </div>
          ))}

        </div>


        {/* INSIGHT */}
        {dominantBand && attempted > 0 && (
          <div className="distribution-insight">

            <span className="insight-icon">
              ⓘ
            </span>

            <span>
              {dominantBand.percentage}% of students scored in the{" "}
              <strong>
                {dominantBand.range.replace("-", " - ")}%
              </strong>{" "}
              range. Focus area: Strengthen concepts to help
              students progress to the next performance band.
            </span>

          </div>
        )}

      </section>


      {/* =====================================================
          LEADERBOARD
      ===================================================== */}
      <section className="report-section">

        <div className="section-heading">
          <h3>LEADERBOARD</h3>
        </div>


        {leaderboard.length === 0 ? (
          <p className="muted">
            No student attempts for this exam.
          </p>
        ) : (

          <div className="leaderboard-wrapper">

            <table className="leaderboard-table">

              <thead>
                <tr>
                  <th>RANK</th>
                  <th>STUDENT</th>
                  <th>MARKS</th>
                  <th>PERCENTAGE</th>
                  <th>PERFORMANCE</th>
                </tr>
              </thead>


              <tbody>

                {leaderboard.map((row) => {

                  const percentage = Number(
                    row.accuracy ?? row.score ?? 0
                  );

                  const marks =
                    getMarksFromPercentage(percentage);

                  const performance =
                    getPerformanceBand(percentage);

                  return (
                    <tr
                      key={row.rank}
                      className={
                        row.rank <= 3
                          ? `leaderboard-rank-${row.rank}`
                          : ""
                      }
                    >

                      <td>

                        <div className="rank-display">

                          {row.rank === 1 && "🥇"}
                          {row.rank === 2 && "🥈"}
                          {row.rank === 3 && "🥉"}

                          <span>
                            {row.rank}
                          </span>

                        </div>

                      </td>


                      <td>
                        {row.student}
                      </td>


                      <td>
                        {marks} / {totalMarks}
                      </td>


                      <td>
                        {percentage}%
                      </td>


                      <td>

                        <span
                          className={`performance-badge ${getBandClass(
                            percentage
                          )}`}
                        >
                          {performance}
                        </span>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </section>


      {/* =====================================================
          CLASS INSIGHT
      ===================================================== */}
      <section className="report-section class-insight-section">

        <div className="section-heading">
          <h3>CLASS INSIGHT</h3>
        </div>


        <div className="class-insight-box">

          <div className="class-insight-icon">
            📊
          </div>


          <div className="class-insight-content">

            <p>
              Average class performance:{" "}
              <strong>
                {averageScore}%
              </strong>
            </p>


            <ul>

              <li>
                {needsSupportCount} of{" "}
                {summary.students_attempted} students need
                additional support.
              </li>


              {dominantBand && (
                <li>
                  Most students are currently in the{" "}
                  <strong
                    className={`insight-performance ${getDistributionClass(
                      dominantBand.range
                    )}`}
                  >
                    {getDistributionLabel(
                      dominantBand.range
                    )}
                  </strong>{" "}
                  performance band.
                </li>
              )}

            </ul>

          </div>

        </div>


        <p className="insight-footer">
          Insight is based on this exam performance.
        </p>

      </section>

    </div>
  );
}