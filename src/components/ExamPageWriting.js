import React, { useState, useEffect } from "react";
import "./ExamPage.css";

export default function ExamPageWriting() {
  const TOTAL_TIME = 40 * 60; // 40 minutes in seconds

  // For now we hardcode 1 writing prompt (backend will replace later)
  const writingQuestion = {
    class: "Selective",
    subject: "Writing",
    topic: "Narrative",
    difficulty: "Medium",
    question_text:
      'The Locked Door\nWrite a narrative beginning with:\n\n“The key to the attic door had been lost for a generation, but today...”',
    instructions: `
Start your story with the sentence above.

In your writing, you may wish to:

• Establish who finds the key (or who discovers the door unlocked)
• Explain why the door matters (family secret, memory, mystery)
• Build a complication or discovery behind the door
• Use sensory descriptions (dust, smell, light, sound, cold doorknob)
• Control pacing with paragraphs and sentence lengths
• End with a meaningful or surprising resolution
`,
  };

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [finished, setFinished] = useState(false);
  const [answer, setAnswer] = useState("");

  /* ------------------------------------------------------
     TIMER LOGIC — Counts down from 40 minutes
  ------------------------------------------------------ */
  useEffect(() => {
    if (finished) return;
    if (timeLeft <= 0) {
      finishExam();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, finished]);

  /* Format mm:ss */
  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  /* ------------------------------------------------------
     Finish Exam
  ------------------------------------------------------ */
  const finishExam = () => {
    console.log("Writing response submitted:", answer);
    setFinished(true);
  };

  if (finished) {
    return (
      <div className="completed-screen">
        <h1>Writing Exam Submitted</h1>
        <p>Your response has been recorded.</p>
      </div>
    );
  }

  return (
    <div className="exam-container">

      {/* HEADER */}
      <div className="exam-header">
        <div>
          Writing Exam – {writingQuestion.topic} ({writingQuestion.difficulty})
        </div>
        <div className="timer">⏳ {formatTime(timeLeft)}</div>
      </div>

      {/* TWO-PANE LAYOUT */}
      <div className="exam-body">

        {/* LEFT: PROMPT + INSTRUCTIONS */}
        <div className="passage-pane">
          <h3 className="passage-title">{writingQuestion.question_text}</h3>

          <div className="extract-block">
            <pre className="passage-text" style={{ whiteSpace: "pre-wrap" }}>
              {writingQuestion.instructions}
            </pre>
          </div>
        </div>

        {/* RIGHT: TEXT INPUT AREA */}
        <div className="question-pane">
          <div className="question-card">
            <h3>Write your response below:</h3>

            <textarea
              className="writing-box"
              placeholder="Begin writing your narrative here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />

            <div className="nav-buttons">
              <button className="nav-btn finish" onClick={finishExam}>
                Submit Writing
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
