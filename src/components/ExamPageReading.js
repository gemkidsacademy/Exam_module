import React, { useState, useEffect } from "react";
import "./ExamPage.css";

export default function ExamPageReading({ initialQuestions = [], initialTime = 1800 }) {
  // initialQuestions = array of { question: "", options: [...] }
  // initialTime = time in seconds (default 30 min)

  const [questions, setQuestions] = useState(initialQuestions);
  const [totalQuestions, setTotalQuestions] = useState(initialQuestions.length);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [completed, setCompleted] = useState(false);

  /* -----------------------------------------------------------
     UPDATE WHEN QUESTIONS CHANGE (e.g. admin selects topic)
  ----------------------------------------------------------- */
  useEffect(() => {
    setQuestions(initialQuestions);
    setTotalQuestions(initialQuestions.length);
    setCurrentIndex(0);
    setAnswers({});
    setVisited({});
    setCompleted(false);
    setTimeLeft(initialTime);
  }, [initialQuestions, initialTime]);

  /* -----------------------------------------------------------
     TIMER HANDLING
  ----------------------------------------------------------- */
  useEffect(() => {
    if (completed) return;

    if (timeLeft <= 0) {
      finishExam();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, completed]);

  const finishExam = () => {
    setCompleted(true);
  };

  /* -----------------------------------------------------------
     NAVIGATION
  ----------------------------------------------------------- */
  const goToQuestion = (i) => {
    setVisited(prev => ({ ...prev, [i]: true }));
    setCurrentIndex(i);
  };

  const nextQuestion = () =>
    currentIndex < totalQuestions - 1 && goToQuestion(currentIndex + 1);

  const prevQuestion = () =>
    currentIndex > 0 && goToQuestion(currentIndex - 1);

  /* -----------------------------------------------------------
     ANSWERS
  ----------------------------------------------------------- */
  const handleAnswer = (opt) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: opt }));
  };

  /* -----------------------------------------------------------
     INDEX CIRCLE COLORS
  ----------------------------------------------------------- */
  const getIndexClass = (i) => {
    if (answers[i]) return "index-answered";
    if (visited[i]) return "index-visited";
    return "index-not-visited";
  };

  /* -----------------------------------------------------------
     TIMER FORMAT
  ----------------------------------------------------------- */
  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  /* -----------------------------------------------------------
     RENDER LOGIC
  ----------------------------------------------------------- */
  if (completed)
    return (
      <div className="completed-screen">
        <h1>Exam Finished</h1>
        <p>You have completed the Reading Exam.</p>
      </div>
    );

  const currentQ = questions[currentIndex];

  if (!currentQ) {
    return <p style={{ textAlign: "center" }}>No questions loaded.</p>;
  }

  return (
    <div className="exam-container">
      
      {/* HEADER */}
      <div className="exam-header">
        <div className="timer">⏳ {formatTime(timeLeft)}</div>
        <div className="counter">
          Question {currentIndex + 1} / {totalQuestions}
        </div>
      </div>

      {/* INDEX CIRCLES */}
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

      {/* QUESTION CARD */}
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

      {/* NAVIGATION */}
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
