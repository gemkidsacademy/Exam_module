import React, { useState, useEffect } from "react";
import "./ExamPage.css";

export default function ExamPageFoundational() {
  /* -----------------------------------------------------------
     FRONTEND QUIZ DATA (Replace with your actual foundational questions)
  ----------------------------------------------------------- */
  const examData = {
    duration_seconds: 900, // 15 minutes
    questions: [
      {
        q_id: 1,
        question: "What is the capital of France?",
        options: ["Berlin", "Madrid", "Paris", "Rome"]
      },
      {
        q_id: 2,
        question: "Which number is an even number?",
        options: ["3", "7", "12", "19"]
      },
      {
        q_id: 3,
        question: "Which of the following is a mammal?",
        options: ["Snake", "Eagle", "Dolphin", "Turtle"]
      }
    ]
  };

  /* -----------------------------------------------------------
     STATE
  ----------------------------------------------------------- */
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [completed, setCompleted] = useState(false);

  /* -----------------------------------------------------------
     STEP 1 — Load From Frontend (No Backend)
  ----------------------------------------------------------- */
  useEffect(() => {
    console.log("📦 Loading foundational exam from frontend…");

    setQuestions(examData.questions);
    setTotalQuestions(examData.questions.length);
    setTimeLeft(examData.duration_seconds);

    setLoading(false);
  }, []);

  /* -----------------------------------------------------------
     TIMER
  ----------------------------------------------------------- */
  useEffect(() => {
    if (timeLeft === null || completed) return;

    if (timeLeft <= 0) {
      finishExam();
      return;
    }

    const t = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, completed]);

  /* -----------------------------------------------------------
     FINISH EXAM
  ----------------------------------------------------------- */
  const finishExam = () => {
    console.log("🏁 Foundational exam finished");
    setCompleted(true);
  };

  /* -----------------------------------------------------------
     NAVIGATION
  ----------------------------------------------------------- */
  const goToQuestion = (i) => {
    setVisited((prev) => ({ ...prev, [i]: true }));
    setCurrentIndex(i);
  };

  const nextQuestion = () =>
    currentIndex < totalQuestions - 1 && goToQuestion(currentIndex + 1);

  const prevQuestion = () =>
    currentIndex > 0 && goToQuestion(currentIndex - 1);

  /* -----------------------------------------------------------
     ANSWER SELECTION
  ----------------------------------------------------------- */
  const handleAnswer = (opt) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: opt }));
  };

  /* -----------------------------------------------------------
     COLOR LOGIC FOR CIRCLES
  ----------------------------------------------------------- */
  const getIndexClass = (i) => {
    if (answers[i]) return "index-answered";
    if (visited[i]) return "index-visited";
    return "index-not-visited";
  };

  /* -----------------------------------------------------------
     FORMAT TIME
  ----------------------------------------------------------- */
  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  /* -----------------------------------------------------------
     RENDER LOGIC
  ----------------------------------------------------------- */
  if (loading) return <p className="loading">Loading exam…</p>;

  if (completed)
    return (
      <div className="completed-screen">
        <h1>🎉 Exam Finished</h1>
        <p>You have completed the foundational exam.</p>
      </div>
    );

  const currentQ = questions[currentIndex];

  if (!currentQ)
    return (
      <div className="completed-screen">
        <h1>🎉 Exam Finished</h1>
        <p>You have completed the foundational exam.</p>
      </div>
    );

  return (
    <div className="exam-container">
      {/* Header */}
      <div className="exam-header">
        <div className="timer">⏳ {formatTime(timeLeft)}</div>
        <div className="counter">Question {currentIndex + 1} / {totalQuestions}</div>
      </div>

      {/* Index Circles */}
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

        {Array.isArray(currentQ.options) ? (
          currentQ.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              className={`option-btn ${
                answers[currentIndex] === opt ? "selected" : ""
              }`}
            >
              {opt}
            </button>
          ))
        ) : (
          <p style={{ color: "red", fontWeight: "bold" }}>
            ⚠️ Invalid options format.
          </p>
        )}
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
