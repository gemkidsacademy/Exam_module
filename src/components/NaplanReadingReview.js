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
  const isHomeworkMode =
  parentMode === "homework" ||
  parentMode === "report_homework" ||
  parentMode === "review_homework";

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
      const isHomeworkMode =
        parentMode === "homework" ||
        parentMode === "report_homework";

      const reviewUrl = isHomeworkMode
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

      const rawQs =
        data.questions || [];

      const qs = [];

      rawQs.forEach(q => {

        // ----------------------------------------
        // TYPE 8
        // ----------------------------------------

        if (q.question_type === 8) {

          const extractBlock =
            q.exam_bundle?.question_blocks?.find(
              b => b.type === "extract_matching"
            );

          if (!extractBlock) {
            return;
          }

          const sharedReadingBlock = {
            type: "reading",
            extracts: Object.entries(
              extractBlock.extracts || {}
            ).map(([key, value]) => ({
              extract_id: key,
              title: `Extract ${key}`,
              content: value
            }))
          };

          extractBlock.questions.forEach(
            (internalQ, idx) => {

              qs.push({

                ...q,

                question_id:
                  `${q.question_id}_${idx}`,

                question_type: 1,

                exam_bundle: {

                  question_type: 1,

                  question_blocks: [
                    sharedReadingBlock,
                    {
                      type: "text",
                      content:
                        internalQ.question
                    }
                  ],

                  options: {
                    A: "Extract A",
                    B: "Extract B",
                    C: "Extract C",
                    D: "Extract D"
                  },

                  correct_answer:
                    internalQ.correct[0]
                }
              });
            }
          );

          return;
        }

        // ----------------------------------------
        // NORMAL TYPES
        // ----------------------------------------

        qs.push(q);
      });

      const rawAnswers =
        data.student_answers || {};

      const transformedAnswers = {};

      Object.entries(rawAnswers).forEach(([qid, obj]) => {
        const question = qs.find(
          q => String(q.question_id) === String(qid)
        );

        // TYPE 8 grouped answers only
        if (question?.question_type === 8 && Array.isArray(obj.answer)) {
          obj.answer.forEach((internalAnswer, idx) => {
            transformedAnswers[`${qid}_${idx}`] = {
              answer: internalAnswer,
              is_correct: Array.isArray(obj.is_correct)
                ? obj.is_correct[idx]
                : false
            };
          });

          return;
        }

        // NORMAL TYPES
        transformedAnswers[qid] = obj;
      });

      setQuestions(qs);
      setAnswers(transformedAnswers);

      onLoaded?.(
        qs,
        transformedAnswers
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

  if (Array.isArray(val)) {
    return val
      .map(v => String(v).trim().toUpperCase())
      .join(", ");
  }

  return String(val).trim().toUpperCase();
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
            {/* ================= OPTION REVIEW ================= */}

            {/* ================= OPTION REVIEW ================= */}

{/* TEXT OPTIONS */}
{q.exam_bundle?.options && (
  <div className="review-options">
    {Object.entries(q.exam_bundle.options).map(([key, value]) => {
      const normalizedKey = normalize(key);
      const selected = normalize(studentAnswer) === normalizedKey;
      const correct = normalize(correctAnswer) === normalizedKey;

      return (
        <div
          key={key}
          className={`
            review-option
            ${correct ? "correct-option" : ""}
            ${selected && !correct ? "incorrect-option" : ""}
          `}
        >
          <strong>{key}.</strong> {value}
        </div>
      );
    })}
  </div>
)}

{/* IMAGE OPTIONS */}
{q.exam_bundle?.image_options && (
  <div className="review-options image-review-options">
    {Object.entries(q.exam_bundle.image_options).map(([key, value]) => {
      const normalizedKey = normalize(key);
      const selected = normalize(studentAnswer) === normalizedKey;
      const correct = normalize(correctAnswer) === normalizedKey;

      return (
        <div
          key={key}
          className={`
            review-option image-review-option
            ${correct ? "correct-option" : ""}
            ${selected && !correct ? "incorrect-option" : ""}
          `}
        >
          <div className="image-option-label">
            <strong>{key}.</strong>
          </div>

          <img
            src={value}
            alt={`Option ${key}`}
            className="review-option-image"
          />
        </div>
      );
    })}
  </div>
)}

            
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
