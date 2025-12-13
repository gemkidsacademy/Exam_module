import React, { useState, useEffect } from "react";
import "./ExamPage.css";

const BACKEND_URL = "https://web-production-481a5.up.railway.app";

export default function WritingComponent({ studentId }) {
  /* -----------------------------------------------------------
     STATE
  ----------------------------------------------------------- */
  const [exam, setExam] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Collapsible prompt
  const [showPrompt, setShowPrompt] = useState(true);

  /* -----------------------------------------------------------
     LOAD WRITING EXAM FROM BACKEND
  ----------------------------------------------------------- */
  useEffect(() => {
    const loadExam = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/exams/writing/current?student_id=${studentId}`
        );

        if (!res.ok) {
          throw new Error("Failed to load writing exam");
        }

        const data = await res.json();

        setExam(data.exam);
        setTimeLeft(data.remaining_seconds); // backend-authoritative
      } catch (err) {
        console.error(err);
        alert("Unable to load writing exam.");
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [studentId]);

  /* -----------------------------------------------------------
     TIMER (DISPLAY ONLY)
  ----------------------------------------------------------- */
  useEffect(() => {
    if (loading || completed) return;

    if (timeLeft <= 0) {
      finishExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, completed, loading]);

  /* -----------------------------------------------------------
     SUBMIT
  ----------------------------------------------------------- */
  const finishExam = async () => {
    try {
      await fetch(
        `${BACKEND_URL}/api/exams/writing/submit?student_id=${studentId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answer_text: answerText
          })
        }
      );
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setCompleted(true);
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
     LOADING
  ----------------------------------------------------------- */
  if (loading) {
    return <div className="loading-screen">Loading writing exam…</div>;
  }

  if (!exam) return null;

  /* -----------------------------------------------------------
     COMPLETED
  ----------------------------------------------------------- */
  if (completed) {
    return (
      <div className="completed-screen">
        <h1>Writing Exam Completed</h1>
        <p>⏳ Time ended or submission received.</p>
      </div>
    );
  }

  /* -----------------------------------------------------------
     RENDER
  ----------------------------------------------------------- */
  return (
    <div className="writing-container">

      {/* HEADER */}
      <div className="writing-header">
        <div className="timer">
          Time Left: {formatTime(timeLeft)}
        </div>
      </div>

      {/* COLLAPSIBLE PROMPT */}
      <div className="writing-question-box">

        <div
          className="prompt-header"
          onClick={() => setShowPrompt((p) => !p)}
        >
          <span>Writing Prompt</span>
          <span>{showPrompt ? "▼ Hide" : "▶ Show"}</span>
        </div>

        {showPrompt && (
          <p className="writing-text">
            {exam.question_text}
          </p>
        )}

      </div>

      {/* ANSWER */}
      <textarea
        className="writing-answer-box"
        placeholder="Start writing your response here..."
        value={answerText}
        onChange={(e) => setAnswerText(e.target.value)}
      />

      {/* SUBMIT */}
      <button
        className="submit-writing-btn"
        onClick={finishExam}
      >
        Submit Writing
      </button>

    </div>
  );
}
