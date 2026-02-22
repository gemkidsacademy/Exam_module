import React, { useEffect, useState } from "react";
import "./NaplanReadingReview.css";

/* ============================================================
   NAPLAN READING REVIEW
============================================================ */
export default function NaplanReadingReview({
  studentId,
  examAttemptId,
  onLoaded
}) {
  const API_BASE = process.env.REACT_APP_API_URL;

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  /* ============================================================
     LOAD REVIEW DATA
  ============================================================ */
  useEffect(() => {
    if (!studentId || !examAttemptId) return;

    const loadReview = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/student/review-exam/naplan-reading?student_id=${studentId}&exam_attempt_id=${examAttemptId}`
        );

        if (!res.ok) throw new Error("Failed to load review");

        const data = await res.json();

        setQuestions(data.questions || []);
        setAnswers(data.answers || {});
        onLoaded?.(data.questions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadReview();
  }, [API_BASE, studentId, examAttemptId, onLoaded]);

  /* ============================================================
     HELPERS
  ============================================================ */
  const normalize = (val) => {
    if (val == null) return "";
    if (Array.isArray(val)) return val.join(", ");
    return String(val);
  };

  /* ============================================================
     RENDER
  ============================================================ */
  if (loading) return <p className="loading">Loading review…</p>;
  if (!questions.length) return <p>No questions to review.</p>;

  return (
    <div className="review-container">
      <h2>NAPLAN Reading – Review</h2>

      {questions.map((q, idx) => {
        const studentAnswer = answers[String(q.id)];
        const correctAnswer = q.correct_answer;

        const isCorrect =
          JSON.stringify(studentAnswer) ===
          JSON.stringify(correctAnswer);

        return (
          <div
            key={q.id}
            className={`review-card ${
              isCorrect ? "correct" : "wrong"
            }`}
          >
            <div className="review-header">
              <span>Question {idx + 1}</span>
              <span>
                {isCorrect ? "✔ Correct" : "✖ Incorrect"}
              </span>
            </div>

            {/* ============================
                PASSAGE / QUESTION
            ============================ */}
            {q.exam_bundle?.question_blocks?.map((block, i) => {
              if (block.type === "reading") {
                return (
                  <div key={i} className="reading-passage">
                    {block.extracts.map((ex) => (
                      <div key={ex.extract_id} className="extract">
                        <h4>{ex.title}</h4>
                        <pre>{ex.content}</pre>

                        {ex.images?.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt="Reading visual"
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                );
              }

              if (block.type === "text") {
                return (
                  <p key={i} className="question-text">
                    {block.content}
                  </p>
                );
              }

              return null;
            })}

            {/* ============================
                ANSWERS
            ============================ */}
            <div className="answer-section">
              <div>
                <strong>Your answer:</strong>{" "}
                {normalize(studentAnswer) || "—"}
              </div>

              <div>
                <strong>Correct answer:</strong>{" "}
                {normalize(correctAnswer)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
