import React, { useState, useEffect } from "react";
import "./ExamPage.css";

export default function ExamPageThinkingSkills() {
  const studentId = sessionStorage.getItem("student_id");

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [completed, setCompleted] = useState(false);

  /* -----------------------------------------------------------
     STEP 1 — Start or Resume Exam (NO session_id)
  ----------------------------------------------------------- */
  useEffect(() => {
    if (!studentId) {
      console.error("❌ No student_id found");
      return;
    }

    const startOrResumeExam = async () => {
      try {
        const res = await fetch(
          "https://web-production-481a5.up.railway.app/api/student/start-exam",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_id: studentId }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.error("❌ start-exam failed:", data);
          setCompleted(true);
          setLoading(false);
          return;
        }

        if (data.completed) {
          setCompleted(true);
          setLoading(false);
          return;
        }

        setQuestions(data.questions || []);
        setTimeLeft(data.remaining_time);
        setLoading(false);

      } catch (err) {
        console.error("❌ start-exam error:", err);
      }
    };

    startOrResumeExam();
  }, [studentId]);

  /* -----------------------------------------------------------
     TIMER (backend-controlled start, frontend countdown)
  ----------------------------------------------------------- */
  useEffect(() => {
    if (timeLeft === null || completed) return;

    if (timeLeft <= 0) {
      finishExam();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, completed]);

  /* -----------------------------------------------------------
     FINISH EXAM (NO session_id)
  ----------------------------------------------------------- */
  const finishExam = async () => {
    try {
      await fetch(
        "https://web-production-481a5.up.railway.app/api/student/finish-exam",
        { method: "POST" }
      );
    } catch (err) {
      console.error("❌ finish-exam error:", err);
    }

    setCompleted(true);
  };

  /* -----------------------------------------------------------
     ANSWERS
  ----------------------------------------------------------- */
  const handleAnswer = (option) => {
    const qid = questions[currentIndex]?.q_id;
    if (!qid) return;

    setAnswers((prev) => ({
      ...prev,
      [qid]: option,
    }));
  };

  /* -----------------------------------------------------------
     NAVIGATION
  ----------------------------------------------------------- */
  const goToQuestion = (idx) => {
    setVisited((prev) => ({ ...prev, [idx]: true }));
    setCurrentIndex(idx);
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  /* -----------------------------------------------------------
     RENDER
  ----------------------------------------------------------- */
  if (loading) return <p className="loading">Loading exam…</p>;

  if (completed)
    return (
      <div className="completed-screen">
        <h1>🎉 Exam Finished</h1>
        <p>You have already completed this exam.</p>
      </div>
    );

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  return (
    <div className="exam-container">
      <div className="exam-header">
        <div className="timer">⏳ {formatTime(timeLeft)}</div>
        <div className="counter">
          Question {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="question-card">
        <p className="question-text">{currentQ.question}</p>

        {Array.isArray(currentQ.options) &&
          currentQ.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              className={`option-btn ${
                answers[currentQ.q_id] === opt ? "selected" : ""
              }`}
            >
              {opt}
            </button>
          ))}
      </div>

      <div className="nav-buttons">
        <button
          onClick={() => goToQuestion(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          Previous
        </button>

        {currentIndex < questions.length - 1 ? (
          <button onClick={() => goToQuestion(currentIndex + 1)}>
            Next
          </button>
        ) : (
          <button onClick={finishExam}>Finish Exam</button>
        )}
      </div>
    </div>
  );
}
