import React, {
useState,
useEffect,
useRef,
useCallback
} from "react";
import "./ExamPageMathematicalReasoning.css";


import OC_MathematicalReasoningReview from "./OC_MathematicalReasoningReview";
       
import "./ExamOptionStates_mr.css";

/* ============================================================
 MAIN COMPONENT
============================================================ */
export default function ExamPageOCMathematicalReasoning({
  onExamStart,
  onExamFinish
}) {
const studentId = sessionStorage.getItem("student_id");
const isPopNavigationRef = useRef(false);

const hasSubmittedRef = useRef(false);
const prevIndexRef = useRef(null);
const [explanation, setExplanation] = useState(null);
const [loadingExplanation, setLoadingExplanation] = useState(false);

/**
 * mode:
 * - loading → deciding what to show
 * - exam    → active attempt
 * - report  → completed attempt
 */
const [mode, setMode] = useState("loading");
const normalizeOptionContent = (content) => {
  if (!content) return { type: "text", content };

  // match "A) filename.png"
  const match = content.match(/\)\s*(.*\.png)$/i);

  if (!match) {
    return { type: "text", content };
  }

  const filename = match[1].trim();

  return {
    type: "image",
    src: `https://storage.googleapis.com/exammoduleimages/${filename}`
  };
};


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
const [attempts, setAttempts] = useState([]);
const [selectedAttemptId, setSelectedAttemptId] = useState(null);

/* ============================================================
   LOAD REPORT (ONLY WHEN EXAM IS COMPLETED)
============================================================ */
/*const loadAttempts = async () => {
  try {
    const res = await fetch(
      `${API_BASE}/api/student/exam-attempts/oc-mathematical-reasoning?student_id=${studentId}`
    );

    if (!res.ok) {
      console.warn("⚠️ Failed to load attempts");
      return;
    }

    const data = await res.json();

    console.log("📅 attempts loaded:", data);

    setAttempts(data.attempts || []);

    // ✅ set default selected attempt
    if (data.attempts?.length > 0) {
      setSelectedAttemptId(data.attempts[0].attempt_id);
    }

  } catch (err) {
    console.error("❌ loadAttempts error:", err);
  }
};*/
const loadReport = useCallback(async (attemptId = null) => {
  try {
    let url = `${API_BASE}/api/student/exam-report/oc-mathematical-reasoning?student_id=${studentId}`;

    if (attemptId) {
      url += `&attempt_id=${attemptId}`;
    }

    const res = await fetch(url);

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
  if (mode === "report") {
    loadAttempts();
  }
}, [mode]);

useEffect(() => {
  if (!selectedAttemptId) return;

  loadReport(selectedAttemptId);
}, [selectedAttemptId]);
useEffect(() => {
  if (mode !== "exam" || questions.length === 0) return;

  window.history.replaceState(
    { questionIndex: 0 },
    "",
    window.location.href
  );

  window.history.pushState(
    { questionIndex: 0 },
    "",
    window.location.href
  );
}, [mode, questions.length]);
useEffect(() => {
  if (mode !== "exam" || questions.length === 0) return;
  if (isPopNavigationRef.current) {
    isPopNavigationRef.current = false;
    return;
  }

  window.history.pushState(
    { questionIndex: currentIndex },
    "",
    window.location.href
  );
}, [currentIndex, mode, questions.length]);
useEffect(() => {
  if (mode !== "exam" || questions.length === 0) return;

  const handlePopState = (e) => {
    const state = e.state;

    // 🔥 CASE 1: On Q1 → block exit
    if (currentIndex === 0) {
      if (!showConfirmFinish) {
        setShowConfirmFinish(true);
      }

      window.history.replaceState(
        { questionIndex: 0 },
        "",
        window.location.href
      );

      return;
    }

    // 🔥 CASE 2: Normal navigation
    if (!state || typeof state.questionIndex !== "number") {
      return;
    }

    isPopNavigationRef.current = true;
    setCurrentIndex(state.questionIndex);
  };

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, [mode, currentIndex, showConfirmFinish]);

useEffect(() => {
  setExplanation(null);
}, [currentIndex]);
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
        `${API_BASE}/api/student/start-exam-oc-mathematical-reasoning`,
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
        setMode("report");
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
        `${API_BASE}/api/student/finish-exam-oc-mathematical-reasoning`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      // ⬅️ ONLY NOW load report
      setMode("report"); 
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
const handleGenerateExplanation = async () => {
  if (!currentQ) return;

  setLoadingExplanation(true);
  setExplanation(null);

  try {
    const response = await fetch(
      `${API_BASE}/api/ai/explain-question-TS`, // reuse same endpoint
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: currentQ.blocks,
          options: currentQ.options,
          correct_answer: currentQ.correct_answer
        })
      }
    );

    const data = await response.json();

    setExplanation(data.explanation);

  } catch (err) {
    console.error("Explanation error", err);
    setExplanation("Failed to generate explanation.");
  }

  setLoadingExplanation(false);
};
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
  attempts={attempts}
  selectedAttemptId={selectedAttemptId}
  onChangeAttempt={(id) => setSelectedAttemptId(id)}
  onViewExamDetails={() => setMode("review")}
