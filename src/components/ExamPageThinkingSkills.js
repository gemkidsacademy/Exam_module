import React, {
useState,
useEffect,
useRef,
useCallback
} from "react";
import "./ExamPage.css";
import ThinkingSkillsReview from "./ThinkingSkillsReview";

/* ============================================================
 MAIN COMPONENT
============================================================ */
export default function ExamPageThinkingSkills({
  onExamStart,
  onExamFinish
}) {
const studentId = sessionStorage.getItem("student_id");
const IMAGE_BASE =
"https://storage.googleapis.com/exammoduleimages/";
console.log("🧠 ExamPageThinkingSkills MOUNTED");




const hasSubmittedRef = useRef(false);
const prevIndexRef = useRef(null);
const API_BASE = process.env.REACT_APP_API_URL;

if (!API_BASE) {
  throw new Error("❌ REACT_APP_API_URL is not defined");
}
const [examAttemptId, setExamAttemptId] = useState(null);




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
      `${API_BASE}/api/student/exam-report/thinking-skills?student_id=${studentId}`
    );

    if (!res.ok) {
      console.warn("⚠️ Report not available yet");
      return;
    }

    const data = await res.json();
    console.log("📊 report loaded:", data);

    setReport(data);
    setExamAttemptId(data.exam_attempt_id);
    setMode("report");
  } catch (err) {
    console.error("❌ loadReport error:", err);
  }
}, [studentId]);

useEffect(() => {
  console.log("🔄 MODE CHANGED:", mode);
}, [mode]);


 // 🔑 only what actually matters

/* ============================================================
   START / RESUME EXAM (SINGLE SOURCE OF TRUTH)
============================================================ */
useEffect(() => {
  if (!studentId) return;

  
  if (mode === "report" || mode === "review") {
    console.log("⛔ startExam skipped, mode =", mode);
    return;
  }

  const startExam = async () => {
    const res = await fetch(
      `${API_BASE}/api/student/start-exam-thinkingskills`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId })
      }
    );

    const data = await res.json();

    if (data.completed === true) {
      sessionStorage.setItem("thinking_skills_completed", "true");
      await loadReport();
      return;
    }

    setQuestions(data.questions || []);
    setTimeLeft(data.remaining_time);
    setMode("exam");
    onExamStart?.();
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
      `${API_BASE}/api/student/finish-exam/thinking-skills`,
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
    [qid]: optionKey.toUpperCase()
  }));
};

const goToQuestion = (idx) => {
  if (idx < 0 || idx >= questions.length) return;

  const qid = questions[idx].q_id;
  setVisited(prev => ({ ...prev, [qid]: true }));
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
const isReview = false; // exam-only flag now
const activeQuestions = questions;


// Only block loading for exam & review
if (mode === "exam" && !questions.length) {
  return <p className="loading">Loading…</p>;
}

if (mode === "loading") {
  return <p className="loading">Loading…</p>;
}

if (mode === "report") {
  return (
    <ThinkingSkillsReport
      report={report}
      onViewExamDetails={() => setMode("review")}
    />
  );
}
if (mode === "review") {
  return (
    <ThinkingSkillsReview
      studentId={studentId}
    />
  );
}


// ---------------- EXAM UI ----------------
const currentQ = activeQuestions[currentIndex];
if (!currentQ) return null;
const optionEntries = Object.entries(currentQ.options || {});

return (
<div className="exam-shell">
  <div className="exam-container">

    {/* HEADER */}
    <div className="exam-header">
      {!isReview && (
        <div className="timer">⏳ {formatTime(timeLeft)}</div>
      )}

      <div className="counter">
        Question {currentIndex + 1} / {activeQuestions.length}
      </div>
    </div>

    {/* QUESTION INDEX */}
    <div className="index-row">
  {activeQuestions.map((q, i) => {
    let cls = "index-circle";

    if (isReview) {
      // 🟡 REVIEW MODE
      if (!q.student_answer) {
        cls += " index-skipped";
      } else if (q.student_answer === q.correct_answer) {
        cls += " index-correct";
      } else {
        cls += " index-incorrect";
      }
    } else {
      // 🔵 EXAM MODE (existing behavior)
      cls += " index-not-visited";

      if (visited[q.q_id]) {
        cls = "index-circle index-visited";
      }

      if (answers[q.q_id]) {
        cls = "index-circle index-answered";
      }
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

{/* QUESTION BLOCKS */}
<div className="question-blocks">
{currentQ.blocks?.map((block, idx) => {
  if (block.type === "text") {
    return (
      <p key={idx} className="question-text">
        {block.content}
      </p>
    );
  }

  if (block.type === "image") {
    const cleanSrc = block.src?.trim();
    if (!cleanSrc) return null;
  
    const src = cleanSrc.startsWith("http")
      ? cleanSrc
      : IMAGE_BASE + cleanSrc;
  
    return (
      <img
        key={idx}
        src={src}
        alt={`Question visual ${idx + 1}`}
        className="question-image"
        loading="lazy"
      />
    );
  }



  return null;
})}
</div>

{/* OPTIONS */}
{optionEntries.map(([optionKey, optionValue]) => {
const studentAnswer = isReview
  ? currentQ.student_answer      // backend
  : answers[currentQ.q_id];      // live exam

const correctAnswer = isReview
  ? currentQ.correct_answer
  : null;
let optionClass = "option-btn";

if (isReview) {
  // ✅ review mode logic
  if (optionKey === correctAnswer) {
    optionClass += " correct";
  } else if (
    studentAnswer &&
    optionKey === studentAnswer &&
    studentAnswer !== correctAnswer
  ) {
    optionClass += " incorrect";
  }
} else {
  // ✅ normal exam mode
  if (studentAnswer === optionKey) {
    optionClass += " selected";
  }
}


return (
    <button
      key={optionKey}
      disabled={isReview}
      className={optionClass}
      onClick={() => !isReview && handleAnswer(optionKey)}
    >
      <strong>{optionKey})</strong>

      {optionValue.type === "text" && (
        <span className="option-text">
          {optionValue.content}
        </span>
      )}

      {optionValue.type === "image" && (
        <img
          src={optionValue.src}
          alt={`Option ${optionKey}`}
          className="option-image"
        />
      )}
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

      {currentIndex < activeQuestions.length - 1 ? (
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
function ThinkingSkillsReport({ report, onViewExamDetails }) {
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
    <button
      className="view-exam-btn"
      onClick={() => {
        console.log("🟢 View Exam Details button clicked");
        onViewExamDetails();
      }}
    >
      View Exam Details
    </button>



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
