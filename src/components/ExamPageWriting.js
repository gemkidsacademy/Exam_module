  import React, { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import "./WritingComponent.css";
  


  const API_BASE = process.env.REACT_APP_API_URL;
  console.log("🧪 API_BASE:", API_BASE);

  if (!API_BASE) {
    throw new Error("❌ REACT_APP_API_URL is not defined");
  }

  const parseWritingPrompt = (text) => {
      if (!text) return {};
    
      const sections = {};
      const regex =
        /(TITLE|TASK|STATEMENT|INSTRUCTIONS|OPENING SENTENCE|GUIDELINES):([\s\S]*?)(?=(TITLE|TASK|STATEMENT|INSTRUCTIONS|OPENING SENTENCE|GUIDELINES):|$)/g;
    
      let match;
      while ((match = regex.exec(text)) !== null) {
        const key = match[1].toLowerCase().replace(" ", "_");
        const value = match[2].trim();
        sections[key] = value;
      }
    
      return sections;
    };
  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  export default function WritingComponent({
    studentId,
    mode: parentMode, 
    onExamStart,
    onExamFinish
  }) {
  
    /* -----------------------------------------------------------
       STATE
    ----------------------------------------------------------- */
    const [exam, setExam] = useState(null);
    const [examActive, setExamActive] = useState(false);
    const navigate = useNavigate();

    const CATEGORY_LABELS = {
      audience_purpose_form: "Audience, Purpose & Form",
      ideas_content: "Ideas & Content",
      structure_organisation: "Structure & Organisation",
      language_vocabulary: "Language & Vocabulary",
      grammar_spelling_punctuation: "Grammar, Spelling & Punctuation"
    };

    const [timeLeft, setTimeLeft] = useState(0);
    const [history, setHistory] = useState([]);
    const [selectedAttempt, setSelectedAttempt] = useState(null);
    const [answerText, setAnswerText] = useState("");
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showPrompt, setShowPrompt] = useState(true);
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmFinish, setShowConfirmFinish] = useState(false);

    


    const loadResultByAttempt = async (attemptId) => {
    const endpoint =
      parentMode === "homework"
        ? `/api/student/homework-writing-result-by-attempt?attempt_id=${attemptId}`
        : `/api/exams/writing/result-by-attempt?attempt_id=${attemptId}`;

    const res = await fetch(`${API_BASE}${endpoint}`);
    const data = await res.json();
    setResult(data);
  };


    const parsedPrompt = React.useMemo(() => {
      if (!exam?.question_text) return {};
      return parseWritingPrompt(exam.question_text);
    }, [exam]);
    useEffect(() => {
  if (!examActive) return;
  if (!exam) return;

  const handleBeforeUnload = (e) => {
    e.preventDefault();
    e.returnValue = ""; // 🔥 browser confirmation
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, [examActive, exam]);
    useEffect(() => {
      if (!result?.attempt_id) return;

      const endpoint =
        parentMode === "homework"
          ? `/api/student/homework-writing-history-by-attempt?attempt_id=${result.attempt_id}`
          : `/api/exams/writing/history-by-attempt?attempt_id=${result.attempt_id}`;

      fetch(`${API_BASE}${endpoint}`)
        .then(res => res.json())
        .then(data => {
          setHistory(data);

          // default = latest snapshot (first item)
          if (data.length > 0 && !selectedAttempt) {
            const latestId = data[0].attempt_id;
            setSelectedAttempt(latestId);
            
          }
        })
        .catch(err => {
          console.error("❌ Failed to load history:", err);
        });
    }, [result?.attempt_id]);
    
    //useEffect(() => {
      //document.addEventListener("contextmenu", e => e.preventDefault());
     // document.addEventListener("copy", e => e.preventDefault());
      //document.addEventListener("cut", e => e.preventDefault());
    //}, []);
    useEffect(() => {
      document.documentElement.style.height = "auto";
      document.body.style.height = "auto";
      document.body.style.overflowY = "auto";
    }, []);    
    const loadResult = async () => {
  try {
    const endpoint =
      parentMode === "homework"
        ? `/api/student/homework-writing-report?student_id=${studentId}`
        : `/api/exams/writing/result?student_id=${studentId}`;

    const res = await fetch(`${API_BASE}${endpoint}`);

    if (!res.ok) throw new Error("Failed to load writing result");

    const data = await res.json();
    setResult(data);

  } catch (err) {
    console.error("❌ loadResult error:", err);
  }
};  
    const startHomeworkWriting = async () => {
  try {
    if (!studentId) {
      console.error("❌ studentId missing");
      return;
    }

    const res = await fetch(
      `${API_BASE}/api/student/start-homework-writing?student_id=${studentId}`,
      { method: "POST" }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ API failed:", errText);
      return;
    }

    const meta = await res.json();

    console.log("🟣 START HOMEWORK WRITING:", meta);

    if (meta.completed === true) {
      setCompleted(true);
      setLoading(false);
      await loadResult();
      onExamFinish?.();
      return;
    }

    if (!meta.homework_id) {
      console.error("❌ Missing homework_id:", meta);
      return;
    }

    setTimeLeft(meta.remaining_time);

    const examRes = await fetch(
      `${API_BASE}/api/student/homework-writing-content/${meta.homework_id}?student_id=${studentId}`
    );

    const examData = await examRes.json();

    setExam(examData.exam);
    setExamActive(true);

    onExamStart?.();

  } catch (err) {
    console.error("❌ startHomeworkWriting error:", err);
  }
};
  
    const startExam = async () => {
      console.log("🟢 startExam() called");
  
      try {
        const res = await fetch(
          `${API_BASE}/api/student/start-writing-exam?student_id=${studentId}`,
          { method: "POST" }
        );
  
        const data = await res.json();
        console.log("🟢 start-writing-exam response:", data);
  
      } catch (err) {
        console.error("❌ Failed to start writing exam:", err);
      }
    };
  
    /* -----------------------------------------------------------
       STEP 2 — Load current writing exam session
    ----------------------------------------------------------- */
    const loadExam = async () => {
      console.log("🟡 loadExam() called");
  
      try {
        const res = await fetch(
          `${API_BASE}/api/exams/writing/current?student_id=${studentId}`
        );
  
        console.log("🟡 writing/current status:", res.status);
  
        if (!res.ok) {
          console.error("❌ writing/current not OK");
          throw new Error("Failed to load writing exam");
        }
  
        const data = await res.json();
        console.log("🟡 writing/current response:", data);
        console.log("🟡 typeof completed:", typeof data.completed);
  
        // 🔴 COMPLETED PATH
        if (data.completed === true) {
          console.log("🔴 Exam already completed → loading result");
        
          setCompleted(true);
          await loadResult();
        
          if (typeof onExamFinish === "function") {
            onExamFinish();
          }
        
          return;
        }
  
  
        // 🟢 ACTIVE PATH
        console.log("🟢 Exam is active → rendering exam UI");
  
        setExam(data.exam);
        setTimeLeft(data.remaining_seconds);
  
        if (typeof onExamStart === "function") {
          console.log("🟢 Calling onExamStart()");
          onExamStart();
        } else {
          console.warn("⚠️ onExamStart is NOT a function");
        }
  
      } catch (err) {
        console.error("❌ loadExam error:", err);
      } finally {
        setLoading(false);
      }
    };
    useEffect(() => {
  if (loading || completed || submitting) return;

  // ⏱️ time up always wins
  if (timeLeft <= 0) return;

  // ⏸️ pause timer while confirm modal is open
  if (showConfirmFinish) return;

  const timer = setInterval(() => {
    setTimeLeft(t => Math.max(0, t - 1));
  }, 1000);

  return () => clearInterval(timer);
}, [timeLeft, loading, completed, submitting, showConfirmFinish]);
    
    
    useEffect(() => {
  if (
    examActive &&
    timeLeft === 0 &&
    !completed &&
    !submitting
  ) {
    setShowConfirmFinish(false); // 👈 close modal
    finishExam();
  }
}, [timeLeft, examActive, completed, submitting]);

    
    
    /* -----------------------------------------------------------
       ON MOUNT: Start exam → Load exam
    ----------------------------------------------------------- */
    useEffect(() => {
  console.log("🔵 WritingComponent mounted");

  const init = async () => {
  try {
    // 🔴 HOMEWORK FLOW
    if (parentMode === "homework") {
      await startHomeworkWriting();
      return;
    }

    // --------------------------------------------------
    // STEP 1: Try current exam
    // --------------------------------------------------
    const res = await fetch(
      `${API_BASE}/api/exams/writing/current?student_id=${studentId}`
    );

    if (res.status === 200) {
      const data = await res.json();

      // ✅ CASE A: Completed
      if (data.completed === true) {
        setCompleted(true);
        await loadResult();
        onExamFinish?.();
        return;
      }

      // ✅ CASE B: Active exam
      if (data.exam) {
        setExam(data.exam);
        setTimeLeft(data.remaining_seconds);
        setExamActive(true);
        onExamStart?.();
        return;
      }
    }

    // --------------------------------------------------
    // 🟢 STEP 2: NO ACTIVE EXAM → START NEW EXAM FIRST
    // --------------------------------------------------
    console.log("🟢 No active exam → starting new exam");

    await startExam();

    // --------------------------------------------------
    // STEP 3: Fetch exam AFTER start
    // --------------------------------------------------
    const retryRes = await fetch(
      `${API_BASE}/api/exams/writing/current?student_id=${studentId}`
    );

    if (retryRes.status === 200) {
      const data = await retryRes.json();

      if (data.exam) {
        setExam(data.exam);
        setTimeLeft(data.remaining_seconds);
        setExamActive(true);
        onExamStart?.();
        return;
      }
    }

    // --------------------------------------------------
    // 🔴 STEP 4: FALLBACK → ONLY NOW check result
    // --------------------------------------------------
    console.log("🔴 No exam available → fallback to result");

    const resultRes = await fetch(
      `${API_BASE}/api/exams/writing/result?student_id=${studentId}`
    );

    if (resultRes.status === 200) {
      const data = await resultRes.json();
      setResult(data);
      setCompleted(true);
      onExamFinish?.();
      return;
    }

  } catch (err) {
    console.error("❌ init error:", err);
  } finally {
    setLoading(false);
  }
};
  init();
}, [studentId]);

    
  
    /* -----------------------------------------------------------
       SUBMIT WRITING ANSWER
    ----------------------------------------------------------- */
    const finishExam = async () => {
      if (submitting) return; // safety guard
    
      console.log("🟣 finishExam() called");
      setSubmitting(true); // 🔒 LOCK UI IMMEDIATELY
    
      try {
        const endpoint =
          parentMode === "homework"
            ? "/api/student/submit-homework-writing"
            : "/api/exams/writing/submit";

        const res = await fetch(
          `${API_BASE}${endpoint}?student_id=${studentId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              answer_text: answerText,
              writing_type: exam?.writing_type
            })
          }
        );
    
        console.log("🟣 submit status:", res.status);
    
      } catch (err) {
        console.error("❌ Submission failed:", err);
      } finally {
        setCompleted(true);
        await loadResult();
    
        if (typeof onExamFinish === "function") {
          onExamFinish();
        }
      }
    };

    /* -----------------------------------------------------------
       HELPERS
    ----------------------------------------------------------- */
    const formatTime = (sec) => {
      const m = String(Math.floor(sec / 60)).padStart(2, "0");
      const s = String(sec % 60).padStart(2, "0");
      return `${m}:${s}`;
    };
  
    /* -----------------------------------------------------------
       LOADING STATE
    ----------------------------------------------------------- */
    if (loading) {
      return <div className="loading-screen">Loading writing exam…</div>;
    }
  
    if (!exam && !completed) {
      return <div className="loading-screen">Preparing writing exam…</div>;
    }

  
    /* -----------------------------------------------------------
       COMPLETED VIEW
    ----------------------------------------------------------- */
    if (completed && result) {
  const evalData = result.evaluation;
  const attemptId = result?.attempt_id;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        background: "#f9fafb",
        padding: "32px",
        boxSizing: "border-box",
        zIndex: 1
      }}
    >
      <h1>Writing Report</h1>
      <select
        value={selectedAttempt || ""}
        onChange={(e) => {
          const id = e.target.value;
          setSelectedAttempt(id);

          if (id) {
            loadResultByAttempt(id);
          }
        }}
        style={{
          padding: "8px",
          marginBottom: "16px",
          borderRadius: "6px"
        }}
      >
        {history.map(item => (
          <option key={item.attempt_id} value={item.attempt_id}>
            {item.date} — Score: {item.score}
          </option>
        ))}
      </select>

      <p>
        <strong>Selective Readiness:</strong>{" "}
        <span className="status">
          {result.selective_readiness_band}
        </span>
      </p>
      <div style={{ marginTop: "12px" }}>
        
        <button
          disabled={!attemptId}
          onClick={() => {
            
            console.log("👉 navigating to:", `/writing-review/${attemptId}?mode=${parentMode}`);
            navigate(`/writing-review/${attemptId}?mode=${parentMode}`);
          }}
          style={{
            backgroundColor: "#2E7D32",
            color: "white",
            padding: "10px 14px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          Review Your Writing
        </button>
      </div>
      <p className="scale-note">
        Scoring is based on NSW Selective criteria (25 marks total).
      </p>
      

      <div className="score-bar">
        <span>
          Writing Score: {result.score} / 25
        </span>
      
        <div className="score-progress">
          <div
            className="score-progress-fill"
            style={{ width: `${(result.score / 25) * 100}%` }}
          />
        </div>
      </div>



      <p className="advisory-text">{result.advisory}</p>

      {/* ---------- AI EVALUATION ---------- */}
      {evalData && (
        <div className="ai-report">

          



          <h2>Category Evaluation</h2>

          {evalData?.categories &&
              Object.entries(evalData.categories).map(([key, data]) => (
              <section key={key}>
              <h3>{CATEGORY_LABELS[key]}</h3>

              <p>{data.score} / 5</p>
          
              <p className="section-label">Strengths</p>
              c
          
              <p className="section-label">Improvements Needed</p>


              {data.improvements && data.improvements.length > 0 ? (
                <ul>
                  {data.improvements.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              ) : (
                <p className="na-text">N/A</p>
              )}

            </section>
          ))}


          

          <h2>Teacher Feedback</h2>
          <p>{evalData.teacher_feedback}</p>

        </div>
      )}
    

    </div>
  );
}

  
  
    /* -----------------------------------------------------------
       MAIN RENDER
    ----------------------------------------------------------- */
    console.log("🧠 Rendering ACTIVE writing exam");
  
    return (
      <div
        style={{
          position: "fixed",     // 👈 detach from parent
          inset: 0,              // 👈 full screen
          overflowY: "auto",     // 👈 enable vertical scroll
          background: "#f9fafb",
          padding: "32px",
          boxSizing: "border-box"
        }}
      >
    <div className="writing-header">
      <div className="timer">Time Left: {formatTime(timeLeft)}</div>
    </div>

    <div className="writing-question-box">
  <div
    className="prompt-header"
    onClick={() => setShowPrompt(!showPrompt)}
  >
    <span>Writing Prompt</span>
    <span>{showPrompt ? "▼ Hide" : "▶ Show"}</span>
  </div>

  {showPrompt && (
    <div className="writing-text">

      {parsedPrompt.title && (
        <h2 className="writing-title">
          {parsedPrompt.title}
        </h2>
      )}

      {parsedPrompt.task && (
        <p>
          <strong>Task:</strong> {parsedPrompt.task}
        </p>
      )}

      {parsedPrompt.statement && (
        <blockquote className="writing-statement">
          {parsedPrompt.statement}
        </blockquote>
      )}

      {parsedPrompt.instructions && (
        <p>
          <strong>Instructions:</strong> {parsedPrompt.instructions}
        </p>
      )}

      {parsedPrompt.opening_sentence && (
        <p className="opening-sentence">
          <em>{parsedPrompt.opening_sentence}</em>
        </p>
      )}

      {parsedPrompt.guidelines && (
        <>
          <strong>Guidelines:</strong>
          <ul>
            {parsedPrompt.guidelines
              .split("\n")
              .map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
          </ul>
        </>
      )}

    </div>
  )}
</div>

    <textarea
      className="writing-answer-box"
      spellCheck={false}
      value={answerText}
      disabled={submitting || timeLeft === 0}
      onChange={(e) => setAnswerText(e.target.value)}
    />

    <button
      className="submit-writing-btn"
      onClick={() => setShowConfirmFinish(true)}
      disabled={submitting}
    >
      Submit Writing
    </button>

    {submitting && (
      <div className="processing-overlay">
        <div className="spinner" />
        <p>Evaluating your writing. Please wait…</p>
      </div>
    )}

    {/* ✅ CONFIRM SUBMIT MODAL — HERE */}
    {showConfirmFinish && (
      <div className="confirm-overlay">
        <div className="confirm-modal">
          <h3>Submit Writing?</h3>
          <p>
            Are you sure you want to submit your writing?
            <br />
            You won’t be able to edit it after submission.
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
                finishExam();
              }}
            >
              Yes, Submit Writing
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
