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
export default function ExamPageFoundationalSkills() {
  const studentId = sessionStorage.getItem("student_id");

  const hasSubmittedRef = useRef(false);
  const prevIndexRef = useRef(null);

  /**
   * mode:
   * - loading
   * - exam
   * - report
   */
  const [mode, setMode] = useState("loading");

  // ---------------- SECTION STATE ----------------
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionName, setSectionName] = useState("");

  // ---------------- EXAM STATE ----------------
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);

  // ---------------- REPORT ----------------
  const [report, setReport] = useState(null);

  /* ============================================================
     LOAD REPORT
  ============================================================ */
  const loadReport = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/student/exam-report/foundational-skills?student_id=${studentId}`
      );

      if (!res.ok) return;

      if (!res.ok) {
        const text = await res.text();
        console.error("start-exam failed:", text);
        return;
      }
      
      const data = await res.json();

      setReport(data);
      setMode("report");
    } catch (err) {
      console.error("❌ loadReport error:", err);
    }
  }, [studentId]);

  /* ============================================================
     LOAD SECTION
  ============================================================ */
  const loadSection = (section, sectionIndex) => {
    setQuestions(section.questions || []);
    setSectionName(section.name || "");
    setCurrentSectionIndex(sectionIndex);
    setCurrentIndex(0);
    setVisited({});
  };

  /* ============================================================
     START / RESUME EXAM
  ============================================================ */
  useEffect(() => {
    if (!studentId) return;

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

        loadSection(data.section, data.current_section_index);
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
     FINISH EXAM
  ============================================================ */
  const finishExam = useCallback(
    async (reason = "submitted") => {
      if (hasSubmittedRef.current) return;
      hasSubmittedRef.current = true;

      try {
        await fetch(
          "/api/student/finish-exam/foundational-skills",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              student_id: studentId,
              answers,
              reason
            })
          }
        );

        await loadReport();
      } catch (err) {
        console.error("❌ finish-exam error:", err);
      }
    },
    [studentId, answers, loadReport]
  );

  /* ============================================================
     NEXT SECTION
  ============================================================ */
  const goToNextSection = async () => {
    try {
      const res = await fetch(
        `/api/exams/foundational/next-section?student_id=${studentId}`,
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

  /* ============================================================
     TIMER
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
      [qid]: optionKey
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
    return <FoundationalSkillsReport report={report} />;
  }

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
          Section {currentSectionIndex + 1} | Question {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="section-title">
        {sectionName}
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
            onClick={goToNextSection}
          >
            Next Section
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   REPORT COMPONENT
============================================================ */
function FoundationalSkillsReport({ report }) {
  if (!report?.summary) {
    return <p className="loading">Generating your report…</p>;
  }

  const { summary, topic_breakdown } = report;

  return (
    <div className="report-page">
      <h2 className="report-title">
        You scored {summary.correct_answers} out of {summary.total_questions} in Foundational Skills Test
      </h2>

      <div className="report-grid">
        <div className="report-card">
          <h3>Accuracy</h3>

          <div className="donut">
            <span>{summary.accuracy_percent}%</span>
          </div>

          <div className="stats">
            <p>Correct: {summary.correct_answers}</p>
            <p>Wrong: {summary.wrong_answers}</p>
          </div>
        </div>

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
