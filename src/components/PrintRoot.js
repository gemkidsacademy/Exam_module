// PrintRoot.jsx
import { forwardRef } from "react";
import "./SelectiveReadinessOverall.css";

const PrintRoot = forwardRef(function PrintRoot(props, ref) {
  const { overall } = props;

  if (!overall) {
    return (
      <div ref={ref} className="pdf-report-page">
        Preparing report...
      </div>
    );
  }

  const studentName = overall.student_name || overall.student_id;
  const studentId = overall.student_id;
  const yearLevel = overall.year_level || "Year 5";
  const examDate = overall.exam_date;

  const components = overall.components || {};

  const reading = components.reading || {};
  const maths = components.mathematical_reasoning || {};
  const thinking = components.thinking_skills || {};
  const writing = components.writing || {};

  function getPerformanceLevel(score) {
    const val = Number(score || 0);

    if (val >= 85) return "Excellent";
    if (val >= 75) return "Very Strong";
    if (val >= 65) return "Strong";
    if (val >= 50) return "Sound";
    return "Needs Improvement";
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
          <p>{strengths}</p>
        </div>

        <div className="pdf-sub-block">
          <div className="pdf-mini-title">Area to Improve</div>
          <p>{improve}</p>
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
    {studentName} is performing at a solid level across core sections. With
    focused improvement in Writing and continued development in Thinking
    Skills, {studentName.split(" ")[0]} is well positioned to strengthen
    selective competitiveness further.
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

  <p><strong>With Further Improvement:</strong></p>
  <ul className="pdf-list">
    {(overall.school_recommendation || []).slice(3).map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
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