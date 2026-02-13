import React, {
useState,
useEffect,
useRef,
useCallback
} from "react";
import "./ExamPageMathematicalReasoning.css";

import MathematicalReasoningReview from "./MathematicalReasoningReview";
import "./ExamOptionStates_mr.css";

/* ============================================================
 MAIN COMPONENT
============================================================ */
export default function ExamPageMathematicalReasoning({
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
const [showConfirmFinish, setShowConfirmFinish] = useState(false);


const [reviewQuestions, setReviewQuestions] = useState([]);
const activeQuestions =
  mode === "review" ? reviewQuestions : questions;

const [currentIndex, setCurrentIndex] = useState(0);
const [answers, setAnswers] = useState({});
const [visited, setVisited] = useState({});
const [timeLeft, setTimeLeft] = useState(null);
const API_BASE = process.env.REACT_APP_API_URL;


if (!API_BASE) {
  throw new Error("❌ REACT_APP_API_URL is not defined");
}


// ---------------- REPORT ----------------
const [report, setReport] = useState(null);

/* ============================================================
   LOAD REPORT (ONLY WHEN EXAM IS COMPLETED)
============================================================ */
const loadReport = useCallback(async () => {
  try {
    const res = await fetch(
      `${API_BASE}/api/student/exam-report/mathematical-reasoning?student_id=${studentId}`
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
useEffect(() => {
  console.log("🔄 MODE CHANGED:", mode);
}, [mode]);

/* ============================================================
   START / RESUME EXAM (SINGLE SOURCE OF TRUTH)
============================================================ */
useEffect(() => {
  if (!studentId) return;
  if (mode === "report" || mode === "review") return;

  const startExam = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/student/start-exam`,
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

      // ✅ NORMALIZE QUESTIONS (CRITICAL FIX)
      const normalizedQuestions = (data.questions || []).map(q => {
      const rawBlocks = Array.isArray(q.question_blocks)
        ? q.question_blocks
        : Array.isArray(q.blocks)
        ? q.blocks
        : [];
    
      return {
        ...q,
        blocks: rawBlocks.map(block => {
          if (
            block?.type === "image" &&
            block?.src &&
            !block.src.startsWith("http")
          ) {
            return {
              ...block,
              src: `https://storage.googleapis.com/exammoduleimages/${block.src}`
            };
          }
          return block;
        })
      };
    });



      setQuestions(normalizedQuestions);
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
    const prevQ = activeQuestions[prevIdx];

    if (prevQ && !answers[prevQ.q_id]) {
      setVisited(prev => ({ ...prev, [prevQ.q_id]: true }));
    }
  }

  prevIndexRef.current = currentIndex;
}, [currentIndex, activeQuestions, answers]);
 
