import React, { useState, useEffect } from "react";
import "./ExamPage_reading.css";

export default function ReadingComponent({ studentId }) {
  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [readingMaterial, setReadingMaterial] = useState(null);
  const [answerOptions, setAnswerOptions] = useState({});
  const [index, setIndex] = useState(0);

  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [finished, setFinished] = useState(false);

  const [timeLeft, setTimeLeft] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  /* --------------------------------
     HELPERS
  -------------------------------- */
  const normalizeTimestamp = (ts) => {
    if (!ts) return null;
    if (ts.includes("+") || ts.endsWith("Z")) return ts;
    return ts + "Z";
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /* --------------------------------
     LOAD EXAM
  -------------------------------- */
  useEffect(() => {
    if (!studentId) return;

    const loadExam = async () => {
      const res = await fetch(
        `${BACKEND_URL}/api/exams/start-reading?student_id=${studentId}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (data.detail) {
        alert(data.detail);
        setFinished(true);
        return;
      }

      setSessionId(data.session_id);
      setExam(data.exam_json);
      setQuestions(data.exam_json.questions || []);
      setReadingMaterial(data.exam_json.reading_material || null);
      setAnswerOptions(data.exam_json.answer_options || {});

      const durationSeconds = (data.duration_minutes || 40) * 60;
      const start = new Date(normalizeTimestamp(data.start_time)).getTime();
      const now = new Date(normalizeTimestamp(data.server_now)).getTime();

      if (isNaN(start) || isNaN(now)) {
        setTimeLeft(durationSeconds);
      } else {
        setTimeLeft(Math.max(durationSeconds - Math.floor((now - start) / 1000), 0));
      }
    };

    loadExam();
  }, [studentId]);

  /* --------------------------------
     TIMER
  -------------------------------- */
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) return autoSubmit();

    const t = setInterval(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  /* --------------------------------
     SUBMIT
  -------------------------------- */
  const autoSubmit = async () => {
    if (finished) return;

    await fetch(`${BACKEND_URL}/api/exams/submit-reading`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, answers }),
    });

    setFinished(true);
  };

  /* --------------------------------
     INTERACTION
  -------------------------------- */
  const currentQuestion = questions[index];
  if (!exam || !currentQuestion) return <div>Loading Exam…</div>;

  const handleSelect = (choice) => {
    setAnswers((prev) => ({ ...prev, [index]: choice }));
  };

  const goTo = (i) => {
    setVisited((v) => ({ ...v, [i]: true }));
    setIndex(i);
  };

  /* --------------------------------
     FINISHED
  -------------------------------- */
  if (finished) {
    const score = questions.reduce(
      (s, q, i) => s + (answers[i] === q.correct_answer ? 1 : 0),
      0
    );

    return (
      <div className="completed-screen">
        <h1>Quiz Finished</h1>
        <h2>Your Score: {score} / {questions.length}</h2>
      </div>
    );
  }

  /* --------------------------------
     UI
  -------------------------------- */
  return (
    <div className="exam-container">
      <div className="exam-header">
        <div>Reading Comprehension Exam</div>
        <div className="timer-box">Time Left: {formatTime(timeLeft)}</div>
        <div className="counter">
          Question {index + 1} / {questions.length}
        </div>
      </div>

      <div className="exam-body">
        {/* LEFT: READING PASSAGE */}
        <div className="passage-pane">
          <h3>{readingMaterial?.title || "Reading Passage"}</h3>
          <p className="reading-text">
            {readingMaterial?.content}
          </p>
        </div>

        {/* RIGHT: QUESTION + OPTIONS */}
        <div className="question-pane">
          <div className="question-card">
            <p className="question-text">
              Q{currentQuestion.question_number}. {currentQuestion.question_text}
            </p>

            <div className="options">
              {Object.entries(answerOptions).map(([letter, text]) => (
                <button
                  key={letter}
                  className={`option-btn ${
                    answers[index] === letter ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(letter)}
                >
                  <strong>{letter}.</strong> {text}
                </button>
              ))}
            </div>
          </div>

          <div className="nav-buttons">
            <button disabled={index === 0} onClick={() => goTo(index - 1)}>
              Previous
            </button>

            {index < questions.length - 1 ? (
              <button onClick={() => goTo(index + 1)}>Next</button>
            ) : (
              <button onClick={autoSubmit}>Finish</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
