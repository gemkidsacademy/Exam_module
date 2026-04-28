import React, { useEffect, useState } from "react";
import "./NaplanReadingReview.css";

/* ============================================================
   NAPLAN READING REVIEW
============================================================ */
export default function NaplanReadingReview({
  studentId,
  selectedExamId,
  parentMode,
  onLoaded
}) {

  const API_BASE = process.env.REACT_APP_API_URL;
  
  //const API_BASE = "http://127.0.0.1:8000";
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ AI STATE
  const [explanations, setExplanations] = useState({});
  const [loadingExplanation, setLoadingExplanation] = useState(null);

  /* ============================================================
     LOAD REVIEW DATA
  ============================================================ */
  useEffect(() => {
    if (!studentId) {
    setLoading(false);
    return;
  }

  if (selectedExamId == null) {
    setLoading(false);
    console.log(
      "Waiting for selectedExamId..."
    );
    return;
  }
  setLoading(true);
  const loadReview = async () => {
    try {
      const reviewUrl =
        parentMode === "homework"
          ? `${API_BASE}/api/student/exam-review/naplan-reading-homework?student_id=${studentId}&exam_id=${selectedExamId}`
          : `${API_BASE}/api/student/exam-review/naplan-reading?student_id=${studentId}&exam_id=${selectedExamId}`;

      const res = await fetch(
        reviewUrl
      );

      if (!res.ok) {
        throw new Error(
          "Failed to load review"
        );
      }

      const data =
        await res.json();

      const qs =
        data.questions || [];

      const ans =
        data.student_answers || {};

      setQuestions(qs);
      setAnswers(ans);

      onLoaded?.(
        qs,
        ans
      );

    } catch (err) {
      console.error(
        "❌ Failed to load review:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  loadReview();

}, [
  API_BASE,
  studentId, 
  selectedExamId,
  parentMode
]);

  /* ============================================================
     AI EXPLANATION HANDLER
  ============================================================ */
  const handleGenerateExplanation = async (q) => {
    const qid = String(q.question_id);

    if (explanations[qid]) return;

    setLoadingExplanation(qid);

    try {
      const questionText = q.exam_bundle?.question_blocks
        ?.filter(b => b.type !== "reading")
        ?.map(b => b.content || b.text || "")
        ?.join(" ");

      const passageBlock = q.exam_bundle?.question_blocks?.find(
        b => b.type === "reading"
      );

      const res = await fetch(
        `${API_BASE}/api/ai/explain-question-selective-reading`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question_text: questionText,
            options:
              q.exam_bundle?.options ||
              q.exam_bundle?.image_options ||
              {},
            correct_answer: q.exam_bundle?.correct_answer,
            passage: passageBlock || null
          })
        }
      );

      const data = await res.json();

      setExplanations(prev => ({
        ...prev,
        [qid]: data.explanation || "⚠️ Failed to generate explanation."
      }));

    } catch (err) {
      console.error(err);

      setExplanations(prev => ({
        ...prev,
        [qid]: "⚠️ Failed to generate explanation."
      }));
    } finally {
      setLoadingExplanation(null);
    }
  };

  /* ============================================================
     FORMAT EXPLANATION
  ============================================================ */
  const formatExplanation = (text) => {
    if (!text) return "";

    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong style='display:block; margin-top:10px;'>$1</strong>")
      .replace(/\n\n/g, "<br/><br/>")
      .replace(/\n/g, "<br/>");
  };

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
    <div className="reading-review-container">
      <h2>NAPLAN Reading – Review</h2>

      {questions.map((q, idx) => {
        const qid = String(q.question_id);

        const answerObj = answers[qid] || {};
        const studentAnswer = answerObj.answer;
        const isCorrect = answerObj.is_correct ?? false;
        const correctAnswer = q.exam_bundle?.correct_answer;

        return (
          <div
            key={q.question_id}
            className={`review-question-card ${isCorrect ? "correct" : "incorrect"}`}
          >

            {/* ================= HEADER ================= */}
            <div className="review-header">
              <span>Question {idx + 1}</span>
              <span>{isCorrect ? "✔ Correct" : "✖ Incorrect"}</span>
            </div>

            {/* ================= QUESTION ================= */}
            {q.exam_bundle?.question_blocks?.map((block, i) => {

              if (block.type === "reading") {
                return (
                  <div key={i} className="reading-passage">
                    {block.extracts?.map((ex) => (
                      <div key={ex.extract_id} className="extract">
                        <h4>{ex.title}</h4>
                        <pre>{ex.content}</pre>
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

            {/* ================= ANSWERS ================= */}
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

            {/* ================= AI BUTTON ================= */}
            {!explanations[qid] && (
              <button
                className="ai-explain-btn"
                onClick={() => handleGenerateExplanation(q)}
                disabled={loadingExplanation === qid}
              >
                {loadingExplanation === qid
                  ? "Generating..."
                  : "💡 Generate AI Explanation"}
              </button>
            )}

            {/* ================= AI EXPLANATION ================= */}
            {explanations[qid] && (
              <div className="ai-explanation-box">
                <h4>Explanation</h4>
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatExplanation(explanations[qid])
                  }}
                />
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}