useEffect(() => {
  if (questions.length > 0) {
    console.log("🧠 SAMPLE QUESTION OBJECT:", questions[0]);
  }
}, [questions]);


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
    console.log(
      "🧪 FINAL ANSWERS OBJECT:",
      JSON.stringify(answers, null, 2)
    );

    try {
      await fetch(
        `${API_BASE}/api/student/finish-exam`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      // ⬅️ ONLY NOW load report
      await loadReport();
      onExamFinish?.();

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
  if (timeLeft === null) return;

  // ⏱️ TIME UP ALWAYS WINS — NO UI STATE CAN BLOCK THIS
  if (timeLeft <= 0) {
    if (!hasSubmittedRef.current) {
      setShowConfirmFinish(false);
      finishExam("time_expired");
    }
    return;
  }

  // ⏸️ pause ticking while confirm modal is open
  if (showConfirmFinish) return;

  const interval = setInterval(() => {
    setTimeLeft(t => t - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [timeLeft, showConfirmFinish, finishExam]);

/* ============================================================
   ANSWER HANDLING
============================================================ */
const handleAnswer = (optionKey) => {
  if (mode === "review") return;
  const qid = activeQuestions[currentIndex]?.q_id;
  if (!qid) return;

  setAnswers(prev => ({
    ...prev,
    [qid]: optionKey.toUpperCase().trim()
  }));
};

const goToQuestion = (idx) => {
  const qid = activeQuestions[idx]?.q_id;
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
return (
  <MathematicalReasoningReport
    report={report}
    onViewExamDetails={() => setMode("review")}
  />

);
}
if (mode === "review" && reviewQuestions.length === 0) {
  return (
    <MathematicalReasoningReview
      studentId={studentId}
      onLoaded={(questions) => {
        console.log("✅ Review questions received:", questions.length);

        const normalized = questions.map(q => {
          const rawBlocks = Array.isArray(q.question_blocks)
            ? q.question_blocks
            : Array.isArray(q.blocks)
            ? q.blocks
            : [];

          return {
            ...q,
            blocks: rawBlocks.map(block => {
              if (
                block?.type === "image" &&
                block?.src &&
                !block.src.startsWith("http")
              ) {
                return {
                  ...block,
                  src: `https://storage.googleapis.com/exammoduleimages/${block.src}`
                };
              }
              return block;
            })
          };
        });

        console.log("🧪 REVIEW QUESTION SAMPLE (normalized)", {
          q_id: normalized[0]?.q_id,
          student_answer: normalized[0]?.student_answer,
          correct_answer: normalized[0]?.correct_answer,
          blocks: normalized[0]?.blocks
        });

        setReviewQuestions(normalized);
        setCurrentIndex(0);
      }}
    />
  );
}

// ---------------- EXAM UI ----------------
 

const currentQ = activeQuestions[currentIndex];
if (!currentQ) return null;
const isReview = mode === "review";
const optionEntries = Object.entries(currentQ.options || {});

 
 
return (
<div className="exam-shell">
  <div className="exam-container">

    {/* HEADER */}
    <div className="exam-header">
      {mode === "exam" && (
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
        const student = q.student_answer?.trim().toUpperCase();
        const correct = q.correct_answer?.trim().toUpperCase();
      
        if (!student) {
          cls += " index-not-visited";   // skipped → grey
        } else if (student === correct) {
          cls += " index-answered";      // correct → green
        } else {
          cls += " index-wrong";         // incorrect → red
        }
      } else {
      // 🔵 exam mode (unchanged behavior)
      if (answers[q.q_id]) {
        cls += " index-answered";
      } else if (visited[q.q_id]) {
        cls += " index-visited";
      } else {
        cls += " index-not-visited";
      }
    }
    console.log("🧪 INDEX DEBUG", {
      qid: q.q_id,
      student: q.student_answer,
      correct: q.correct_answer,
      computedClass: cls
    });

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

{/* ✅ RENDER QUESTION BLOCKS */}
{Array.isArray(currentQ.blocks) &&
  currentQ.blocks.map((block, idx) => {
    if (block.type === "text") {
      return (
        <p key={idx} className="question-text">
          {block.content}
        </p>
      );
    }

    if (block.type === "image") {
      return (
        <img
          key={idx}
          src={block.src}
          alt={`Question visual ${idx + 1}`}
          className="question-image"
        />
      );
    }

    return null;
  })}

{/* OPTIONS */}
{optionEntries.map(([key, opt], i) => {
  const optionKey = key.toUpperCase();
  const student = currentQ.student_answer?.trim().toUpperCase();
  const correct = currentQ.correct_answer?.trim().toUpperCase();
  
  let statusClass = "";
  
  if (isReview) {
    if (optionKey === correct) {
      statusClass = "option-correct";     // green
    } else if (optionKey === student) {
      statusClass = "option-wrong";       // red
    }
  } else {
    if (answers[currentQ.q_id] === optionKey) {
      statusClass = "selected";
    }
  }

  return (
    <button
      key={i}
      disabled={isReview}
      className={`option-btn ${statusClass}`}
      onClick={() => !isReview && handleAnswer(optionKey)}
    >
      {opt?.content || opt}
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

      {currentIndex < activeQuestions.length - 1 && (
        <button
          className="nav-btn next"
          onClick={() => goToQuestion(currentIndex + 1)}
        >
          Next
        </button>
      )}

      {mode !== "review" &&
        currentIndex === activeQuestions.length - 1 && (
          <button
           className="nav-btn finish"
           onClick={() => setShowConfirmFinish(true)}
         >
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
)
}


/* ============================================================
 REPORT COMPONENT
============================================================ */

function MathematicalReasoningReport({ report, onViewExamDetails }) {
if (!report?.overall) {
  return <p className="loading">Generating your report…</p>;
}


const {
  overall,
  topic_wise_performance,
  topic_accuracy,
  improvement_areas
} = report;
const greyPercent =
 (overall.correct / overall.total_questions) * 100;
const percentage = Math.round(greyPercent);
return (
  <div className="report-page">

    {/* ===============================
       HEADER (Overall Result – B)
    =============================== */}
    <h2 className="report-title">
      You scored {overall.correct} out of {overall.total_questions} in NSW
      Selective Mathematical Reasoning Test 
    </h2>
    <button
      className="view-exam-btn"
      onClick={() => {
        console.log("🟢 Review Exam button clicked");
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

        <div style={{ display: "flex", justifyContent: "center", margin: "24px 0" }}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#e5e7eb"
              strokeWidth="14"
              fill="none"
            />
        
            {/* Progress ring (GREEN = correct) */}
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#22c55e"
              strokeWidth="14"
              fill="none"
              strokeDasharray={`${percentage * 4.4} 999`}
              strokeLinecap="round"
              transform="rotate(-90 80 80)"
            />
        
            {/* Center percentage */}
            <text
              x="80"
              y="88"
              textAnchor="middle"
              fontSize="24"
              fontWeight="600"
              fill="#111827"
            >
              {percentage}%
            </text>
          </svg>
        </div>



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
