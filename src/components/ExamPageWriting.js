import React, { useState, useEffect } from "react";
import "./ExamPage.css";

export default function WritingComponent({ studentId, subject, difficulty }) {
  const [timeLeft, setTimeLeft] = useState(40 * 60); // 40 minutes
  const [completed, setCompleted] = useState(false);

  // 🆕 Collapsible state
  const [showInstructions, setShowInstructions] = useState(false);

  // TEMP sample data until backend wiring
  const writingQuestion = {
    topic: "Narrative",
    difficulty: "Medium",
    question_text:
      "The Locked Door\nWrite a narrative beginning with:\n“​The key to the attic door had been lost for a generation, but today...”",
    question_instructions: `
• Establish who finds the key or why the door matters  
• Build a complication or discovery  
• Use sensory details  
• Control pacing for suspense  
• End with a meaningful resolution  
`
  };

  // TIMER
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

  if (completed) {
    return (
      <div className="completed-screen">
        <h1>Writing Exam Completed</h1>
        <p>⏳ Time ended or submitted.</p>
      </div>
    );
  }

  return (
    <div className="writing-container">
      {/* HEADER */}
      <div className="writing-header">
        <h2>Writing Exam</h2>
        <div className="timer">Time Left: {formatTime(timeLeft)}</div>
      </div>

     
      

      {/* QUESTION TEXT */}
      <div className="writing-question-box">
        <h3>Prompt</h3>
        <p className="writing-text">{writingQuestion.question_text}</p>
      </div>

      {/* COLLAPSIBLE INSTRUCTIONS */}
      <div className="instructions-container">
        
        <button
          className="toggle-btn"
          onClick={() => setShowInstructions((prev) => !prev)}
        >
          {showInstructions ? "Hide Instructions ▲" : "Show Instructions ▼"}
        </button>

        {showInstructions && (
          <div className="instructions-content">
            <pre className="instruction-text">
{writingQuestion.question_instructions}
            </pre>
          </div>
        )}

      </div>

      {/* ANSWER TEXTAREA */}
      <textarea
        className="writing-answer-box"
        placeholder="Start writing your response here..."
      ></textarea>

      <button className="submit-writing-btn" onClick={finishExam}>
        Submit Writing
      </button>
    </div>
  );
}
