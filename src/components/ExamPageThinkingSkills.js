import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from "react";
import "./ExamPage.css";

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function ExamPageThinkingSkills({
    onExamStart,
    onExamFinish
  }) {
  const studentId = sessionStorage.getItem("student_id");

  const hasSubmittedRef = useRef(false);
  const prevIndexRef = useRef(null);
  
  /**
   * mode:
   * - loading → deciding what to show
   * - exam    → active attempt
   * - report  → completed attempt
   */
  const [mode, setMode] = useState("loading");

  // ---------------- EXAM STATE ----------------
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);

  // ---------------- REPORT ----------------
  const [report, setReport] = useState(null);

  /* ============================================================
     LOAD REPORT (ONLY WHEN EXAM IS COMPLETED)
  ============================================================ */
  const loadReport = useCallback(async () => {
    try {
      const res = await fetch(
        `https://web-production-481a5.up.railway.app/api/student/exam-report/thinking-skills?student_id=${studentId}`
      );

      if (!res.ok) {
        console.warn("⚠️ Report not available yet");
        return;
      }

      const data = await res.json();
      console.log("📊 report loaded:", data);

      setReport(data);
      setMode("report");
    } catch (err) {
      console.error("❌ loadReport error:", err);
    }
  }, [studentId]);

  /* ============================================================
     START / RESUME EXAM (SINGLE SOURCE OF TRUTH)
  ============================================================ */
  useEffect(() => {
    if (!studentId) return;

    const startExam = async () => {
      try {
        const res = await fetch(
          "https://web-production-481a5.up.railway.app/api/student/start-exam-thinkingskills",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_id: studentId })
          }
        );

        const data = await res.json();
        console.log("📥 start-exam:", data);

        // ✅ COMPLETED → SHOW REPORT
        if (data.completed === true) {
          await loadReport();
          onExamFinish?.();  
          return;
        }

        // ✅ NEW / IN-PROGRESS → SHOW EXAM
        setQuestions(data.questions || []);
        setTimeLeft(data.remaining_time);
        setMode("exam");
        onExamStart?.();

      } catch (err) {
        console.error("❌ start-exam error:", err);
      }
    };

    startExam();
  }, [studentId, loadReport]);

  /* ============================================================
     MARK VISITED QUESTIONS
  ============================================================ */
  useEffect(() => {
    if (prevIndexRef.current !== null) {
      const prevIdx = prevIndexRef.current;
      const prevQid = questions[prevIdx]?.q_id;

      if (prevQid && !answers[prevQid]) {
        const prevQ = questions[prevIdx];
        if (prevQ && !answers[prevQ.q_id]) {
          setVisited(prev => ({ ...prev, [prevQ.q_id]: true }));
        }

      }
    }

    prevIndexRef.current = currentIndex;
  }, [currentIndex, questions, answers]);

  /* ============================================================
     FINISH EXAM (SUBMIT ONLY — NO UI DECISIONS)
  ============================================================ */
  const finishExam = useCallback(
  async (reason = "submitted") => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    const payload = {
      student_id: studentId,
      answers
    };

    try {
      await fetch(
        "https://web-production-481a5.up.railway.app/api/student/finish-exam/thinking-skills",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      await loadReport();

      // ✅ notify parent
      onExamFinish?.();

    } catch (err) {
      console.error("❌ finish-exam error:", err);
    }
  },
  [studentId, answers, loadReport, onExamFinish]
);

  /* ============================================================
     TIMER (AUTO SUBMIT)
  ============================================================ */
  useEffect(() => {
    if (mode !== "exam" || timeLeft === null) return;

    if (timeLeft <= 0) {
      finishExam("time_expired");
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, mode, finishExam]);

  /* ============================================================
     ANSWER HANDLING
  ============================================================ */
  const handleAnswer = (optionKey) => {
    const qid = questions[currentIndex]?.q_id;
    if (!qid) return;
  
    setAnswers(prev => ({
      ...prev,
      [qid]: optionKey   // ✅ stores "B"
    }));
  };

  const goToQuestion = (idx) => {
    const qid = questions[idx]?.q_id;
    if (qid) {
      setVisited(prev => ({ ...prev, [qid]: true }));
    }
    setCurrentIndex(idx);
  };


  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  /* ============================================================
     RENDER
  ============================================================ */
  if (mode === "loading") {
    return <p className="loading">Loading…</p>;
  }

  if (mode === "report") {
    return <ThinkingSkillsReport report={report} />;
  }

  // ---------------- EXAM UI ----------------
  const currentQ = questions[currentIndex];
  if (!currentQ) return null;
  const normalizedOptions = Array.isArray(currentQ.options)
    ? currentQ.options
    : Object.entries(currentQ.options || {}).map(
        ([k, v]) => `${k}) ${v}`
      );
  return (
  <div className="exam-shell">
    <div className="exam-container">

      {/* HEADER */}
      <div className="exam-header">
        <div className="timer">⏳ {formatTime(timeLeft)}</div>
        <div className="counter">
          Question {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* QUESTION INDEX */}
      <div className="index-row">
        {questions.map((q, i) => {
          let cls = "index-circle index-not-visited";

          if (visited[q.q_id]) {
            cls = "index-circle index-visited";
          }

          if (answers[q.q_id]) {
            cls = "index-circle index-answered";
          }

          return (
            <div
              key={q.q_id}
              className={cls}
              onClick={() => goToQuestion(i)}
            >
              {i + 1}
            </div>
          );
        })}
      </div>

      {/* QUESTION CARD */}
      <div className="question-card">
        <p className="question-text">{currentQ.question}</p>

        {normalizedOptions.map((opt, i) => {
          const optionKey = opt.split(")")[0];

          return (
            <button
              key={i}
              onClick={() => handleAnswer(optionKey)}
              className={`option-btn ${
                answers[currentQ.q_id] === optionKey ? "selected" : ""
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* NAVIGATION */}
      <div className="nav-buttons">
        <button
          className="nav-btn prev"
          onClick={() => goToQuestion(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          Previous
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            className="nav-btn next"
            onClick={() => goToQuestion(currentIndex + 1)}
          >
            Next
          </button>
        ) : (
          <button
            className="nav-btn finish"
            onClick={() => finishExam("manual_submit")}
          >
            Finish Exam
          </button>
        )}
      </div>

    </div>
  </div>
);

}

/* ============================================================
   REPORT COMPONENT
============================================================ */
function ThinkingSkillsReport({ report }) {
  if (!report?.overall) {
    return <p className="loading">Generating your report…</p>;
  }

  const {
    overall,
    topic_wise_performance,
    topic_accuracy,
    improvement_areas
  } = report;

  return (
    <div className="report-page">

      {/* ===============================
         HEADER (Overall Result – B)
      =============================== */}
      <h2 className="report-title">
        You scored {overall.correct} out of {overall.total_questions} in NSW
        Selective Thinking Skills Test – Free Trial
      </h2>

      <div className="report-grid">

        {/* ===============================
          OVERALL ACCURACY (B)
      =============================== */}
      <div className="report-card">
        <h3>Overall Accuracy</h3>
      
        {(() => {
          const accuracy = Math.round(
            (overall.correct / overall.total_questions) * 100
          );

      
          const donutBackground =
            accuracy === 0
              ? "#e5e7eb" // full grey when no correct answers
              : `conic-gradient(
                  #22c55e ${accuracy * 3.6}deg,
                  #e5e7eb 0deg
                )`;
      
          return (
            <div className="donut-wrapper">
              <div
                className="donut"
                style={{ background: donutBackground }}
              >
                <span className="donut-text">
                  {accuracy}%
                </span>
              </div>
            </div>
          );
        })()}
      
        <div className="stats">
          <p>Total Questions: {overall.total_questions}</p>
          <p>Attempted: {overall.attempted}</p>
          <p>Correct: {overall.correct}</p>
          <p>Incorrect: {overall.incorrect}</p>
          <p>Not Attempted: {overall.not_attempted}</p>
          <p>Score: {overall.score_percent}%</p>
        </div>
      </div>


        {/* ===============================
           TOPIC-WISE PERFORMANCE (A)
        =============================== */}
        <div className="topic-performance-card">
          <h3>Topic-wise Performance</h3>
        
          {topic_wise_performance.map(t => (
            <div key={t.topic} className="topic-row">
              <div className="topic-title">{t.topic}</div>
        
              <div className="stack-bar">
                <div
                  className="stack correct"
                  style={{ width: `${(t.correct / t.total) * 100}%` }}
                />
                <div
                  className="stack incorrect"
                  style={{ width: `${(t.incorrect / t.total) * 100}%` }}
                />
                <div
                  className="stack not-attempted"
                  style={{ width: `${(t.not_attempted / t.total) * 100}%` }}
                />
              </div>
        
              <div className="topic-metrics">
                <span>Attempted: {t.attempted}</span>
                <span className="correct">Correct: {t.correct}</span>
                <span className="incorrect">Incorrect: {t.incorrect}</span>
                <span className="not-attempted">
                  Not Attempted: {t.not_attempted}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ===============================
           IMPROVEMENT AREAS (D)
        =============================== */}
        <div className="report-card">
          <h3>Improvement Areas</h3>

          {improvement_areas.map(t => (
            <div key={t.topic} className="topic-bar">
              <span>{t.topic}</span>

              <div className="bar">
                <div
                  className="bar-fill"
                  style={{ width: `${t.accuracy_percent}%` }}
                />
              </div>

              <span>{t.accuracy_percent}%</span>

              {t.limited_data && (
                <small className="warning">Limited data</small>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
