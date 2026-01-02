import React, { useState, useEffect, useRef, useCallback } from "react";
import "./ExamPage_foundational.css";

export default function ExamPageFoundationalSkills() {
  const studentId = sessionStorage.getItem("student_id");

  const hasStartedRef = useRef(false);
  const hasSubmittedRef = useRef(false);
  // ADD THIS
  const [allAnswers, setAllAnswers] = useState({});


  /* =========================
     MODE
  ========================= */
  const [mode, setMode] = useState("loading"); // loading | exam | report

  /* =========================
     SECTION STATE
  ========================= */
  const [sectionName, setSectionName] = useState("");
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [totalSections, setTotalSections] = useState(null);

  const isLastSection =
    totalSections !== null &&
    currentSectionIndex === totalSections - 1;

  /* =========================
     QUESTIONS
  ========================= */
  const [questions, setQuestions] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  /* =========================
     ANSWERS & VISITED
  ========================= */
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});

  /* =========================
     TIMER
  ========================= */
  const [timeLeft, setTimeLeft] = useState(null);

  /* =========================
     REPORT
  ========================= */
  const [report, setReport] = useState(null);

  const questionsReady = Array.isArray(questions) && questions.length > 0;

  /* =========================
     HELPERS
  ========================= */
  const safeSetQuestionIndex = (idx) => {
    if (!questionsReady) return;
    if (idx < 0 || idx >= questions.length) return;
    setCurrentIndex(idx);
  };

  const normalizeQuestions = (rawQuestions) =>
    rawQuestions.map((q) => ({
      q_id: q.q_id,
      question: q.question,
      options: q.options,
      topic: q.topic
    }));

  /* =========================
     LOAD REPORT
  ========================= */
  const loadReport = useCallback(async () => {
    try {
      const res = await fetch(
        `https://web-production-481a5.up.railway.app/api/student/exam-report/foundational-skills?student_id=${studentId}`
      );
      if (!res.ok) return;

      const data = await res.json();
      setReport(data);
      setMode("report");
    } catch (err) {
      console.error("❌ loadReport error:", err);
    }
  }, [studentId]);

  /* =========================
     LOAD SECTION
  ========================= */
  const loadSection = (section, index) => {
    if (!section || !Array.isArray(section.questions)) return;

    hasSubmittedRef.current = false;

    setQuestions(normalizeQuestions(section.questions));
    setSectionName(section.difficulty || "");
    setCurrentSectionIndex(index);
    setCurrentIndex(0);
    
    setVisited({});
  };

  /* =========================
     START EXAM
  ========================= */
  useEffect(() => {
    if (!studentId) return;
    if (hasStartedRef.current) return;

    hasStartedRef.current = true;

    const startExam = async () => {
      try {
        const res = await fetch(
          "https://web-production-481a5.up.railway.app/api/student/start-exam/foundational-skills",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_id: studentId })
          }
        );

        const data = await res.json();

        if (data.completed === true) {
          await loadReport();
          return;
        }

        setTotalSections(data.total_sections);
        loadSection(data.section, data.current_section_index);
        setTimeLeft(data.remaining_time);
        setMode("exam");
      } catch (err) {
        console.error("❌ start-exam error:", err);
      }
    };

    startExam();
  }, [studentId, loadReport]);

  /* =========================
     TIMER
  ========================= */
  useEffect(() => {
    if (mode !== "exam" || timeLeft === null) return;

    if (timeLeft <= 0) {
      finishExam("time_expired");
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, mode]);

  /* =========================
     ANSWERS
  ========================= */
  const handleAnswer = (optionKey) => {
    const qid = questions[currentIndex].q_id;
  
    setAllAnswers(prev => ({
      ...prev,
      [qid]: optionKey
    }));
  };

  /* =========================
     NAVIGATION
  ========================= */
  const nextQuestion = () => {
    setVisited((prev) => ({ ...prev, [currentIndex]: true }));
    safeSetQuestionIndex(currentIndex + 1);
  };

  const prevQuestion = () => {
    safeSetQuestionIndex(currentIndex - 1);
  };

  const jumpToQuestion = (idx) => {
    setVisited((prev) => ({ ...prev, [currentIndex]: true }));
    safeSetQuestionIndex(idx);
  };

  /* =========================
     FINISH EXAM
  ========================= */
  const finishExam = async (reason = "submitted") => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    try {
      await fetch(
        "https://web-production-481a5.up.railway.app/api/student/finish-exam/foundational-skills",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              student_id: studentId,
              answers: allAnswers,
              reason
            })

        }
      );

      await loadReport();
    } catch (err) {
      console.error("❌ finish-exam error:", err);
    }
  };

  /* =========================
     NEXT SECTION
  ========================= */
  const goToNextSection = async () => {
    try {
      const res = await fetch(
        `https://web-production-481a5.up.railway.app/api/exams/foundational/next-section?student_id=${studentId}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (data.completed === true) {
        finishExam("manual_submit");
        return;
      }

      loadSection(data.section, data.current_section_index);
    } catch (err) {
      console.error("❌ next-section error:", err);
    }
  };

  /* =========================
     RENDER
  ========================= */
  if (mode === "loading") return <p className="loading">Loading…</p>;
  if (mode === "report") return <FoundationalSkillsReport report={report} />;
  if (!questionsReady) return <p className="loading">Preparing questions…</p>;

  const currentQ = questions[currentIndex];

  const normalizedOptions = Array.isArray(currentQ.options)
    ? currentQ.options
    : Object.entries(currentQ.options || {}).map(
        ([k, v]) => `${k}) ${v}`
      );

  return (
    <div className="exam-container foundational-exam">
      <div className="exam-header">
        <div className="timer">⏳ {formatTime(timeLeft)}</div>
        <div className="counter">
          Section {currentSectionIndex + 1} | Question {currentIndex + 1} /{" "}
          {questions.length}
        </div>
      </div>

      <div className="section-title">{sectionName}</div>

      <div className="index-row">
        {questions.map((q, i) => (
          <div
            key={q.q_id}
            className={`index-circle ${
              allAnswers[q.q_id]

                ? "index-answered"
                : visited[i]
                ? "index-visited"
                : "index-not-visited"
            }`}
            onClick={() => jumpToQuestion(i)}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <div className="question-card">
        <p className="question-text">{currentQ.question}</p>

        {normalizedOptions.map((opt, i) => {
          const optionKey = opt.split(")")[0];
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleAnswer(optionKey)}
              className={`option-btn ${
                allAnswers[currentQ.q_id] === optionKey ? "selected" : ""
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <div className="nav-buttons">
        <button
          type="button"
          className="nav-btn prev"
          onClick={prevQuestion}
          disabled={currentIndex === 0}
        >
          Previous
        </button>

        {currentIndex < questions.length - 1 ? (
          <button type="button" className="nav-btn next" onClick={nextQuestion}>
            Next
          </button>
        ) : isLastSection ? (
          <button
            type="button"
            className="nav-btn finish"
            onClick={() => finishExam("manual_submit")}
          >
            Submit Exam
          </button>
        ) : (
          <button
            type="button"
            className="nav-btn finish"
            onClick={goToNextSection}
          >
            Next Section
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================
   UTIL
========================= */
function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

/* =========================
   REPORT
========================= */
function FoundationalSkillsReport({ report }) {
  if (!report?.overall) {
    return <p className="loading">Generating your report…</p>;
  }

  const {
    overall,
    topic_wise_performance = [],
    improvement_areas = []
  } = report;

  const accuracy = Math.round(
    (overall.correct / overall.total_questions) * 100
  );

  const donutStyle = {
    "--donut-bg":
      accuracy === 0
        ? "#e5e7eb"
        : `conic-gradient(#22c55e ${accuracy * 3.6}deg, #e5e7eb 0deg)`
  };

  return (
    <div className="report-page">
      {/* ======================================================
          TITLE
      ====================================================== */}
      <h2 className="report-title">
        You scored {overall.correct} out of {overall.total_questions}
      </h2>

      {/* ======================================================
          OVERALL ACCURACY
      ====================================================== */}
      <div className="report-card">
        <h3>Overall Accuracy</h3>

        <div className="donut" style={donutStyle}>
          <span>{accuracy}%</span>
        </div>

        <div className="stats-row">
          <span>Total: {overall.total_questions}</span>
          <span>Attempted: {overall.attempted}</span>
          <span>Correct: {overall.correct}</span>
          <span>Incorrect: {overall.incorrect}</span>
          <span>Not Attempted: {overall.not_attempted}</span>
        </div>
      </div>

      {/* ======================================================
          TOPIC-WISE PERFORMANCE
      ====================================================== */}
      <div className="report-card">
        <h3>Topic-wise Performance</h3>

        {topic_wise_performance.map((t) => {
          const total = t.total || 1;

          const correctPct = (t.correct / total) * 100;
          const incorrectPct = (t.incorrect / total) * 100;
          const notAttemptedPct = (t.not_attempted / total) * 100;

          return (
            <div key={t.topic} className="topic-bar">
              <div className="topic-title">{t.topic}</div>

              <div className="bar">
                <div
                  className="bar-correct"
                  style={{ width: `${correctPct}%` }}
                />
                <div
                  className="bar-incorrect"
                  style={{ width: `${incorrectPct}%` }}
                />
                <div
                  className="bar-not-attempted"
                  style={{ width: `${notAttemptedPct}%` }}
                />
              </div>

              <div className="bar-legend">
                <span>Correct: {t.correct}</span>
                <span>Incorrect: {t.incorrect}</span>
                <span>Not Attempted: {t.not_attempted}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================
          IMPROVEMENT AREAS
      ====================================================== */}
      <div className="report-card">
        <h3>Improvement Areas</h3>

        {improvement_areas.map((t) => (
          <div key={t.topic} className="improvement-row">
            <span>{t.topic}</span>
            <span>{t.accuracy}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
