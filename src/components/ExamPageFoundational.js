import React, { useState, useEffect } from "react";
import "./ExamPage.css";

export default function ExamPageFoundational() {
  /* -----------------------------------------------------------
     FRONTEND EXAM DATA: 3 SECTIONS WITH CUSTOM TIMERS
  ----------------------------------------------------------- */
  const examSections = [
    {
      name: "Section A",
      duration_seconds: 900, // 15 min
      questions: Array.from({ length: 25 }).map((_, i) => ({
        q_id: i + 1,
        question: `Section A: Question ${i + 1}?`,
        options: ["Option 1", "Option 2", "Option 3", "Option 4"]
      }))
    },
    {
      name: "Section B",
      duration_seconds: 600, // 10 min
      questions: Array.from({ length: 15 }).map((_, i) => ({
        q_id: i + 1,
        question: `Section B: Question ${i + 1}?`,
        options: ["Option 1", "Option 2", "Option 3", "Option 4"]
      }))
    },
    {
      name: "Section C",
      duration_seconds: 600, // 10 min
      questions: Array.from({ length: 10 }).map((_, i) => ({
        q_id: i + 1,
        question: `Section C: Question ${i + 1}?`,
        options: ["Option 1", "Option 2", "Option 3", "Option 4"]
      }))
    }
  ];

  /* -----------------------------------------------------------
     STATE
  ----------------------------------------------------------- */
  const [currentSection, setCurrentSection] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(
    examSections[0].duration_seconds
  );
  const [completed, setCompleted] = useState(false);

  const section = examSections[currentSection];
  const questions = section.questions;
  const totalQuestions = questions.length;

  /* -----------------------------------------------------------
     TIMER PER SECTION
  ----------------------------------------------------------- */
  useEffect(() => {
    if (completed) return;

    if (timeLeft <= 0) {
      goToNextSection();
      return;
    }

    const t = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, completed]);

  /* -----------------------------------------------------------
     MOVE TO NEXT SECTION
  ----------------------------------------------------------- */
  const goToNextSection = () => {
    if (currentSection < examSections.length - 1) {
      setCurrentSection((s) => s + 1);
      setCurrentIndex(0);
      setVisited({});
      setAnswers({});
      setTimeLeft(examSections[currentSection + 1].duration_seconds);
    } else {
      finishExam();
    }
  };

  /* -----------------------------------------------------------
     FINISH EXAM
  ----------------------------------------------------------- */
  const finishExam = () => {
    console.log("Exam completed");
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
     ANSWER
  ----------------------------------------------------------- */
  const handleAnswer = (opt) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: opt }));
  };

  /* -----------------------------------------------------------
     COLOR LOGIC
  ----------------------------------------------------------- */
  const getIndexClass = (i) => {
    if (answers[i]) return "index-answered";
    if (visited[i]) return "index-visited";
    return "index-not-visited";
  };

  /* -----------------------------------------------------------
     TIME FORMAT
  ----------------------------------------------------------- */
  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  /* -----------------------------------------------------------
     END SCREEN
  ----------------------------------------------------------- */
  if (completed)
    return (
      <div className="completed-screen">
        <h1>🎉 Exam Finished</h1>
        <p>All three sections are completed.</p>
      </div>
    );

  /* -----------------------------------------------------------
     CURRENT QUESTION
  ----------------------------------------------------------- */
  const currentQ = questions[currentIndex];

  return (
    <div className="exam-container">

      {/* HEADER */}
      <div className="exam-header">
        <h2>{section.name}</h2>
        <div className="timer">⏳ {formatTime(timeLeft)}</div>
        <div className="counter">
          Question {currentIndex + 1} / {totalQuestions}
        </div>
      </div>

      {/* INDEX ROW */}
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
          <button onClick={goToNextSection} className="nav-btn finish">
            {currentSection < 2 ? "Finish Section" : "Finish Exam"}
          </button>
        )}
      </div>
    </div>
  );
}
