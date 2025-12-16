import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from "react";
import "./ExamPage_foundational.css";

export default function ExamPageFoundationalSkills() {
  const studentId = sessionStorage.getItem("student_id");
  const hasStartedRef = useRef(false);


  /* ============================================================
     REFS
  ============================================================ */
  const hasSubmittedRef = useRef(false);

  /* ============================================================
     MODE
     loading | exam | report
  ============================================================ */
  const [mode, setMode] = useState("loading");

  /* ============================================================
     SECTION STATE
  ============================================================ */
  const [sectionName, setSectionName] = useState("");
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  /* ============================================================
     QUESTIONS
  ============================================================ */
  const [questions, setQuestions] = useState(null); // null = not ready
  const [currentIndex, setCurrentIndex] = useState(0);

  /* ============================================================
     ANSWERS & VISITED
  ============================================================ */
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});

  /* ============================================================
     TIMER
  ============================================================ */
  const [timeLeft, setTimeLeft] = useState(null);

  /* ============================================================
     REPORT
  ============================================================ */
  const [report, setReport] = useState(null);

  /* ============================================================
     HELPERS
  ============================================================ */
  const questionsReady = Array.isArray(questions) && questions.length > 0;

  const safeSetQuestionIndex = (idx) => {
    console.log("🧭 TRY SET INDEX", {
      target: idx,
      min: 0,
      max: questions?.length - 1
    });
  
    if (!questionsReady) return;
    if (idx < 0 || idx >= questions.length) return;
  
    setCurrentIndex(idx);
  };


  /* ============================================================
     LOAD REPORT
  ============================================================ */
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

  /* ============================================================
     LOAD SECTION (ATOMIC)
  ============================================================ */
  const normalizeQuestions = (rawQuestions) => {
    return rawQuestions.map((q, index) => ({
      question_number: q.question_number, // ✅ CRITICAL
      q_id: q.question_number,             // optional alias
      question: q.question || q.question_text || q.text || q.prompt,
      options: q.options || q.choices || q.answers,
      topic: q.topic
    }));
  };

  const loadSection = (section, sectionIndex) => {
    if (!section || !Array.isArray(section.questions)) {
      console.error("❌ Invalid section payload:", section);
      return;
    }
  
    const normalized = normalizeQuestions(section.questions);
  
    setQuestions(normalized);
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

      loadSection(data.section, data.current_section_index);
      setTimeLeft(data.remaining_time);
      setMode("exam");
    } catch (err) {
      console.error("❌ start-exam error:", err);
    }
  };

  startExam();
}, [studentId]); // 🔥 exactly like ThinkingSkills

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
  }, [timeLeft, mode]);

  /* ============================================================
     ANSWERS
  ============================================================ */
  const handleAnswer = (optionKey) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.question_number]: optionKey
    }));
  };

  /* ============================================================
     NAVIGATION
  ============================================================ */
  const nextQuestion = () => {
    console.log("➡️ NEXT CLICKED", {
      before: currentIndex,
      questionsLength: questions?.length
    });
  
    if (!questionsReady) return;
  
    setVisited(prev => ({ ...prev, [currentIndex]: true }));
    safeSetQuestionIndex(currentIndex + 1);
  };

  const prevQuestion = () => {
    if (!questionsReady) return;
    safeSetQuestionIndex(currentIndex - 1);
  };

  const jumpToQuestion = (idx) => {
    if (!questionsReady) return;
    setVisited(prev => ({ ...prev, [currentIndex]: true }));
    safeSetQuestionIndex(idx);
  };

  /* ============================================================
     FINISH EXAM
  ============================================================ */
  const finishExam = async (reason = "submitted") => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    try {
      await fetch(
        "https://web-production-481a5.up.railway.app/api/student/finish-exam/foundational-skills",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_id: studentId, answers, reason })
        }
      );

      await loadReport();
    } catch (err) {
      console.error("❌ finish-exam error:", err);
    }
  };

  /* ============================================================
     NEXT SECTION
  ============================================================ */
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

  /* ============================================================
     RENDER
  ============================================================ */
  if (mode === "loading") return <p className="loading">Loading…</p>;
  if (mode === "report") return <FoundationalSkillsReport report={report} />;

  if (!questionsReady) {
    return <p className="loading">Preparing questions…</p>;
  }
  const currentQ = questions[currentIndex];
  console.log("🎯 RENDER QUESTION", {
    currentIndex,
    questionText: currentQ?.question
  });

  

  const normalizedOptions = Array.isArray(currentQ.options)
    ? currentQ.options
    : Object.entries(currentQ.options || {}).map(
        ([k, v]) => `${k}) ${v}`
      );
  const qNum = currentQ.question_number;

  return (
    <div className="exam-container foundational-exam">
      <div className="exam-header">
        <div className="timer">⏳ {formatTime(timeLeft)}</div>
        <div className="counter">
          Section {currentSectionIndex + 1} | Question {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="section-title">{sectionName}</div>

      <div className="index-row">
        {questions.map((q, i) => (
          <div
            key={q.q_id}
            
            className={`index-circle ${
              answers[q.question_number]
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
                answers[currentQ.question_number] === optionKey ? "selected" : ""
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
          <button
            type="button"
            className="nav-btn next"
            onClick={nextQuestion}
          >
            Next
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

/* ============================================================
   UTIL
============================================================ */
function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
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

              <span className="percent">{topic.accuracy_percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
