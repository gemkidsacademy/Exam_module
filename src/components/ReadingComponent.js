import React, { useState, useEffect } from "react";
import "./ExamPage_reading.css";

// Accept studentId as a prop
export default function ReadingComponent({ studentId }) {
  console.log("💥 USING NEW ReadingComponent");

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

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  /* -------------------------------------------------------
     LOAD EXAM (Backend-controlled timer)
  ---------------------------------------------------------*/
  useEffect(() => {
    const loadExam = async () => {
      if (!studentId) {
        console.error("❌ No studentId provided to ReadingComponent");
        return;
      }

      try {
        const res = await fetch(
          `${BACKEND_URL}/api/exams/start-reading?student_id=${studentId}`,
          { method: "POST" }
        );

        const data = await res.json();
        console.log("🔥 Loaded reading exam:", data);

        // Handle second-attempt restriction
        if (data.detail) {
          alert(data.detail);
          setFinished(true);
          return;
        }

        // Set exam data
        setSessionId(data.session_id);
        setExam(data.exam_json);
        setQuestions(data.exam_json.questions);
        setPassages(data.exam_json.reading_material);
        setAnswerOptions(data.exam_json.answer_options || {});

        /* -------------------------------
           FIXED TIMESTAMP PARSING
        -------------------------------*/
        const duration = (data.duration_minutes || 40) * 60;

        console.log("⏳ RAW start_time:", data.start_time);
        console.log("⏳ RAW server_now:", data.server_now);

        const start = new Date(data.start_time).getTime();
        const serverNow = new Date(data.server_now).getTime();

        console.log("⏳ Parsed start(ms):", start);
        console.log("⏳ Parsed serverNow(ms):", serverNow);

        if (isNaN(start) || isNaN(serverNow)) {
          console.error("⛔ Timestamp parsing failed.");
          setTimeLeft(duration); // fail-safe fallback
          return;
        }

        const elapsed = Math.floor((serverNow - start) / 1000);
        const remaining = duration - elapsed;

        console.log("⏳ elapsed seconds:", elapsed);
        console.log("⏳ remaining seconds:", remaining);

        setTimeLeft(remaining > 0 ? remaining : 0);

      } catch (err) {
        console.error("❌ Failed to load exam", err);
      }
    };

    loadExam();
  }, [studentId]);

  /* -------------------------------------------------------
     AUTO-SUBMIT WHEN TIME ENDS
  ---------------------------------------------------------*/
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

      console.log("🔔 Auto-submitted exam to backend");
    } catch (err) {
      console.error("❌ Auto-submit failed", err);
    }

    setFinished(true);
  };

  /* -------------------------------------------------------
     TIMER
  ---------------------------------------------------------*/
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      autoSubmit();
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
     QUESTION INTERACTION
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
        <h3>Time Is Up!</h3>
      </div>
    );
  }

  if (!exam) return <div>Loading Exam...</div>;

  /* -------------------------------------------------------
     PASSAGE FILTERING
  ---------------------------------------------------------*/
  const topicPassageMap = {
    "Comparative analysis": ["Extract A", "Extract B", "Extract C", "Extract D"],
    "Main Idea and Summary": [
      "Paragraph 1",
      "Paragraph 2",
      "Paragraph 3",
      "Paragraph 4",
      "Paragraph 5",
      "Paragraph 6",
    ],
  };

  const currentTopic = currentQuestion.topic;
  const visiblePassages = topicPassageMap[currentTopic] || [];

  /* -------------------------------------------------------
     QUESTION INDEX PANEL
  ---------------------------------------------------------*/
  const grouped = questions.reduce((acc, q, idx) => {
    if (!acc[q.topic]) acc[q.topic] = [];
    acc[q.topic].push({ idx, number: q.question_number });
    return acc;
  }, {});

  const renderIndex = () => (
    <div className="topic-index-row">
      {Object.entries(grouped).map(([topic, qList]) => (
        <div key={topic} className="topic-group-box">
          <div className="topic-title">{topic}</div>

          <div className="topic-question-row">
            {qList.map(({ idx, number }) => {
              const cls =
                answers[idx] ? "index-answered" :
                visited[idx] ? "index-seen" : "";

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

  /* -------------------------------------------------------
     MAIN UI
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

      {renderIndex()}

      <div className="exam-body">

        {/* LEFT: PASSAGES */}
        <div className="passage-pane">
          <h3>Reading Materials</h3>

          {visiblePassages.map((label) => (
            <div key={label} className="passage-block">
              <h4>{label}</h4>
              <p>{passages[label]}</p>
            </div>
          ))}
        </div>

        {/* RIGHT: QUESTION */}
        <div className="question-pane">
          <div className="question-card">
            <p className="question-text">
              Q{currentQuestion.question_number}. {currentQuestion.question_text}
            </p>

            {Object.entries(answerOptions).map(([letter, text]) => (
              <button
                key={letter}
                className={`option-btn ${
                  answers[index] === letter ? "selected" : ""
                }`}
                onClick={() => handleSelect(letter)}
              >
                {letter}. {text}
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
              <button className="nav-btn finish" onClick={autoSubmit}>
                Finish
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