/>

);
}
if (mode === "review" && reviewQuestions.length === 0) {
  return (
    <OC_MathematicalReasoningReview
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
      {opt?.type === "image" ? (
       <img
         src={opt.src}
         alt={`Option ${optionKey}`}
         className="option-image"
       />
     ) : (
       <div className="option-row">
         <span className="option-label">{optionKey}.</span>
         <span>{opt?.content}</span>
       </div>
     )}
    </button>
  );
})}
{/* AI EXPLANATION SECTION */}
{isReview && (
  <div style={{ marginTop: "20px" }}>

    <button
      onClick={handleGenerateExplanation}
      disabled={loadingExplanation}
      style={{
        padding: "10px 16px",
        background: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
      }}
    >
      {loadingExplanation ? "Generating..." : "✨ Generate AI Explanation"}
    </button>

    {explanation && (
      <div
        style={{
          marginTop: "15px",
          padding: "15px",
          background: "#f9fafb",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          lineHeight: "1.6"
        }}
      >
        <h4 style={{ marginBottom: "10px" }}>AI Explanation</h4>

        <p
          dangerouslySetInnerHTML={{
            __html: explanation
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/\n/g, "<br/>")
          }}
        />
      </div>
    )}

  </div>
)}

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

function MathematicalReasoningReport({
  report,
  attempts,
  selectedAttemptId,
  onChangeAttempt,
  onViewExamDetails
}) {
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
     <div
       style={{
         position: "fixed",
         inset: 0,
         overflowY: "auto",
         background: "#f3f4f6",
         padding: "32px",
         boxSizing: "border-box",
         zIndex: 1
       }}
     >

      {/* HEADER */}
      <h2
        style={{
          fontSize: "26px",
          fontWeight: "600",
          marginBottom: "16px"
        }}
      >
        You scored {overall.correct} out of {overall.total_questions} in 
        OC Mathematical Reasoning Test
      </h2>
      <div style={{ marginBottom: "16px" }}>
        <select
          value={selectedAttemptId || ""}
          onChange={(e) => onChangeAttempt(Number(e.target.value))}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        >
          {attempts.map((a) => (
            <option key={a.attempt_id} value={a.attempt_id}>
              {new Date(a.completed_at).toLocaleString()}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={() => {
          console.log("🟢 Review Exam button clicked");
          onViewExamDetails();
        }}
        style={{
          padding: "10px 18px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "28px"
        }}
      >
        View Exam Details
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          width: "100%",
          maxWidth: "1200px"
        }}
      >

        {/* OVERALL ACCURACY */}
        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
          }}
        >
          <h3>Overall Accuracy</h3>

          <div style={{ display: "flex", justifyContent: "center", margin: "24px 0" }}>
            <svg width="160" height="160" viewBox="0 0 160 160">

              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#e5e7eb"
                strokeWidth="14"
                fill="none"
              />

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

          <div style={{ lineHeight: "1.8" }}>
            <p>Total Questions: {overall.total_questions}</p>
            <p>Attempted: {overall.attempted}</p>
            <p>Correct: {overall.correct}</p>
            <p>Incorrect: {overall.incorrect}</p>
            <p>Not Attempted: {overall.not_attempted}</p>
            <p>Score: {overall.score_percent}%</p>
          </div>
        </div>

        {/* TOPIC PERFORMANCE */}
        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
          }}
        >
          <h3>Topic-wise Performance</h3>

          {topic_wise_performance.map(t => (
            <div
              key={t.topic}
              style={{ marginBottom: "18px" }}
            >
              <div style={{ marginBottom: "6px", fontWeight: "500" }}>
                {t.topic}
              </div>

              <div
                style={{
                  display: "flex",
                  height: "10px",
                  borderRadius: "6px",
                  overflow: "hidden",
                  background: "#e5e7eb"
                }}
              >
                <div
                  style={{
                    width: `${(t.correct / t.total) * 100}%`,
                    background: "#22c55e"
                  }}
                />

                <div
                  style={{
                    width: `${(t.incorrect / t.total) * 100}%`,
                    background: "#ef4444"
                  }}
                />

                <div
                  style={{
                    width: `${(t.not_attempted / t.total) * 100}%`,
                    background: "#9ca3af"
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "6px",
                  fontSize: "14px"
                }}
              >
                <span>Attempted: {t.attempted}</span>
                <span style={{ color: "#22c55e" }}>Correct: {t.correct}</span>
                <span style={{ color: "#ef4444" }}>Incorrect: {t.incorrect}</span>
                <span style={{ color: "#6b7280" }}>
                  Not Attempted: {t.not_attempted}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* IMPROVEMENT AREAS */}
        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
          }}
        >
          <h3>Improvement Areas</h3>

          {improvement_areas.map(t => (
            <div
              key={t.topic}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "14px"
              }}
            >
              <span style={{ width: "120px" }}>{t.topic}</span>

              <div
                style={{
                  flex: 1,
                  height: "10px",
                  background: "#e5e7eb",
                  borderRadius: "6px",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    width: `${t.accuracy_percent}%`,
                    background: "#2563eb",
                    height: "100%"
                  }}
                />
              </div>

              <span>{t.accuracy_percent}%</span>

              {t.limited_data && (
                <small style={{ color: "#ef4444" }}>
                  Limited data
                </small>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
