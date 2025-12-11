import React, { useState, useEffect } from "react";
import "./ExamPage_reading.css";

export default function ReadingExam() {
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [passages, setPassages] = useState({});
  const [index, setIndex] = useState(0);

  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});

  const [finished, setFinished] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(null);
  const [duration, setDuration] = useState(null);

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  /* -------------------------------------------------------
     LOAD THE LATEST EXAM FROM BACKEND
  ---------------------------------------------------------*/
  useEffect(() => {
    const loadExam = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/exams/latest-reading`);
        const data = await res.json();

        console.log("🔥 Loaded exam:", data);

        setExam(data.exam_json);
        setQuestions(data.exam_json.questions);
        setPassages(data.exam_json.reading_material);

        const seconds = data.duration_minutes * 60;
        setDuration(seconds);
        setTimeLeft(seconds);

      } catch (err) {
        console.error("❌ Failed to load exam", err);
      }
    };

    loadExam();
  }, []);

  /* -------------------------------------------------------
     TIMER COUNTDOWN (Backend-Controlled Duration)
  ---------------------------------------------------------*/
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      setFinished(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /* -------------------------------------------------------
     HANDLERS
  ---------------------------------------------------------*/
  const currentQuestion = questions[index];

  const handleSelect = (choice) => {
    setAnswers((prev) => ({ ...prev, [index]: choice }));
  };

  const goTo = (i) => {
    setVisited((prev) => ({ ...prev, [i]: true }));
    setIndex(i);
  };

  const score = questions.reduce(
    (total, q, i) => total + (answers[i] === q.correct_answer ? 1 : 0),
    0
  );

  /* -------------------------------------------------------
     FINISHED SCREEN
  ---------------------------------------------------------*/
  if (finished) {
    return (
      <div className="completed-screen">
        <h1>Quiz Finished</h1>
        <h2>Your Score: {score} / {questions.length}</h2>
        <h3>Time Ended</h3>
      </div>
    );
  }

  if (!exam) {
    return <div>Loading Exam...</div>;
  }

  /* -------------------------------------------------------
     RENDER QUESTION INDEX
  ---------------------------------------------------------*/
  const renderIndex = () => (
    <div className="index-wrapper">
      {questions.map((q, i) => {
        const cls =
          answers[i] ? "index-answered"
          : visited[i] ? "index-seen"
          : "";

        return (
          <div
            key={i}
            className={`index-circle ${cls}`}
            onClick={() => goTo(i)}
          >
            {i + 1}
          </div>
        );
      })}
    </div>
  );

  /* -------------------------------------------------------
     MAIN RENDER
  ---------------------------------------------------------*/
  return (
    <div className="exam-container">

      {/* HEADER */}
      <div className="exam-header">
        <div>Reading Comprehension Exam</div>

        <div className="timer-box">
          Time Left: {formatTime(timeLeft)}
        </div>

        <div className="counter">
          Question {index + 1} / {questions.length}
        </div>
      </div>

      {/* INDEX */}
      {renderIndex()}

      <div className="exam-body">

        {/* LEFT: PASSAGE MATERIAL */}
        <div className="passage-pane">
          <h3>Reading Materials</h3>

          {Object.entries(passages).map(([label, text]) => (
            <div key={label} className="passage-block">
              <h4>{label}</h4>
              <p>{text}</p>
            </div>
          ))}
        </div>

        {/* RIGHT: CURRENT QUESTION */}
        <div className="question-pane">
          <div className="question-card">
            <p className="question-text">
              Q{currentQuestion.question_number}. {currentQuestion.question_text}
            </p>

            {["A", "B", "C", "D", "E", "F", "G"].map((opt) => (
              <button
                key={opt}
                className={`option-btn ${
                  answers[index] === opt ? "selected" : ""
                }`}
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* NAVIGATION */}
          <div className="nav-buttons">
            <button
              className="nav-btn prev"
              disabled={index === 0}
              onClick={() => goTo(index - 1)}
            >
              Previous
            </button>

            {index < questions.length - 1 ? (
              <button className="nav-btn next" onClick={() => goTo(index + 1)}>
                Next
              </button>
            ) : (
              <button className="nav-btn finish" onClick={() => setFinished(true)}>
                Finish
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
