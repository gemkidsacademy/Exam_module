import React, { useEffect, useState } from "react";
import "./NaplanReadingReview.css";

/* ============================================================
   NAPLAN READING REVIEW
============================================================ */
export default function NaplanReadingReview({
  studentId,
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
    if (!studentId) return;

    const loadReview = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/student/exam-review/naplan-reading?student_id=${studentId}`
        );

        if (!res.ok) throw new Error("Failed to load review");

        const data = await res.json();
        console.log("========== REVIEW API RESPONSE ==========");
         console.log("Full response:", data);
         console.log("Questions:", data.questions);
         console.log("Student answers:", data.student_answers);

        const qs = data.questions || [];
        const ans = data.student_answers || {};

        setQuestions(qs);
        setAnswers(ans);
        console.log("Answers object keys:", Object.keys(ans));
        console.log("Answers object:", ans);

        onLoaded?.(qs, ans);

      } catch (err) {
        console.error("❌ Failed to load review:", err);
      } finally {
        setLoading(false);
      }
    };

    loadReview();
  }, [API_BASE, studentId, onLoaded]);

  /* ============================================================
     HELPERS
  ============================================================ */
  const normalize = (val) => {
    if (val == null) return "";
    if (Array.isArray(val)) return val.join(", ");
    return String(val);
  };
  const normalizeAnswer = (val) => {
  if (val == null) return [];

  if (Array.isArray(val)) {
    return val.map(v => String(v).trim());
  }

  return [String(val).trim()];
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

        const qid = String(q.question_id);
         
         const answerObj = answers[qid] || {};
         
         const studentAnswer = answerObj.answer;
         const isCorrect = answerObj.is_correct ?? false;
         console.log("------------- REVIEW TRACE -------------");
         console.log("Question index:", idx);
         console.log("Question ID:", qid);
         console.log("Available answer keys:", Object.keys(answers));
         console.log("Answer lookup:", answers[qid]);
         console.log("Answer object:", answerObj);
         console.log("is_correct value:", answerObj.is_correct);
         console.log("Computed isCorrect:", isCorrect);
         
         const correctAnswer = q.exam_bundle?.correct_answer;
        
        return (
          <div
           key={q.question_id}
           className={`review-question-card ${isCorrect ? "correct" : "incorrect"}`}
         >
           <div className="review-header">
             <span>Question {idx + 1}</span>
             <span>{isCorrect ? "✔ Correct" : "✖ Incorrect"}</span>
           </div>
         
           {/* 🔎 DEBUG: show question id */}
           <div style={{ fontSize: "12px", color: "gray" }}>
             qid: {qid}
           </div>

            {/* ============================
                PASSAGE / QUESTION
            ============================ */}
            {q.exam_bundle?.question_blocks?.map((block, i) => {

              if (block.type === "reading") {
                return (
                  <div key={i} className="reading-passage">
                    {block.extracts?.map((ex) => (
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

              if (block.type === "instruction") {
                return (
                  <p key={i} className="question-instruction">
                    {block.text}
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
