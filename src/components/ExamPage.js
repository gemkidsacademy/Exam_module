import React, { useState, useEffect } from "react";
import "./ExamPage.css";

export default function ExamPage() {
  const sessionId = localStorage.getItem("session_id");

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [completed, setCompleted] = useState(false);

  /* -------------------------------------------
     Fetch Exam With Timer + Questions
  -------------------------------------------- */
  useEffect(() => {
    const loadExam = async () => {
      console.log("📡 Loading exam for session:", sessionId);

      try {
        const res = await fetch(
          `https://your-backend.com/api/student/get-exam?session_id=${sessionId}`
        );

        const data = await res.json();
        console.log("📦 Exam data:", data);

        if (data.completed) {
          setCompleted(true);
          return;
        }

        setQuestions(data.questions);
        setTotalQuestions(data.total_questions);
        setTimeLeft(data.remaining_time);
        setLoading(false);

      } catch (err) {
        console.error("❌ Failed loading exam:", err);
      }
    };

    loadExam();
  }, [sessionId]);

  /* -------------------------------------------
     Local Countdown (Backend is source of truth)
  -------------------------------------------- */
  useEffect(() => {
    if (timeLeft === null || completed) return;

    if (timeLeft <= 0) {
      console.log("⏳ Time ended. Auto-finishing exam.");
      finishExam();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, completed]);

  /* -------------------------------------------
     Finish Exam
  -------------------------------------------- */
  const finishExam = async () => {
    console.log("🏁 Finishing exam...");
    await fetch("https://your-backend.com/api/student/finish-exam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });
    setCompleted(true);
  };

  /* -------------------------------------------
     Question Navigation
  -------------------------------------------- */
  const goToQuestion = (index) => {
    setVisited((prev) => ({ ...prev, [index]: true }));
    setCurrentIndex(index);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) goToQuestion(currentIndex + 1);
  };

  const prevQuestion = () => {
    if (currentIndex > 0) goToQuestion(currentIndex - 1);
  };

  /* -------------------------------------------
     Answer Selection
  -------------------------------------------- */
  const handleAnswer = (option) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  };

  /* -------------------------------------------
     Status Color for Question Index
  -------------------------------------------- */
  const getIndexClass = (i) => {
    if (answers[i]) return "index-answered";
    if (visited[i]) return "index-visited";
    return "index-not-visited";
  };

  /* -------------------------------------------
     Format Time
  -------------------------------------------- */
  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  /* -------------------------------------------
     Render
  -------------------------------------------- */

  if (loading) return <p className="loading">Loading exam...</p>;

  if (completed)
    return (
      <div className="completed-screen">
        <h1>⏳ Exam Finished</h1>
        <p>Your time has ended or you already submitted.</p>
      </div>
    );

  const currentQ = questions[currentIndex];

  return (
    <div className="exam-container">

      {/* Timer */}
      <div className="exam-header">
        <div className="timer">Time Left: {formatTime(timeLeft)}</div>
        <div className="counter">
          Question {currentIndex + 1} / {totalQuestions}
        </div>
      </div>

      {/* Question Index Row */}
      <div className="index-row">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`index-circle ${getIndexClass(i)}`}
            onClick={() => goToQuestion(i)}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Question */}
      <div className="question-card">
        <p className="question-text">{currentQ.question}</p>

        {currentQ.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            className={`option-btn ${
              answers[currentIndex] === opt ? "selected" : ""
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="nav-buttons">
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className="nav-btn prev"
        >
          Previous
        </button>

        {currentIndex < totalQuestions - 1 ? (
          <button onClick={nextQuestion} className="nav-btn next">
            Next
          </button>
        ) : (
          <button onClick={finishExam} className="nav-btn finish">
            Finish Exam
          </button>
        )}
      </div>
    </div>
  );
}
