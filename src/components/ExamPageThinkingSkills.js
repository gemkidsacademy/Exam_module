import React, { useState, useEffect } from "react";
import "./ExamPage.css";

export default function ExamPageThinkingSkills() {
  const studentId = sessionStorage.getItem("student_id"); // e.g., "Gem002"

  const [sessionId, setSessionId] = useState(localStorage.getItem("session_id"));
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [completed, setCompleted] = useState(false);

  /* -----------------------------------------------------------
     STEP 1 — Start Exam Session if not already started
  ----------------------------------------------------------- */
  useEffect(() => {
    console.log("StudentId (from login) →", studentId);

    const startExam = async () => {
      if (!studentId) {
        console.error("❌ No student_id found in sessionStorage");
        return;
      }

      if (sessionId) {
        console.log("✔ Existing session detected:", sessionId);
        return;
      }

      console.log("📡 Starting new exam session...");

      try {
        const res = await fetch(
          "https://web-production-481a5.up.railway.app/api/student/start-exam",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              student_id: studentId,
            }),
          }
        );

        const data = await res.json();
        console.log("📦 start-exam response:", data);

        if (res.ok) {
          localStorage.setItem("session_id", data.session_id);
          setSessionId(data.session_id);
        } else {
          console.error("❌ Backend error:", data);
        }
      } catch (err) {
        console.error("❌ Could not start exam:", err);
      }
    };

    startExam();
  }, [sessionId, studentId]);

  /* -----------------------------------------------------------
     STEP 2 — Load Exam Details after session_id is known
  ----------------------------------------------------------- */
  useEffect(() => {
    if (!sessionId) return;

    const loadExam = async () => {
      console.log("📡 Loading exam for session:", sessionId);

      try {
        const res = await fetch(
          `https://web-production-481a5.up.railway.app/api/student/get-exam?session_id=${sessionId}`
        );
        const data = await res.json();

        console.log("📦 Raw Exam data:", data);

        if (data.completed) {
          setCompleted(true);
          return;
        }

        // 🔍 LOG EVERY QUESTION
        console.log("🔍 Checking each question structure…");
        data.questions.forEach((q, i) => {
          console.log(
            `Question ${i}:`,
            "q_id=", q.q_id,
            "question=", q.question,
            "options=", q.options,
            "Array?", Array.isArray(q.options)
          );
        });

        setQuestions(data.questions);
        setTotalQuestions(data.total_questions);
        setTimeLeft(data.remaining_time);
        setLoading(false);
      } catch (err) {
        console.error("❌ Exam load failure:", err);
      }
    };

    loadExam();
  }, [sessionId]);

  /* -----------------------------------------------------------
     TIMER HANDLING
  ----------------------------------------------------------- */
  useEffect(() => {
    if (timeLeft === null || completed) return;

    if (timeLeft <= 0) {
      console.log("⏳ Time ended → auto finishing");
      finishExam();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, completed]);

  /* -----------------------------------------------------------
     FINISH EXAM
  ----------------------------------------------------------- */
  const finishExam = async () => {
    console.log("🏁 Finishing exam…");
    try {
      await fetch("https://web-production-481a5.up.railway.app/api/student/finish-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
    } catch (err) {
      console.error("❌ Finish exam error:", err);
    }
    setCompleted(true);
  };

  /* -----------------------------------------------------------
     NAVIGATION
  ----------------------------------------------------------- */
  const goToQuestion = (idx) => {
    setVisited((prev) => ({ ...prev, [idx]: true }));
    setCurrentIndex(idx);
  };

  const nextQuestion = () =>
    currentIndex < totalQuestions - 1 && goToQuestion(currentIndex + 1);

  const prevQuestion = () =>
    currentIndex > 0 && goToQuestion(currentIndex - 1);

  /* -----------------------------------------------------------
     ANSWER SELECTION
  ----------------------------------------------------------- */
  const handleAnswer = (option) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  };

  /* -----------------------------------------------------------
     COLOR CODING FOR INDEX CIRCLES
  ----------------------------------------------------------- */
  const getIndexClass = (i) => {
    if (answers[i]) return "index-answered";
    if (visited[i]) return "index-visited";
    return "index-not-visited";
  };

  /* -----------------------------------------------------------
     HELPER → Format time
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
        <p>Your time is over or you already submitted.</p>
      </div>
    );

  const currentQ = questions[currentIndex];

  return (
    <div className="exam-container">
      {/* Header */}
      <div className="exam-header">
        <div className="timer">⏳ {formatTime(timeLeft)}</div>
        <div className="counter">
          Question {currentIndex + 1} / {totalQuestions}
        </div>
      </div>

      {/* Question Index Buttons */}
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

      {/* Question Card */}
      <div className="question-card">
        <p className="question-text">{currentQ.question}</p>

        {/* SAFE OPTIONS RENDERING */}
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
            ⚠️ Invalid options format for this question. Check backend.
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
