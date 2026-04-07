
import React, {
useState,
useEffect,
useRef,
useCallback
} from "react";
import "./ExamPage.css";
import styles from "./ExamPageThinkingSkills.module.css";

import ThinkingSkillsReviewHomework from "./ThinkingSkillsReviewHomework";

/* ============================================================
 MAIN COMPONENT
============================================================ */
export default function ExamPageThinkingSkillsHomework({
  mode: parentMode,
  studentId,
  subject,
  difficulty,
  onExamStart,
  onExamFinish,
}) {
//const studentId = sessionStorage.getItem("student_id");
const [attempts, setAttempts] = useState([]);
const isPopNavigationRef = useRef(false);
const loadAttempts = useCallback(async () => {
  const res = await fetch(
    `${API_BASE}/api/student/exam-attempts/thinking-skills?student_id=${studentId}`
  );

  const data = await res.json();

  console.log("ATTEMPTS API RESPONSE:", data);

  setAttempts(Array.isArray(data) ? data : []);
}, [studentId]);
const formatExplanation = (text) => {
  if (!text) return "";

  return text
    // Bold headings + spacing
    .replace(
      /\*\*(.*?)\*\*/g,
      "<strong style='display:block; margin-top:10px;'>$1</strong>"
    )
    // Paragraph spacing
    .replace(/\n\n/g, "<br/><br/>")
    // Line breaks
    .replace(/\n/g, "<br/>");
};
 
const hasStartedRef = useRef(false);
const IMAGE_BASE =
"https://storage.googleapis.com/exammoduleimages/";
console.log("🧠 ExamPageThinkingSkills MOUNTED");
const [explanation, setExplanation] = useState(null);
const [loadingExplanation, setLoadingExplanation] = useState(false);
 




const hasSubmittedRef = useRef(false);
const normalizeOption = (value) => {

  if (!value) return null;

  // already normalized by backend
  if (typeof value === "object") {
    return value;
  }

  // string image filename
  if (typeof value === "string" && value.match(/\.(png|jpg|jpeg|webp)$/i)) {
    return {
      type: "image",
      src: value.startsWith("http")
        ? value
        : IMAGE_BASE + value
    };
  }

  // text
  return {
    type: "text",
    content: String(value)
  };
};
const API_BASE = process.env.REACT_APP_API_URL;

if (!API_BASE) {
  throw new Error("❌ REACT_APP_API_URL is not defined");
}
const [examAttemptId, setExamAttemptId] = useState(null);
const handleGenerateExplanation = async () => {
  if (!currentQ) return;

  setLoadingExplanation(true);
  setExplanation(null);

  try {
    const response = await fetch(
      `${API_BASE}/api/ai/explain-question-TS`,
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

    if (!response.ok) {
      throw new Error("Failed to generate explanation");
    }

    const data = await response.json();

    setExplanation(data.explanation || "No explanation returned.");

  } catch (err) {
    console.error("Explanation error:", err);
    setExplanation("Failed to generate explanation.");
  } finally {
    setLoadingExplanation(false);
  }
};
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
const loadReport = useCallback(async (attemptId = null) => {
 try {
   let url = `${API_BASE}/api/student/exam-report/thinking-skills?student_id=${studentId}`;

   if (attemptId !== null && attemptId !== undefined) {
     url += `&exam_attempt_id=${attemptId}`;
   }

   const res = await fetch(url);

   if (!res.ok) {
     console.warn("⚠️ Report not available yet");
     return;
   }

   const data = await res.json();

   setReport(data);
   setExamAttemptId(data.exam_attempt_id);
   setMode("report");
 } catch (err) {
   console.error("❌ loadReport error:", err);
 }
}, [studentId]);
useEffect(() => {
  loadAttempts();
}, [loadAttempts]);
 
useEffect(() => {
  if (mode !== "exam") return;

  window.history.replaceState(
   { questionIndex: 0 },
   "",
   window.location.href
 );
}, [mode]);
useEffect(() => {
 if (mode !== "exam") return;

 if (isPopNavigationRef.current) {
   isPopNavigationRef.current = false;
   return;
 }

 window.history.pushState(
   { questionIndex: currentIndex },
   "",
   window.location.href
 );
}, [currentIndex, mode]);


 
useEffect(() => {
  setExplanation(null);
}, [currentIndex]);
useEffect(() => {
  console.log("🔄 MODE CHANGED:", mode);
}, [mode]);

 
useEffect(() => {
 if (mode !== "exam") return;

 const handlePopState = (e) => {
   const state = e.state;

   console.log("POPSTATE:", state);

   // 🔥 CASE 1: user tries to go back from Q1 → block + show modal
   if (currentIndex === 0) {
     setShowConfirmFinish(true);

     // restore history so user stays on page
     window.history.pushState(
       { questionIndex: 0 },
       "",
       window.location.href
     );

     return;
   }

   // 🔥 CASE 2: normal navigation
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
}, [mode, currentIndex]);
 useEffect(() => {
  if (!studentId) return;

  // 🔒 Do NOT override if user is in review mode
  if (mode === "review") return;

  if (mode !== "loading") return;

  if (parentMode === "exam") {
    setMode("exam");
  }

  if (parentMode === "report") {
    loadAttempts().then(() => {
      loadReport();
    });
  }

}, [studentId, parentMode, mode]);
 
 // 🔑 only what actually matters
/* ============================================================
   START / RESUME EXAM (SINGLE SOURCE OF TRUTH)
============================================================ */
useEffect(() => {
  if (!studentId) return;
  if (mode !== "exam") return;
  if (hasStartedRef.current) return; // prevent double call

  hasStartedRef.current = true;

  const startExam = async () => {
    const res = await fetch(
      `${API_BASE}/api/student/start-exam-thinkingskills`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId }),
      }
    );

    const data = await res.json();
    setExamAttemptId(data.exam_attempt_id);

    console.log("🧪 RAW start-exam response:", data);
    console.log("🧪 QUESTIONS PAYLOAD:", data.questions);
    console.log(
      "🧪 FIRST QUESTION OPTIONS:",
      data.questions?.[0]?.options
    );

    // 👉 Only show report if explicitly requested
    if (data.completed === true) {
      await loadReport();
      return;
    }

    // 👉 Normal exam flow (no flicker)
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
    console.log("🚀 finishExam called", {
      reason,
      examAttemptId,
      studentId
    });

    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    if (!examAttemptId) {
      console.error("❌ Missing examAttemptId");
      return;
    }

    console.log("📦 Preparing payload...");

    const payload = {
      student_id: studentId,
      exam_attempt_id: examAttemptId,
      answers
    };

    console.log("📤 Payload:", payload);

    try {
      console.log("🌐 Calling finish-exam API...");

      const response = await fetch(
        `${API_BASE}/api/student/finish-exam/thinking-skills`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      console.log("✅ finish-exam response status:", response.status);

      console.log("📊 Loading report after submission...");
      await loadReport();
      await loadAttempts();
      console.log("✅ Report loaded");

      onExamFinish?.();

    } catch (err) {
      console.error("❌ finish-exam error:", err);
    }
  },
  [studentId, answers, loadReport, onExamFinish, examAttemptId]
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
      attempts={attempts}
      onAttemptChange={(id) => loadReport(id)}
    />

  );
}
 
if (mode === "review" && questions.length === 0) {
 return (
   <ThinkingSkillsReview
     studentId={studentId}
     examAttemptId={examAttemptId}
     attempts={attempts}
     onAttemptChange={(id) => {
       setExamAttemptId(id);
       setQuestions([]); // 🔥 force reload
     }}
     onLoaded={(qs) => {
       setQuestions(qs);
       setCurrentIndex(0);
       setVisited({});
       setAnswers({});
     }}
     onExit={() => {
       // 🔥 reset review state
       setQuestions([]);
       setCurrentIndex(0);
       setVisited({});
       setAnswers({});

       // 🔥 go back to report
       setMode("report");
     }}
   />
 );
}

// ---------------- EXAM UI ----------------
const currentQ = activeQuestions[currentIndex];
if (!currentQ) return null;
console.log("REVIEW QUESTION", currentQ);
const optionEntries = Object.entries(
  currentQ.options ||
  currentQ.choices ||
  currentQ.answer_options ||
  {}
);

return (
<div
  className={styles.examShell}
  style={{
    height: "100vh",
    overflowY: "auto"
  }}
>
  <div className={styles.examContainer}>

    {/* HEADER */}
    <div className={styles.examHeader}>
          {!isReview && (
            <div className="timer">⏳ {formatTime(timeLeft)}</div>
          )}
    
          <div className="counter">
            Question {currentIndex + 1} / {activeQuestions.length}
          </div>
          {isReview && (
  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
    
    {/* 🔽 ATTEMPT DROPDOWN */}
    <select
      className="attempt-dropdown"
      value={examAttemptId}
      onChange={(e) => {
        const id = Number(e.target.value);
        setExamAttemptId(id);
        setQuestions([]);
      }}
    >
      {attempts.map((a, index) => (
        <option key={a.exam_attempt_id} value={a.exam_attempt_id}>
          {new Date(a.completed_at).toLocaleDateString()}
        </option>
      ))}

    </select>

    {/* 🔙 EXIT BUTTON */}
    <button
      className="exit-review-btn"
      onClick={() => {
        console.log("🔙 Exit Review clicked");

        setQuestions([]);
        setCurrentIndex(0);
        setVisited({});
        setAnswers({});

        setMode("report");
      }}
    >
      Exit Review
    </button>

  </div>
)}
    </div>

    {/* QUESTION INDEX */}
    <div className={styles.indexRow}>
      {activeQuestions.map((q, i) => {
        let cls = styles.indexCircle;

        if (isReview) {
          if (!q.student_answer) {
            cls += ` ${styles.indexSkipped}`;
          } else if (q.student_answer === q.correct_answer) {
            cls += ` ${styles.indexCorrect}`;
          } else {
            cls += ` ${styles.indexIncorrect}`;
          }
        } else {
          const qid = String(q.q_id);

          if (answers[qid]) {
            cls += ` ${styles.indexAnswered}`;
          } else if (visited[qid]) {
            cls += ` ${styles.indexVisited}`;
          } else {
            cls += ` ${styles.indexNotVisited}`;
          }

        }
        // 🔍 DEBUG LOG (temporary)
        const qid = String(q.q_id);
        

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
{/* OPTIONS */}
<div className="options-container">

  {optionEntries.map(([optionKey, rawValue]) => {
   console.log("OPTION DEBUG", optionKey, rawValue, normalizeOption(rawValue));

    const optionValue = normalizeOption(rawValue);

    const studentAnswer = isReview
      ? currentQ.student_answer
      : answers[String(currentQ.q_id)];

    const correctAnswer = isReview
      ? currentQ.correct_answer
      : null;

    let optionClass = "option-btn";

    if (isReview) {
      // review mode styling
      if (optionKey === correctAnswer) {
        optionClass += " correct";
      }
      else if (
        studentAnswer &&
        optionKey === studentAnswer &&
        studentAnswer !== correctAnswer
      ) {
        optionClass += " incorrect";
      }
    } 
    else {
      // exam mode styling
      if (studentAnswer === optionKey) {
        optionClass += " selected";
      }
    }

    return (
      <button
        key={optionKey}
        className={optionClass + (isReview ? " review" : "")}
        onClick={() => !isReview && handleAnswer(optionKey)}
      >
        <strong>{optionKey})</strong>

        {optionValue.type === "text" && (
          <span className="option-text">
            {optionValue.content}
          </span>
        )}

        {optionValue?.type === "image" && (
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


</div>
{/* AI EXPLANATION BUTTON */}
{/* AI EXPLANATION SECTION */}
{isReview && (
  <div className="ai-explanation-section">

    <button
      className="generate-explanation-btn"
      onClick={handleGenerateExplanation}
      disabled={loadingExplanation}
    >
      {loadingExplanation ? "Generating Explanation..." : "✨ Generate AI Explanation"}
    </button>

    {explanation && (
      <div className="ai-explanation-box">
        <h4>AI Explanation</h4>
        <div
         dangerouslySetInnerHTML={{
           __html: formatExplanation(explanation)
         }}
       />
      </div>
    )}

  </div>
)}



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
     
     {currentIndex === activeQuestions.length - 1 && !isReview && (
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
);

}

/* ============================================================
 REPORT COMPONENT
============================================================ */
function ThinkingSkillsReport({ report, onViewExamDetails, attempts, onAttemptChange }) {
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

    {/* ===============================
       HEADER (Overall Result – B)
    =============================== */}
    <h2 className="report-title">
      You scored {overall.correct} out of {overall.total_questions} in NSW
      Selective Thinking Skills Test 
    </h2>
    <select
      className="attempt-dropdown"
      value={report.exam_attempt_id}
      onChange={(e) => {
        const id = Number(e.target.value);
        onAttemptChange(id);
      }}
    >
      {attempts.map((a) => (
        <option key={a.exam_attempt_id} value={a.exam_attempt_id}>
          {new Date(a.completed_at).toLocaleDateString()}
        </option>
      ))}
    </select>
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
