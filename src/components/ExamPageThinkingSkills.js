import React, {
useState,
useEffect,
useRef,
useCallback
} from "react";
import "./ExamPage.css";
import styles from "./ExamPageThinkingSkills.module.css";

import ThinkingSkillsReview from "./ThinkingSkillsReview";

/* ============================================================
 MAIN COMPONENT
============================================================ */
export default function ExamPageThinkingSkills({
  onExamStart,
  onExamFinish
}) {
const studentId = sessionStorage.getItem("student_id");
const hasStartedRef = useRef(false);
const IMAGE_BASE =
"https://storage.googleapis.com/exammoduleimages/";
console.log("🧠 ExamPageThinkingSkills MOUNTED");




const hasSubmittedRef = useRef(false);
const normalizeOption = (optionValue) => {
  if (typeof optionValue === "string") {
    // image filename
    if (optionValue.match(/\.(png|jpg|jpeg|webp)$/i)) {
      return {
        type: "image",
        src: IMAGE_BASE + optionValue,
      };
    }

    // plain text
    return {
      type: "text",
      content: optionValue,
    };
  }

  return optionValue; // already normalized
};




const API_BASE = process.env.REACT_APP_API_URL;

if (!API_BASE) {
  throw new Error("❌ REACT_APP_API_URL is not defined");
}
const [examAttemptId, setExamAttemptId] = useState(null);
const handleViewExamDetails = () => {
  console.log("🟢 View Exam Details button clicked");

  // 🔥 force clean transition
  setQuestions([]);
  setCurrentIndex(0);
  setVisited({});
  setAnswers({});

  setMode("review");
};




/**
 * mode:
 * - loading → deciding what to show
 * - exam    → active attempt
 * - report  → completed attempt
 */
const [mode, setMode] = useState("loading");
const isReview = mode === "review";



// ---------------- EXAM STATE ----------------
const [questions, setQuestions] = useState([]);




const [currentIndex, setCurrentIndex] = useState(0);
const [answers, setAnswers] = useState({});
const [visited, setVisited] = useState({});
const [timeLeft, setTimeLeft] = useState(null);
const [showConfirmFinish, setShowConfirmFinish] = useState(false);


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

useEffect(() => {
  if (!studentId) return;

  setMode("exam");
}, [studentId]);

 // 🔑 only what actually matters

/* ============================================================
   START / RESUME EXAM (SINGLE SOURCE OF TRUTH)
============================================================ */
useEffect(() => {
  if (!studentId) return;
  if (mode !== "exam") return;
  if (hasStartedRef.current) return;   // 🔒 prevent double call

  hasStartedRef.current = true;

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
    // 🔥 ADD THESE LOGS
    console.log("🧪 RAW start-exam response:", data);
    console.log("🧪 QUESTIONS PAYLOAD:", data.questions);
    console.log(
      "🧪 FIRST QUESTION OPTIONS:",
      data.questions?.[0]?.options
    );

    if (data.completed === true) {
      sessionStorage.setItem("thinking_skills_completed", "true");
      await loadReport();
      return;
    }

    setQuestions(data.questions || []);
    setTimeLeft(data.remaining_time);
    onExamStart?.();
  };

  startExam();
}, [studentId, mode]);
useEffect(() => {
  if (mode !== "exam") {
    hasStartedRef.current = false;
  }
}, [mode]);
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
    setShowConfirmFinish(false); // ✅ force-close modal
    finishExam("time_expired");
    return;
  }

  if (showConfirmFinish) return;

  const interval = setInterval(() => {
    setTimeLeft(t => t - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [timeLeft, mode, showConfirmFinish, finishExam]);

/* ============================================================
   ANSWER HANDLING
============================================================ */
const handleAnswer = (optionKey) => {
  console.log("ANSWER CLICKED", optionKey, questions[currentIndex]?.q_id);

  const qid = String(questions[currentIndex]?.q_id);

  if (!qid) return;

  setAnswers(prev => ({
    ...prev,
    [qid]: optionKey.toUpperCase()
  }));
};

const goToQuestion = (idx) => {
  if (idx < 0 || idx >= questions.length) return;

  const qid = String(questions[idx].q_id);


  if (!isReview) {
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
     onViewExamDetails={handleViewExamDetails}
   />

  );
}
 
if (mode === "review" && !questions.length) {
  return (
    <ThinkingSkillsReview
      studentId={studentId}
      examAttemptId={examAttemptId}
      onLoaded={(qs) => {
        setQuestions(qs);
        setCurrentIndex(0);
        setVisited({});
        setAnswers({});
      }}

    />
  );
}


// ---------------- EXAM UI ----------------
const currentQ = activeQuestions[currentIndex];
if (!currentQ) return null;

const optionEntries = Object.entries(currentQ.options || {});

return (
<div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>

  <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "32px 48px" }}>

    {/* HEADER */}
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
      {!isReview && (
        <div style={{ fontWeight: "bold" }}>
          ⏳ {formatTime(timeLeft)}
        </div>
      )}

      <div>
        Question {currentIndex + 1} / {activeQuestions.length}
      </div>
    </div>

    {/* QUESTION INDEX */}
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
      {activeQuestions.map((q, i) => {

        let bg = "#e5e7eb";

        if (isReview) {
          if (!q.student_answer) bg = "#9ca3af";
          else if (q.student_answer === q.correct_answer) bg = "#22c55e";
          else bg = "#ef4444";
        } else {
          const qid = String(q.q_id);

          if (answers[qid]) bg = "#2563eb";
          else if (visited[qid]) bg = "#f59e0b";
        }

        return (
          <div
            key={q.q_id}
            onClick={() => goToQuestion(i)}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: bg,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 14
            }}
          >
            {i + 1}
          </div>
        );
      })}
    </div>

    {/* SCROLLABLE QUESTION AREA */}
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "24px",
        background: "#ffffff",
        minHeight: 0
      }}
    >

      {/* QUESTION BLOCKS */}
      {currentQ.blocks?.map((block, idx) => {

        if (block.type === "text") {
          return (
            <p
              key={idx}
              style={{
                fontSize: "16px",
                lineHeight: "1.6",
                marginBottom: "12px"
              }}
            >
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
              loading="lazy"
              style={{
                maxWidth: "100%",
                height: "auto",
                display: "block",
                marginBottom: "16px",
                borderRadius: "6px"
              }}
            />
          );
        }

        return null;

      })}

      {/* OPTIONS */}
      {optionEntries.map(([optionKey, rawValue]) => {

        const optionValue = normalizeOption(rawValue);

        const studentAnswer = isReview
          ? currentQ.student_answer
          : answers[String(currentQ.q_id)];

        const correctAnswer = isReview
          ? currentQ.correct_answer
          : null;

        let background = "#f3f4f6";

        if (isReview) {
          if (optionKey === correctAnswer) background = "#bbf7d0";
          else if (studentAnswer === optionKey && studentAnswer !== correctAnswer)
            background = "#fecaca";
        } else {
          if (studentAnswer === optionKey) background = "#bfdbfe";
        }

        return (
          <button
            key={optionKey}
            onClick={() => !isReview && handleAnswer(optionKey)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "10px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background,
              cursor: isReview ? "default" : "pointer",
              textAlign: "left"
            }}
          >

            <strong>{optionKey})</strong>{" "}

            {optionValue.type === "text" && (
              <span>{optionValue.content}</span>
            )}

            {optionValue.type === "image" && (
              <img
                src={optionValue.src}
                alt={`Option ${optionKey}`}
                style={{
                  maxWidth: "100%",
                  marginTop: "8px"
                }}
              />
            )}

          </button>
        );
      })}

    </div>

    {/* NAVIGATION */}
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>

      <button
        onClick={() => goToQuestion(currentIndex - 1)}
        disabled={currentIndex === 0}
      >
        Previous
      </button>

      {currentIndex < activeQuestions.length - 1 && (
        <button onClick={() => goToQuestion(currentIndex + 1)}>
          Next
        </button>
      )}

      {currentIndex === activeQuestions.length - 1 && !isReview && (
        <button onClick={() => setShowConfirmFinish(true)}>
          Finish Exam
        </button>
      )}

    </div>

  </div>


  {showConfirmFinish && (
  <div className="confirm-overlay">
    <div className="confirm-modal">
      <h3>Finish Exam?</h3>
      <p>
        Are you sure you want to submit your exam?
        <br />
        You won’t be able to change your answers after this.
      </p>

      <div className="confirm-actions">
        <button
          className="btn cancel"
          onClick={() => setShowConfirmFinish(false)}
        >
          Cancel
        </button>

        <button
          className="btn confirm"
          onClick={() => {
            setShowConfirmFinish(false);
            finishExam("manual_submit");
          }}
        >
          Yes, Submit Exam
        </button>
      </div>
    </div>
  </div>
)}


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
      Selective Thinking Skills Test 
    </h2>
    <button
      className="view-exam-btn"
      onClick={onViewExamDetails}
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
