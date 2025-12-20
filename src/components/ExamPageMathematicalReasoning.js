import React, { useEffect, useState } from "react";
import "./ExamPageFoundational.css";

export default function ExamPageMathematicalReasoning({ studentId }) {
  /* ======================================================
     STATE
  ====================================================== */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  /* ======================================================
     START / RESUME EXAM
  ====================================================== */
  useEffect(() => {
    if (!studentId) {
      setError("Student ID missing");
      setLoading(false);
      return;
    }

    const startExam = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${BACKEND_URL}/api/exams/start-mathematical-reasoning`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              student_id: studentId,
              difficulty: "foundational",
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data?.detail || "Failed to start exam");
          return;
        }

        /**
         * Expected backend response (you will implement):
         * {
         *   exam_id: number,
         *   duration_minutes: number,
         *   questions: [
         *     {
         *       q_id: number,
         *       question: string,
         *       options: string[]
         *     }
         *   ]
         * }
         */

        setExam(data);
        setQuestions(data.questions || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load Mathematical Reasoning exam");
      } finally {
        setLoading(false);
      }
    };

    startExam();
  }, [studentId]);

  /* ======================================================
     QUESTION HANDLERS
  ====================================================== */
  const currentQuestion = questions[currentIndex];

  const selectAnswer = (qId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: option,
    }));
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  /* ======================================================
     RENDER STATES
  ====================================================== */
  if (loading) {
    return <div className="exam-loading">Loading Mathematical Reasoning...</div>;
  }

  if (error) {
    return <div className="exam-error">{error}</div>;
  }

  if (!currentQuestion) {
    return <div>No questions available</div>;
  }

  /* ======================================================
     MAIN UI
  ====================================================== */
  return (
    <div className="exam-container">

      {/* HEADER */}
      <div className="exam-header">
        <div className="counter">
          Question {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* QUESTION */}
      <div className="question-card">
        <p className="question-text">
          {currentQuestion.question}
        </p>

        <div className="options">
          {currentQuestion.options.map((opt, i) => (
            <div
              key={i}
              className={`option ${
                answers[currentQuestion.q_id] === opt ? "selected" : ""
              }`}
              onClick={() =>
                selectAnswer(currentQuestion.q_id, opt)
              }
            >
              {opt}
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="exam-footer">
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
        >
          Previous
        </button>

        <button
          onClick={nextQuestion}
          disabled={currentIndex === questions.length - 1}
        >
          Next
        </button>
      </div>

    </div>
  );
}
