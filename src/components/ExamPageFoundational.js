import React, { useState, useEffect } from "react";
import "./ExamPage.css";

const BACKEND_URL = "https://web-production-481a5.up.railway.app";

export default function ExamPageFoundational() {
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

  /* -----------------------------------------------------------
     LOAD EXAM FROM BACKEND
  ----------------------------------------------------------- */
  useEffect(() => {
    const loadExam = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/exams/foundational/current`
        );

        if (!res.ok) throw new Error("Failed to load exam");

        const data = await res.json();

        // If backend wraps response
        const examData = data.exam || data;

        setExam(examData);
        setCurrentSectionIndex(data.current_section_index || 0);
        setTimeLeft(data.remaining_seconds || examData.sections[0].time * 60);
      } catch (err) {
        console.error(err);
        alert("Unable to load exam.");
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, []);

  /* -----------------------------------------------------------
     TIMER (BACKEND-SYNCED)
  ----------------------------------------------------------- */
  useEffect(() => {
    if (loading || completed) return;

    if (timeLeft <= 0) {
      goToNextSection();
      return;
    }

    const t = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, completed, loading]);

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
     SECTION TRANSITION
  ----------------------------------------------------------- */
  const goToNextSection = () => {
    if (currentSectionIndex < exam.sections.length - 1) {
      const nextSection = currentSectionIndex + 1;

      setCurrentSectionIndex(nextSection);
      setCurrentIndex(0);
      setVisited({});
      setTimeLeft(exam.sections[nextSection].time * 60);
    } else {
      setCompleted(true);
    }
  };

  /* -----------------------------------------------------------
     ANSWER HANDLING
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

      {/* QUESTION CARD */}
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
            {currentSectionIndex < exam.sections.length - 1
              ? "Finish Section"
              : "Finish Exam"}
          </button>
        )}
      </div>
    </div>
  );
}
