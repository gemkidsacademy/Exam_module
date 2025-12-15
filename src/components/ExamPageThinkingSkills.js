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

  // exam state
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);

  // post-exam state
  const [submitted, setSubmitted] = useState(false);
  const [report, setReport] = useState(null);

  /* ============================================================
     START / RESUME EXAM
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

        if (!res.ok) {
          setLoading(false);
          return;
        }

        setQuestions(data.questions || []);
        setTimeLeft(data.remaining_time);
        setLoading(false);
      } catch (err) {
        console.error("❌ start-exam error:", err);
      }
    };

    startExam();
  }, [studentId]);

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
     FINISH EXAM (SINGLE SOURCE OF TRUTH)
  ============================================================ */
  const finishExam = useCallback(
    async (reason = "submitted") => {
      if (hasSubmittedRef.current) return;
      hasSubmittedRef.current = true;

      const payload = {
        student_id: studentId,
        answers: answers
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

        // fetch report AFTER successful submission
        const reportRes = await fetch(
          `https://web-production-481a5.up.railway.app/api/student/exam-report/thinking-skills?student_id=${studentId}`
        );

        const reportData = await reportRes.json();
        console.log("📊 report:", reportData);

        setReport(reportData);
        setSubmitted(true);
      } catch (err) {
        console.error("❌ finish-exam error:", err);
      }
    },
    [studentId, answers]
  );

  /* ============================================================
     TIMER (AUTO SUBMIT)
  ============================================================ */
  useEffect(() => {
    if (timeLeft === null || submitted) return;

    if (timeLeft <= 0) {
      finishExam("time_expired");
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, submitted, finishExam]);

  /* ============================================================
     ANSWER HANDLING
  ============================================================ */
  const handleAnswer = (option) => {
    const qid = questions[currentIndex]?.q_id;
    if (!qid) return;

    setAnswers(prev => ({ ...prev, [qid]: option }));
  };

  const goToQuestion = (idx) => setCurrentIndex(idx);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  /* ============================================================
     RENDER STATES
  ============================================================ */
  if (loading) {
    return <p className="loading">Loading exam…</p>;
  }

  if (submitted && report) {
    return <ThinkingSkillsReport report={report} />;
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  /* ============================================================
     EXAM UI
  ============================================================ */
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

        {currentQ.options?.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            className={`option-btn ${
              answers[currentQ.q_id] === opt ? "selected" : ""
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="nav-buttons">
        <button
          onClick={() => goToQuestion(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          Previous
        </button>

        {currentIndex < questions.length - 1 ? (
          <button onClick={() => goToQuestion(currentIndex + 1)}>
            Next
          </button>
        ) : (
          <button onClick={() => finishExam("manual_submit")}>
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
  if (!report) {
    return <p>Generating your report…</p>;
  }

  const { summary, topic_breakdown } = report;

  return (
    <div className="report-container">
      <h2>
        You scored {summary.correct_answers} out of {summary.total_questions}
        {" "}in NSW Selective Thinking Skills Test – Free Trial
      </h2>

      <div className="accuracy-panel">
        <h3>Accuracy</h3>
        <p>{summary.accuracy_percent}%</p>
        <p>Correct: {summary.correct_answers}</p>
        <p>Wrong: {summary.wrong_answers}</p>
      </div>

      <div className="improvements-panel">
        <h3>Improvements</h3>

        {topic_breakdown.map(t => (
          <div key={t.topic} className="topic-row">
            <span>{t.topic}</span>
            <span>{t.accuracy_percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
