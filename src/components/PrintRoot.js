// PrintRoot.jsx
import { forwardRef } from "react";
import "./SelectiveReadinessOverall.css";

const PrintRoot = forwardRef(function PrintRoot(props, ref) {
  const { overall } = props;
  function BenchmarkRow({ title, data, raw, total, studentName }) {
  if (!data) return null;
  function labelText(val) {
    if (val === "top_10") return "top 10%";
    if (val === "top_25") return "top 25%";
    if (val === "top_50") return "top 50%";
    return "lower 50%";
  }
  const bandIndex = {
    lower_50: 0,
    top_50: 1,
    top_25: 2,
    top_10: 3
  };

  const genderPos = bandIndex[data.gender] ?? 0;
  const overallPos = bandIndex[data.overall] ?? 0;

  return (
  <div className="chart-row-wrap">
    <div className="chart-row">

      <div className="chart-subject">
        {title}
      </div>

      <div className="chart-band-wrap">

        <div className="chart-band-grid">

          <div className={`chart-cell ${genderPos === 0 || overallPos === 0 ? "active-zone" : ""}`}>
            <div className="chart-cell-text">
              <strong>50%</strong>
              <span>of students who sat the test</span>
            </div>
          </div>

          <div className={`chart-cell ${genderPos === 1 || overallPos === 1 ? "active-zone" : ""}`}>
            <div className="chart-cell-text">
              <strong>25%</strong>
              <span>of students who sat the test</span>
            </div>
          </div>

          <div className={`chart-cell ${genderPos === 2 || overallPos === 2 ? "active-zone" : ""}`}>
            <div className="chart-cell-text">
              <strong>15%</strong>
              <span>of students who sat the test</span>
            </div>
          </div>

          <div className={`chart-cell ${genderPos === 3 || overallPos === 3 ? "active-zone" : ""}`}>
            <div className="chart-cell-text">
              <strong>10%</strong>
              <span>of students who sat the test</span>
            </div>
          </div>

          <div
            className="marker pink-marker"
            style={{ left: `${genderPos * 25 + 12}%` }}
          >
            ●
          </div>

          <div
            className="marker gold-marker"
            style={{ left: `${overallPos * 25 + 12}%` }}
          >
            ★
          </div>

        </div>

      </div>

      <div className="raw-score-box">
        <div className="raw-score-main">{raw}</div>
        <div className="raw-score-sub">OUT OF {total}</div>
      </div>

        </div>

    <div className="chart-summary">
      In {title}, {studentName} performed in the {labelText(data.gender)} of same-gender students and the {labelText(data.overall)} overall.
    </div>

  </div>


  );
}
  if (!overall) {
  return (
    <div ref={ref} className="pdf-report-page">
      Preparing report...
    </div>
  );
}

console.log("BENCHMARK DATA:", overall.benchmark_bands);



  const studentName = overall.student_name || overall.student_id;
  const studentId = overall.student_id;
  const yearLevel = overall.year_level || "Year 5";
  const examDate = overall.exam_date;

  const components = overall.components || {};

  const reading = components.reading || {};
  const maths = components.mathematical_reasoning || {};
  const thinking = components.thinking_skills || {};
  const writing = components.writing || {};
  function getPercent(subjectData) {
  return Number(subjectData?.percent || 0);
}

const subjectScores = {
  Reading: getPercent(reading),
  "Mathematical Reasoning": getPercent(maths),
  "Thinking Skills": getPercent(thinking),
  Writing: getPercent(writing)
};

const strongestSubject = Object.keys(subjectScores).reduce((a, b) =>
  subjectScores[a] >= subjectScores[b] ? a : b
);

const weakestSubject = Object.keys(subjectScores).reduce((a, b) =>
  subjectScores[a] <= subjectScores[b] ? a : b
);

  function getPerformanceLevel(score) {
    const val = Number(score || 0);

    if (val >= 85) return "Excellent";
    if (val >= 75) return "Very Strong";
    if (val >= 65) return "Strong";
    if (val >= 50) return "Sound";
    return "Needs Improvement";
  }
  function getSmartStrengthComment(title, score) {
  const val = Number(score || 0);

  if (val >= 85) {
    return `${title} is currently a standout strength and competitive asset.`;
  }

  if (val >= 70) {
    return `${title} is performing strongly with good consistency.`;
  }

  if (val >= 55) {
    return `${title} shows solid foundations with room to grow further.`;
  }

  return `${title} remains an important growth opportunity.`;
}

  function renderAcademicSection(
    title,
    data,
    meaning,
    strengths,
    improve,
    focus,
    isWriting = false
  ) {
    const scoreText = isWriting
      ? `Score: ${data.percent || 0} / 25`
      : `Score: ${data.obtained || 0} / ${data.total || 0}`;

    const accuracyText = isWriting ? null : `Accuracy: ${data.percent || 0}%`;

    return (
      <section className="pdf-section-card">
        <h3 className="pdf-section-heading">{title}</h3>

        <p className="pdf-line"><strong>{scoreText}</strong></p>

        {accuracyText && (
          <p className="pdf-line">{accuracyText}</p>
        )}

        <p className="pdf-line">
          Performance Level:{" "}
          <strong>{getPerformanceLevel(data.percent)}</strong>
        </p>

        <div className="pdf-sub-block">
          <div className="pdf-mini-title">What this means</div>
          <p>{meaning}</p>
        </div>

        <div className="pdf-sub-block">
          <div className="pdf-mini-title">Strengths</div>
          <p>
            {getSmartStrengthComment(title, data.percent)}
            {" "}
            {strengths}
          </p>
        </div>

        <div className="pdf-sub-block">
          <div className="pdf-mini-title">Area to Improve</div>
          <p>
            {Number(data.percent || 0) < 65
              ? `${title} should be prioritised in the next study cycle. `
              : ""}
            {improve}
          </p>
        </div>

        <div className="pdf-sub-block">
          <div className="pdf-mini-title">Recommended Focus</div>
          <p>{focus}</p>
        </div>
      </section>
    );
  }

  return (
    <div ref={ref} className="pdf-report-page">
      {/* HEADER */}
      <header className="pdf-report-header">
        <div className="pdf-brand">GEM KIDS ACADEMY</div>
        <div className="pdf-main-title">
          SELECTIVE DIAGNOSTIC PERFORMANCE REPORT
        </div>
      </header>

      {/* STUDENT INFO */}
      {/* STUDENT INFO */}
      <section className="pdf-student-box">
        <div><strong>Student Name:</strong> {studentName}</div>
        <div><strong>Student ID:</strong> {studentId}</div>
        <div><strong>Year Level:</strong> {yearLevel}</div>
        <div><strong>Test Date:</strong> {examDate}</div>
        <div><strong>Assessment:</strong> Selective Full-Length Practice Test</div>
        <div><strong>Mode:</strong> Online (Gem Exam Portal)</div>
      </section>

      {/* PREMIUM METRICS */}
      <section className="pdf-metric-row">

        <div className="pdf-metric-card">
          <div className="pdf-metric-label">Your Profile Score</div>
          <div className="pdf-metric-value">
            {overall.profile_score || 0}
          </div>
          <div className="pdf-metric-sub">
            out of 100
          </div>
        </div>

        <div className="pdf-metric-card">
          <div className="pdf-metric-label">Gender Rank</div>
          <div className="pdf-metric-value">
            {overall.gender_rank || 0}
          </div>
          <div className="pdf-metric-sub">
            out of {overall.total_gender_students || 0}
          </div>
        </div>

        <div className="pdf-metric-card">
          <div className="pdf-metric-label">Overall Rank</div>
          <div className="pdf-metric-value">
            {overall.overall_rank || 0}
          </div>
          <div className="pdf-metric-sub">
            out of {overall.total_students || 0}
          </div>
        </div>

      </section>
      <div className="pdf-legend">
        <span className="legend-item pink-text">● Gender Ranking</span>
        <span className="legend-divider">|</span>
        <span className="legend-item gold-text">★ Overall Ranking</span>
      </div>
      {/* BENCHMARK PERFORMANCE */}
      <section className="pdf-section-card">
        <h3 className="pdf-section-heading">
          Student Test Performance Benchmarking
        </h3>

        <BenchmarkRow
          title="Reading"
          data={overall.benchmark_bands?.reading}
          raw={reading.obtained || 0}
          total={reading.total || 0}
          studentName={studentName}
        />

        <BenchmarkRow
          title="Mathematical Reasoning"
          data={overall.benchmark_bands?.maths}
          raw={maths.obtained || 0}
          total={maths.total || 0}
          studentName={studentName}
        />

        <BenchmarkRow
          title="Thinking Skills"
          data={overall.benchmark_bands?.thinking}
          raw={thinking.obtained || 0}
          total={thinking.total || 0}
          studentName={studentName}
        />

        <BenchmarkRow
          title="Writing"
          data={overall.benchmark_bands?.writing}
          raw={writing.percent || 0}
          total={25}
          studentName={studentName}
        />
      </section>
      {/* OVERVIEW */}
      <section className="pdf-intro-box">
        <h3 className="pdf-section-heading">Test Overview</h3>
        <p>
          This assessment is designed to closely reflect the NSW Selective High
          School Placement Test in structure, difficulty, and time pressure.
          Results are analysed using Gem Kids Academy benchmarking standards to
          provide a clear view of current performance, strengths, and next steps.
        </p>
      </section>

      {/* SUBJECTS */}
      {renderAcademicSection(
        "Reading",
        reading,
        `${studentName} demonstrates reading comprehension ability with good understanding of explicit and implicit information.`,
        "Strong ability to identify key ideas and supporting details.",
        "Handling more complex passages under time pressure.",
        "Regular timed reading practice with inference-heavy passages."
      )}

      {renderAcademicSection(
        "Mathematical Reasoning",
        maths,
        `${studentName} shows mathematical reasoning ability across multi-step problem solving.`,
        "Solid numeracy skills and structured problem solving.",
        "Minor calculation slips under pressure.",
        "Timed drills and answer-checking habits."
      )}

      {renderAcademicSection(
        "Thinking Skills",
        thinking,
        `${studentName} has developing logical reasoning and pattern recognition skills.`,
        "Good standard logic question performance.",
        "More complex and unfamiliar reasoning sets.",
        "Higher difficulty puzzle and reasoning exposure."
      )}

      {renderAcademicSection(
        "Writing",
        writing,
        `${studentName}'s writing is structured and relevant, with room to improve depth and sophistication.`,
        "Clear structure and stays on topic.",
        "Idea expansion and stronger vocabulary.",
        "Planning techniques and deeper paragraph development.",
        true
      )}

      {/* OVERALL PERFORMANCE SUMMARY */}
<section className="pdf-summary-box">
  <h3 className="pdf-section-heading">
    Overall Performance Summary
  </h3>

  <p><strong>Overall Score:</strong> {overall.overall_percent}%</p>

  <p>
    <strong>Selective Readiness:</strong>{" "}
    {overall.readiness_band}
  </p>

  <p><strong>Summary Insight:</strong></p>

  <p className="pdf-summary-text">

  {overall.profile_score >= 80 && (
    <>
      {studentName} is currently performing at a highly competitive level across
      core selective test areas. <strong>{strongestSubject}</strong> is a standout
      strength, while refining <strong>{weakestSubject}</strong> could further
      strengthen top-tier readiness.
    </>
  )}

  {overall.profile_score >= 65 && overall.profile_score < 80 && (
    <>
      {studentName} is demonstrating strong readiness across key areas.
      <strong> {strongestSubject}</strong> is currently a strength, while focused
      improvement in <strong>{weakestSubject}</strong> can significantly improve
      competitiveness.
    </>
  )}

  {overall.profile_score < 65 && (
    <>
      {studentName} is building solid foundations across core areas.
      <strong> {strongestSubject}</strong> shows encouraging progress, while
      consistent work in <strong>{weakestSubject}</strong> will help accelerate
      readiness.
    </>
  )}

</p>

  {overall.override_message && (
    <div className="pdf-warning-box">
      {overall.override_message}
    </div>
  )}
</section>

{/* SCHOOL GUIDANCE */}
<section className="pdf-section-card">
  <h3 className="pdf-section-heading">
    Target School Guidance (Indicative Only)
  </h3>

  <p><strong>Based on current performance:</strong></p>

  <p><strong>Competitive Range:</strong></p>
  <ul className="pdf-list">
    {(overall.school_recommendation || []).slice(0,3).map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>

  {(overall.school_recommendation || []).length > 3 && (
    <>
      <p><strong>With Further Improvement:</strong></p>

      <ul className="pdf-list">
        {(overall.school_recommendation || []).slice(3).map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </>
  )}
</section>

{/* NEXT STEPS */}
<section className="pdf-section-card">
  <h3 className="pdf-section-heading">
    Recommended Next Steps
  </h3>

  <ul className="pdf-list">
    <li>Focus on improving Writing depth and expression.</li>
    <li>Strengthen advanced Thinking Skills performance.</li>
    <li>Maintain strong Reading and Mathematical Reasoning results.</li>
    <li>Continue regular full-length mock tests under exam conditions.</li>
  </ul>

  <p className="pdf-line">
    <strong>Suggested Preparation Timeline:</strong>
    {" "}6 to 9 months of structured practice
  </p>
</section>
      {/* FOOTER */}
      <footer className="pdf-footer-note">
        This report provides indicative guidance based on Gem Kids Academy
        internal assessment standards. Final placement outcomes are determined
        by official statewide ranking, scaling, and moderation processes.
      </footer>
    </div>
  );
});

export default PrintRoot;