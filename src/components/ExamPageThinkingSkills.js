import React, { useState, useEffect } from "react";
import "./ExamPage.css";

export default function ExamPageThinkingSkills() {
  const studentId = sessionStorage.getItem("student_id");  // e.g., "Gem002"

  const subject = "thinking_skills";
  const difficulty = "advanced";

  const [sessionId, setSessionId] = useState(localStorage.getItem("session_id"));
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [completed, setCompleted] = useState(false);

  /* -------------------------------------------------------------------
     STEP 1 — Start Exam Session (ONLY IF NO session_id EXISTS)
  ------------------------------------------------------------------- */
  useEffect(() => {
  console.log("StudentId (string from login) →", studentId);

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
            student_id: studentId,  // <-- send "Gem002" directly
            subject,
            difficulty
          })
        }
      );

      const data = await res.json();
      console.log("📦 start-exam response:", data);

      if (res.ok) {
        localStorage.setItem("session_id", data.session_id);
        setSessionId(data.session_id);
      } else {
        console.error("❌ Backend reported error:", data);
      }

    } catch (err) {
      console.error("❌ Could not start exam:", err);
    }
  };

  startExam();
}, [sessionId, studentId]);



  /* -------------------------------------------------------------------
     STEP 2 — Load Exam (after session_id is ready)
  ------------------------------------------------------------------- */
  useEffect(() => {
    if (!sessionId) return;

    const loadExam = async () => {
      console.log("📡 Loading exam for session:", sessionId);

      try {
        const res = await fetch(
          `https://web-production-481a5.up.railway.app/api/student/get-exam?session_id=${sessionId}`
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
        console.error("❌ Exam load failure:", err);
      }
    };

    loadExam();
  }, [sessionId]);

  /* -------------------------------------------------------------------
     TIMER HANDLING (Backend is REAL source of truth)
  ------------------------------------------------------------------- */
  useEffect(() => {
    if (timeLeft === null || completed) return;

    if (timeLeft <= 0) {
      console.log("⏰ Time over → finishing exam");
      finishExam();
      return;
    }

    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);

    return () => clearInterval(timer);
  }, [timeLeft, completed]);

  /* -------------------------------------------------------------------
     FINISH EXAM
  ------------------------------------------------------------------- */
  const finishExam = async () => {
    console.log("🏁 Finishing exam...");
    try {
      await fetch("https://web-production-481a5.up.railway.app/api/student/finish-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId })
      });
    } catch (err) {
      console.error("❌ Finish exam error:", err);
    }
    setCompleted(true);
  };

  /* -------------------------------------------------------------------
     QUESTION NAVIGATION
  ------------------------------------------------------------------- */
  const goToQuestion = idx => {
    setVisited(prev => ({ ...prev, [idx]: true }));
    setCurrentIndex(idx);
  };

  const nextQuestion = () =>
    currentIndex < totalQuestions - 1 && goToQuestion(currentIndex + 1);

  const prevQuestion = () =>
    currentIndex > 0 && goToQuestion(currentIndex - 1);

  /* -------------------------------------------------------------------
     ANSWER SELECTION
  ------------------------------------------------------------------- */
  const handleAnswer = option => {
    setAnswers(prev => ({ ...prev, [currentIndex]: option }));
  };

  /* -------------------------------------------------------------------
     COLOR CODING
  ------------------------------------------------------------------- */
  const getIndexClass = i => {
    if (answers[i]) return "index-answered";
    if (visited[i]) return "index-visited";
    return "index-not-visited";
  };

  /* -------------------------------------------------------------------
     TIME FORMATTER
  ------------------------------------------------------------------- */
  const formatTime = seconds => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  /* -------------------------------------------------------------------
     RENDER
  ------------------------------------------------------------------- */

  if (loading) return <p className="loading">Loading exam...</p>;

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

      {/* Question Index */}
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
