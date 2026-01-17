  import React, { useState, useEffect } from "react";
  import "./ExamPage.css";
  
  const BACKEND_URL = "https://web-production-481a5.up.railway.app";
  
  export default function WritingComponent({
    studentId,
    onExamStart,
    onExamFinish
  }) {
  
    /* -----------------------------------------------------------
       STATE
    ----------------------------------------------------------- */
    const [exam, setExam] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [answerText, setAnswerText] = useState("");
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showPrompt, setShowPrompt] = useState(true);
    const [result, setResult] = useState(null);
  
    
  
    /* -----------------------------------------------------------
       STEP 1 — Start writing exam session
    ----------------------------------------------------------- */
    const loadResult = async () => {
    console.log("🔵 loadResult() called");
  
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/exams/writing/result?student_id=${studentId}`
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
          `${BACKEND_URL}/api/student/start-writing-exam?student_id=${studentId}`,
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
          `${BACKEND_URL}/api/exams/writing/current?student_id=${studentId}`
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
  
    /* -----------------------------------------------------------
       ON MOUNT: Start exam → Load exam
    ----------------------------------------------------------- */
    useEffect(() => {
  console.log("🔵 WritingComponent mounted");

  const init = async () => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/exams/writing/current?student_id=${studentId}`
      );

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
       TIMER (DISPLAY ONLY)
    ----------------------------------------------------------- */
    useEffect(() => {
      if (loading || completed) {
        console.log("⏸ Timer paused (loading or completed)");
        return;
      }
  
      if (timeLeft <= 0) {
        console.log("⏰ Time reached zero → auto finish");
        return finishExam();
      }
  
      const timer = setInterval(() => {
        setTimeLeft((t) => Math.max(0, t - 1));
      }, 1000);
  
      return () => clearInterval(timer);
    }, [timeLeft, loading, completed]);
  
    /* -----------------------------------------------------------
       SUBMIT WRITING ANSWER
    ----------------------------------------------------------- */
    const finishExam = async () => {
      console.log("🟣 finishExam() called");
  
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/exams/writing/submit?student_id=${studentId}`,
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
      console.warn("⚠️ No exam data but not completed");
      return null;
    }
  
    /* -----------------------------------------------------------
       COMPLETED VIEW
    ----------------------------------------------------------- */
    if (completed && result) {
    return (
      <div className="completed-screen">
        <h1>Writing</h1>
  
        <p>
          <strong>Status:</strong>{" "}
          <span className="status">{result.status}</span>
        </p>

  
        <div className="score-bar">
          <span>Writing Score: {result.score} / {result.max_score}</span>
          <progress
            value={result.score}
            max={result.max_score}
          />
        </div>
  
        <p className="advisory-text">
          {result.advisory}
        </p>
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
          <div
            className="prompt-header"
            onClick={() => setShowPrompt(!showPrompt)}
          >
            <span>Writing Prompt</span>
            <span>{showPrompt ? "▼ Hide" : "▶ Show"}</span>
          </div>
  
          {showPrompt && <p className="writing-text">{exam.question_text}</p>}
        </div>
  
        <textarea
          className="writing-answer-box"
          placeholder="Start writing your response here..."
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
        />
  
        <button className="submit-writing-btn" onClick={finishExam}>
          Submit Writing
        </button>
      </div>
    );
  }
