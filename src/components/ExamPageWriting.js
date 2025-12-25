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

  /* -----------------------------------------------------------
     STEP 1 — Start writing exam session
  ----------------------------------------------------------- */
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
        console.log("🔴 Exam marked completed → redirecting");

        setCompleted(true);

        if (typeof onExamFinish === "function") {
          console.log("🔴 Calling onExamFinish()");
          onExamFinish();
        } else {
          console.warn("⚠️ onExamFinish is NOT a function");
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
      await startExam();
      await loadExam();
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
      console.log("🟣 Marking completed + calling onExamFinish");

      setCompleted(true);

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
  if (completed) {
    console.log("✅ Rendering COMPLETED screen");

    return (
      <div className="completed-screen">
        <h1>Writing Exam Completed</h1>
        <p>⏳ Time ended or submission received.</p>
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
