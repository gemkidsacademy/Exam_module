import React, { useState, useEffect } from "react";
import "./ExamPage.css";

export default function WritingComponent({ studentId, subject, difficulty }) {
  const [timeLeft, setTimeLeft] = useState(40 * 60); // 40 minutes
  const [completed, setCompleted] = useState(false);

  // 🆕 Collapsible prompt
  const [showPrompt, setShowPrompt] = useState(true);

  // TEMP sample data until backend wiring
  const writingQuestion = {
    topic: "Narrative",
    difficulty: "Medium",
    question_text:
      "The Locked Door\n\nWrite a narrative beginning with:\n“The key to the attic door had been lost for a generation, but today...”"
  };

  /* -----------------------------------------------------------
     TIMER
  ----------------------------------------------------------- */
  useEffect(() => {
    if (completed) return;

    if (timeLeft <= 0) {
      finishExam();
      return;
    }

    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, completed]);

  const finishExam = () => {
    setCompleted(true);
  };

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  /* -----------------------------------------------------------
     END SCREEN
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
        <div className="timer">Time Left: {formatTime(timeLeft)}</div>
      </div>

      {/* COLLAPSIBLE PROMPT */}
      <div className="writing-question-box">

        <div
          className="prompt-header"
          onClick={() => setShowPrompt((p) => !p)}
          style={{
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: "600"
          }}
        >
          <span>Writing Prompt</span>
          <span>{showPrompt ? "▼ Hide" : "▶ Show"}</span>
        </div>

        {showPrompt && (
          <p className="writing-text" style={{ marginTop: "12px" }}>
            {writingQuestion.question_text}
          </p>
        )}

      </div>

      {/* ANSWER TEXTAREA */}
      <textarea
        className="writing-answer-box"
        placeholder="Start writing your response here..."
      ></textarea>

      {/* SUBMIT */}
      <button className="submit-writing-btn" onClick={finishExam}>
        Submit Writing
      </button>

    </div>
  );
}
