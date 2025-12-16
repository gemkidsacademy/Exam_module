import React, { useState, useEffect } from "react";
import "./ExamPage_reading.css";

export default function ReadingComponent({ studentId }) {
  console.log("💥 USING ReadingComponent");

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";
  const GAPPED_OPTIONS = ["A", "B", "C", "D", "E", "F", "G"];


  // -----------------------------
  // STATE
  // -----------------------------
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [passages, setPassages] = useState({});
  const [answerOptions, setAnswerOptions] = useState({});
  const [index, setIndex] = useState(0);

  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [finished, setFinished] = useState(false);

  const [timeLeft, setTimeLeft] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // -----------------------------
  // TIME HELPERS
  // -----------------------------
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

  // -----------------------------
  // LOAD EXAM
  // -----------------------------
  useEffect(() => {
    const loadExam = async () => {
      if (!studentId) return;

      try {
        const res = await fetch(
          `${BACKEND_URL}/api/exams/start-reading?student_id=${studentId}`,
          { method: "POST" }
        );

        const data = await res.json();
        console.log("🔥 Loaded exam:", data);

        if (data.detail) {
          alert(data.detail);
          setFinished(true);
          return;
        }

        setSessionId(data.session_id);
        setExam(data.exam_json);
        setQuestions(data.exam_json.questions || []);
        setPassages(data.exam_json.reading_material || {});
        setAnswerOptions(data.exam_json.answer_options || {});

        const durationSeconds = (data.duration_minutes || 40) * 60;

        const start = new Date(normalizeTimestamp(data.start_time)).getTime();
        const serverNow = new Date(normalizeTimestamp(data.server_now)).getTime();

        if (isNaN(start) || isNaN(serverNow)) {
          setTimeLeft(durationSeconds);
          return;
        }

        const elapsed = Math.floor((serverNow - start) / 1000);
        setTimeLeft(Math.max(durationSeconds - elapsed, 0));
      } catch (err) {
        console.error("❌ Failed to load exam", err);
      }
    };

    loadExam();
  }, [studentId]);

  // -----------------------------
  // TIMER
  // -----------------------------
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      autoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // -----------------------------
  // SUBMIT
  // -----------------------------
  const autoSubmit = async () => {
    if (finished) return;

    try {
      await fetch(`${BACKEND_URL}/api/exams/submit-reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          answers: answers,
        }),
      });
    } catch (err) {
      console.error("❌ Auto-submit failed", err);
    }

    setFinished(true);
  };

  // -----------------------------
  // INTERACTION
  // -----------------------------
  const currentQuestion = questions[index];

  const handleSelect = (choice) => {
    setAnswers((prev) => ({ ...prev, [index]: choice }));
  };

  const goTo = (i) => {
    setVisited((prev) => ({ ...prev, [i]: true }));
    setIndex(i);
  };

  const score = questions.reduce(
    (sum, q, i) => sum + (answers[i] === q.correct_answer ? 1 : 0),
    0
  );

  // -----------------------------
  // FINISHED SCREEN
  // -----------------------------
  if (finished) {
    return (
      <div className="completed-screen">
        <h1>Quiz Finished</h1>
        <h2>Your Score: {score} / {questions.length}</h2>
        <h3>Time Is Up</h3>
      </div>
    );
  }

  if (!exam || !currentQuestion) {
    return <div>Loading Exam...</div>;
  }

  // -----------------------------
  // PASSAGE LOGIC
  // -----------------------------
  const topicPassageMap = {
    "Comparative analysis": [
      "Extract A",
      "Extract B",
      "Extract C",
      "Extract D",
    ],
    "Main Idea & Summary": [
      "Paragraph 1",
      "Paragraph 2",
      "Paragraph 3",
      "Paragraph 4",
      "Paragraph 5",
      "Paragraph 6",
    ],
  };

  const isGappedText = currentQuestion.topic === "Gapped Text";

  const visiblePassages = isGappedText
    ? []
    : topicPassageMap[currentQuestion.topic] || [];

  // -----------------------------
  // QUESTION INDEX
  // -----------------------------
  const grouped = questions.reduce((acc, q, idx) => {
    if (!acc[q.topic]) acc[q.topic] = [];
    acc[q.topic].push({ idx, number: q.question_number });
    return acc;
  }, {});

  const renderIndex = () => (
    <div className="topic-index-row">
      {Object.entries(grouped).map(([topic, list]) => (
        <div key={topic} className="topic-group-box">
          <div className="topic-title">{topic}</div>
          <div className="topic-question-row">
            {list.map(({ idx, number }) => {
              const cls =
                answers[idx]
                  ? "index-answered"
                  : visited[idx]
                  ? "index-seen"
                  : "";

              return (
                <div
                  key={idx}
                  className={`index-circle ${cls}`}
                  onClick={() => goTo(idx)}
                >
                  {number}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="exam-container">
      <div className="exam-header">
        <div>Reading Comprehension Exam</div>

        <div className="timer-box">
          Time Left: {formatTime(timeLeft)}
        </div>

        <div className="counter">
          Question {index + 1} / {questions.length}
        </div>
      </div>

      {renderIndex()}

      <div className="exam-body">
        {!isGappedText && (
          <div className="passage-pane">
            <h3>Reading Materials</h3>
            {visiblePassages.map((label) => (
              <div key={label} className="passage-block">
                <h4>{label}</h4>
                <p>{passages[label]}</p>
              </div>
            ))}
          </div>
        )}

        <div className="question-pane">
          <div className="question-card">
            <p className="question-text">
              Q{currentQuestion.question_number}.{" "}
              {currentQuestion.question_text}
            </p>

            {/* ANSWER OPTIONS */}
            {isGappedText ? (
              <div className="gapped-options">
                {GAPPED_OPTIONS.map((letter) => (
                  <button
                    key={letter}
                    className={`option-btn ${
                      answers[index] === letter ? "selected" : ""
                    }`}
                    onClick={() => handleSelect(letter)}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            ) : (
              Object.entries(answerOptions).map(([letter, text]) => (
                <button
                  key={letter}
                  className={`option-btn ${
                    answers[index] === letter ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(letter)}
                >
                  {letter}. {text}
                </button>
              ))
            )}

          </div>

          <div className="nav-buttons">
            <button
              className="nav-btn prev"
              disabled={index === 0}
              onClick={() => goTo(index - 1)}
            >
              Previous
            </button>

            {index < questions.length - 1 ? (
              <button
                className="nav-btn next"
                onClick={() => goTo(index + 1)}
              >
                Next
              </button>
            ) : (
              <button
                className="nav-btn finish"
                onClick={autoSubmit}
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
