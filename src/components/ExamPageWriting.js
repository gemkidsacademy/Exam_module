  import React, { useState, useEffect } from "react";
  import "./ExamPage.css";
  
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
    onExamStart,
    onExamFinish
  }) {
  
    /* -----------------------------------------------------------
       STATE
    ----------------------------------------------------------- */
    const [exam, setExam] = useState(null);
    const [examActive, setExamActive] = useState(false);

    const CATEGORY_LABELS = {
      audience_purpose_form: "Audience, Purpose & Form",
      ideas_content: "Ideas & Content",
      structure_organisation: "Structure & Organisation",
      language_vocabulary: "Language & Vocabulary",
      grammar_spelling_punctuation: "Grammar, Spelling & Punctuation"
    };

    const [timeLeft, setTimeLeft] = useState(0);
    const [answerText, setAnswerText] = useState("");
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showPrompt, setShowPrompt] = useState(true);
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmFinish, setShowConfirmFinish] = useState(false);

    


    
    const parsedPrompt = React.useMemo(() => {
      if (!exam?.question_text) return {};
      return parseWritingPrompt(exam.question_text);
    }, [exam]);

    
    
      
  
    /* -----------------------------------------------------------
       STEP 1 — Start writing exam session
    ----------------------------------------------------------- */
    const loadResult = async () => {
    console.log("🔵 loadResult() called");
  
    try {
      const res = await fetch(
        `${API_BASE}/api/exams/writing/result?student_id=${studentId}`
      );
  
      if (!res.ok) {
        throw new Error("Failed to load writing result");
      }
  
      const data = await res.json();
      console.log("🔵 writing/result response:", data);
  
      setResult(data);
    } catch (err) {
      console.error("❌ loadResult error:", err);
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
      const res = await fetch(
        `${API_BASE}/api/exams/writing/current?student_id=${studentId}`
      );

      // 🔴 No ACTIVE exam → exam is completed → load result
      if (res.status === 404) {
      console.log("🟡 No active exam → checking for result");
    
      const resultRes = await fetch(
        `${API_BASE}/api/exams/writing/result?student_id=${studentId}`
      );
    
      // 🔴 Completed exam exists
      if (resultRes.ok) {
        const data = await resultRes.json();
        setResult(data);
        setCompleted(true);
    
        if (typeof onExamFinish === "function") {
          onExamFinish();
        }
        return;
      }
    
      // 🟢 No exam at all → start fresh
      console.log("🟢 No exam found → starting new writing exam");
      await startExam();
      return init();
    }

      
      if (!res.ok) {
        throw new Error("Failed to load writing exam");
      }


      const data = await res.json();

      // 🔴 COMPLETED
      if (data.completed === true) {
        setCompleted(true);
        await loadResult();

        if (typeof onExamFinish === "function") {
          onExamFinish();
        }
        return;
      }

      // 🟢 ACTIVE EXAM
      if (data.exam) {
        setExam(data.exam);
        setTimeLeft(data.remaining_seconds);
        setExamActive(true);

        if (typeof onExamStart === "function") {
          onExamStart();
        }
        return;
      }

      // 🟡 NO EXAM → start one
      await startExam();
      return init(); // reload after start

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
        const res = await fetch(
          `${API_BASE}/api/exams/writing/submit?student_id=${studentId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answer_text: answerText })
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

  return (
    <div className="completed-screen">
      <h1>Writing Report</h1>

      <p>
        <strong>Selective Readiness:</strong>{" "}
        <span className="status">
          {result.selective_readiness_band}
        </span>
      </p>

      <p className="scale-note">
        Scoring is based on NSW Selective criteria (25 marks total).
      </p>

      <div className="score-bar">
        <span>
          Writing Score: {result.score} / 25
        </span>
        <progress value={result.score} max={25} />
      </div>


      <p className="advisory-text">{result.advisory}</p>

      {/* ---------- AI EVALUATION ---------- */}
      {evalData && (
        <div className="ai-report">

          



          <h2>Category Evaluation</h2>

          {Object.entries(evalData.categories).map(([key, data]) => (
            <section key={key}>
              <h3>{CATEGORY_LABELS[key]}</h3>

              <p>{data.score} / 5</p>
          
              <p className="section-label">Strengths</p>
              <ul>
                {data.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
          
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
  <div className="writing-container">
    <div className="writing-header">
      <div className="timer">Time Left: {formatTime(timeLeft)}</div>
    </div>

    <div className="writing-question-box">
      ...
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
