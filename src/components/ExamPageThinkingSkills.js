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
export default function ExamPageThinkingSkills() {
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
          "https://web-production-481a5.up.railway.app/api/student/start-exam",
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
          return;
        }

        // ✅ NEW / IN-PROGRESS → SHOW EXAM
        setQuestions(data.questions || []);
        setTimeLeft(data.remaining_time);
        setMode("exam");

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
        setVisited(prev => ({ ...prev, [prevIdx]: true }));
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

      console.log("📤 finish-exam payload:", payload);

      try {
        await fetch(
          "https://web-production-481a5.up.railway.app/api/student/finish-exam",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }
        );

        // ⬅️ ONLY NOW load report
        await loadReport();

      } catch (err) {
        console.error("❌ finish-exam error:", err);
      }
    },
    [studentId, answers, loadReport]
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

  const goToQuestion = (idx) => setCurrentIndex(idx);

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
    <div className="exam-container">
      <div className="exam-header">
        <div className="timer">⏳ {formatTime(timeLeft)}</div>
        <div className="counter">
          Question {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="index-row">
        {questions.map((q, i) => (
          <div
            key={q.q_id}
            className={`index-circle ${
              answers[q.q_id]
                ? "index-answered"
                : visited[i]
                ? "index-visited"
                : "index-not-visited"
            }`}
            onClick={() => goToQuestion(i)}
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
  );
}

/* ============================================================
   REPORT COMPONENT
============================================================ */
function ThinkingSkillsReport({ report }) {
  if (!report?.summary) {
    return <p className="loading">Generating your report…</p>;
  }

  const { summary, topic_breakdown } = report;

  return (
    <div className="report-page">
      {/* Header */}
      <h2 className="report-title">
        You scored {summary.correct_answers} out of{" "}
        {summary.total_questions} in NSW Selective Thinking Skills Test – Free Trial
      </h2>

      <div className="report-grid">
        {/* Accuracy Card */}
        <div className="report-card">
          <h3>Accuracy</h3>

          {/* Donut placeholder */}
          <div className="donut">
            <span>{summary.accuracy_percent}%</span>
          </div>

          <div className="legend">
            <div>
              <span className="dot green" /> Correct Answer
            </div>
            <div>
              <span className="dot red" /> Wrong Answer
            </div>
          </div>

          <div className="stats">
            <p>Correct: {summary.correct_answers}</p>
            <p>Wrong: {summary.wrong_answers}</p>
          </div>
        </div>

        {/* Improvements */}
        <div className="report-card">
          <h3>Topic Breakdown</h3>

          {topic_breakdown.map(topic => (
            <div key={topic.topic} className="topic-bar">
              <span className="topic-name">{topic.topic}</span>

              <div className="bar">
                <div
                  className="bar-fill"
                  style={{ width: `${topic.accuracy_percent}%` }}
                />
              </div>

              <span className="percent">
                {topic.accuracy_percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

