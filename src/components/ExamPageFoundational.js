import React, { useState, useEffect, useRef } from "react";
import "./ExamPage.css";

const BACKEND_URL = "https://web-production-481a5.up.railway.app";

export default function ExamPageFoundational({ studentId }) {
  /* -----------------------------------------------------------
     STATE
  ----------------------------------------------------------- */
  const [exam, setExam] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const prevSectionRef = useRef(null);

  /* -----------------------------------------------------------
     LOAD EXAM STATE (AUTHORITATIVE)
  ----------------------------------------------------------- */
  const loadState = async () => {
    const res = await fetch(
      `${BACKEND_URL}/api/exams/foundational/state?student_id=${studentId}`
    );

    if (!res.ok) throw new Error("Failed to load exam state");

    const data = await res.json();

    setExam(data.exam);
    setTimeLeft(data.remaining_seconds);

    if (prevSectionRef.current !== data.current_section_index) {
      setCurrentIndex(0);
      setVisited({});
    }

    setCurrentSectionIndex(data.current_section_index);
    prevSectionRef.current = data.current_section_index;
  };

  /* -----------------------------------------------------------
     INIT EXAM (START OR RESUME)
  ----------------------------------------------------------- */
  useEffect(() => {
    const init = async () => {
      try {
        const stateRes = await fetch(
          `${BACKEND_URL}/api/exams/foundational/state?student_id=${studentId}`
        );

        if (!stateRes.ok) {
          await fetch(
            `${BACKEND_URL}/api/exams/foundational/start?student_id=${studentId}`,
            { method: "POST" }
          );
        }

        await loadState();
      } catch (err) {
        console.error(err);
        alert("Unable to start or load exam.");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) init();
  }, [studentId]);

  /* -----------------------------------------------------------
     TIMER (DISPLAY ONLY)
  ----------------------------------------------------------- */
  useEffect(() => {
    if (loading || completed) return;

    if (timeLeft <= 0) {
      handleNextSection();
      return;
    }

    const t = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);

    return () => clearInterval(t);
  }, [timeLeft, loading, completed]);

  /* -----------------------------------------------------------
     SECTION ADVANCE (BACKEND CONTROLLED)
  ----------------------------------------------------------- */
  const handleNextSection = async () => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/exams/foundational/next-section?student_id=${studentId}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (data.completed) {
        setCompleted(true);
        return;
      }

      await loadState();
    } catch (err) {
      console.error(err);
      alert("Failed to advance section.");
    }
  };

  /* -----------------------------------------------------------
     DERIVED DATA
  ----------------------------------------------------------- */
  if (loading) return <div>Loading exam...</div>;
  if (!exam) return null;

  const section = exam.sections[currentSectionIndex];

  const sectionQuestions = exam.questions.filter(
    (q) => q.section === section.name
  );

  const totalQuestions = sectionQuestions.length;
  const currentQ = sectionQuestions[currentIndex];

  /* -----------------------------------------------------------
     NAVIGATION
  ----------------------------------------------------------- */
  const goToQuestion = (i) => {
    setVisited((v) => ({ ...v, [i]: true }));
    setCurrentIndex(i);
  };

  const nextQuestion = () =>
    currentIndex < totalQuestions - 1 && goToQuestion(currentIndex + 1);

  const prevQuestion = () =>
    currentIndex > 0 && goToQuestion(currentIndex - 1);

  /* -----------------------------------------------------------
     ANSWERS (LOCAL)
  ----------------------------------------------------------- */
  const handleAnswer = (opt) => {
    setAnswers((a) => ({
      ...a,
      [`${section.name}-${currentIndex}`]: opt
    }));
  };

  /* -----------------------------------------------------------
     UI HELPERS
  ----------------------------------------------------------- */
  const getIndexClass = (i) => {
    const key = `${section.name}-${i}`;
    if (answers[key]) return "index-answered";
    if (visited[i]) return "index-visited";
    return "index-not-visited";
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  /* -----------------------------------------------------------
     END SCREEN
  ----------------------------------------------------------- */
  if (completed) {
    return (
      <div className="completed-screen">
        <h1>🎉 Exam Finished</h1>
        <p>You have completed the Foundational Exam.</p>
      </div>
    );
  }

  /* -----------------------------------------------------------
     RENDER
  ----------------------------------------------------------- */
  return (
    <div className="exam-container">
      <div className="exam-header">
        <h2>{section.name}</h2>
        <div className="timer">⏳ {formatTime(timeLeft)}</div>
        <div className="counter">
          Question {currentIndex + 1} / {totalQuestions}
        </div>
      </div>

      <div className="index-row">
        {sectionQuestions.map((_, i) => (
          <div
            key={i}
            className={`index-circle ${getIndexClass(i)}`}
            onClick={() => goToQuestion(i)}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <div className="question-card">
        <p className="question-text">{currentQ.question_text}</p>

        {Object.entries(currentQ.options).map(([key, text]) => (
          <button
            key={key}
            onClick={() => handleAnswer(key)}
            className={`option-btn ${
              answers[`${section.name}-${currentIndex}`] === key
                ? "selected"
                : ""
            }`}
          >
            {key}. {text}
          </button>
        ))}
      </div>

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
          <button onClick={handleNextSection} className="nav-btn finish">
            Finish Section
          </button>
        )}
      </div>
    </div>
  );
}
