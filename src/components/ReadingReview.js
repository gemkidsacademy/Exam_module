import React, { useMemo, useState } from "react";
import "./ExamPage_reading.css";
import "./ReadingReviewIndex.css";

/**
 * ReadingReview
 *
 * Props:
 * - questions: review questions from backend
 * - onExit: callback to leave review
 */
export default function ReadingReview({ questions = [], onExit }) {
  const [index, setIndex] = useState(0);
  const groupedQuestions = useMemo(() => {
    const g = {};

    questions.forEach((q, i) => {
      const key = q.topic || "Other";

      if (!g[key]) {
        g[key] = {
          topic: key,
          indexes: []
        };
      }

      g[key].indexes.push(i);
    });

    return g;
  }, [questions]);


  const currentQuestion = questions[index];
  const [explanations, setExplanations] = useState({});
  const [loadingExplanation, setLoadingExplanation] = useState(null);
  
  const formatExplanation = (text) => {
    if (!text) return "";
  
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong style='display:block; margin-top:10px;'>$1</strong>")
      .replace(/\n\n/g, "<br/><br/>")
      .replace(/\n/g, "<br/>");
  };
  const API_BASE = process.env.REACT_APP_API_URL;

const handleGenerateExplanation = async (question) => {
  const qid = String(question.question_id);

  if (explanations[qid]) return;

  setLoadingExplanation(qid);

  try {
    const res = await fetch(
      `${API_BASE}/api/ai/explain-question-selective-reading`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question_text: question.question_text,
          options: question.answer_options || {},
          correct_answer: question.correct_answer,
          passage:
            question.reading_material ||
            question.section_ref?.reading_material
        })
      }
    );

    if (!res.ok) throw new Error("API failed");

    const data = await res.json();

    setExplanations(prev => ({
      ...prev,
      [qid]: data.explanation || "⚠️ Failed to generate explanation."
    }));

  } catch (err) {
    console.error("Explanation failed", err);

    setExplanations(prev => ({
      ...prev,
      [qid]: "⚠️ Failed to generate explanation."
    }));
  } finally {
    setLoadingExplanation(null);
  }
};
  if (!currentQuestion) {
    return <div>No review data available.</div>;
  }

  /* =============================
     QUESTION TYPE
  ============================= */
  const isGappedText =
    currentQuestion.passage_style === "gapped_text" ||
    currentQuestion.type === "gapped_text";

  /* =============================
     OPTIONS SOURCE (CRITICAL FIX)
  ============================= */
  const options =
    currentQuestion.answer_options &&
    Object.keys(currentQuestion.answer_options).length > 0
      ? currentQuestion.answer_options
      : currentQuestion.reading_material?.options || {};

  let rm =
  currentQuestion.reading_material ||
  currentQuestion.section_ref?.reading_material ||
  {};

// 🔧 normalize string passages
if (typeof rm === "string") {
  rm = {
    content: rm
  };
}

  const passageStyle = currentQuestion.passage_style || "informational";

  /* =============================
     GROUP QUESTIONS BY TOPIC
  ============================= */
  
  /* =============================
     HELPERS
  ============================= */
  const getQuestionStatus = (q) => {
  if (!q.student_answer) return "skipped";
  if (q.is_correct) return "correct";
  return "wrong";
};

  const prettyTopic = (t = "Other") =>
    t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  /* =============================
     UI
  ============================= */
  return (
    <div className="exam-container review-mode">
      {/* =============================
         HEADER
      ============================= */}
      <div className="exam-header">
        <div>Reading Exam Review</div>

        <div className="counter">
          Question {index + 1} / {questions.length}
        </div>

        {onExit && (
          <button className="exit-review-btn" onClick={onExit}>
            Exit Review
          </button>
        )}
      </div>

      {/* =============================
         QUESTION INDEX
      ============================= */}
      <div className="question-index-grouped">
        {Object.entries(groupedQuestions).map(([key, data]) => (
          <div key={key} className="topic-group">
            <div className="topic-title">
              {prettyTopic(data.topic)}
            </div>

            <div className="topic-circles">
              {data.indexes.map((i) => {
                const q = questions[i];

                const cls = [
                  "index-circle",
                  "review",
                  getQuestionStatus(q),
                  i === index ? "active" : ""
                ].join(" ");

                return (
                  <div
                    key={q.question_id}
                    className={cls}
                    onClick={() => setIndex(i)}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* =============================
         BODY
      ============================= */}
      <div className="exam-body">
        {/* =============================
           PASSAGE
        ============================= */}
        <div className={`passage-pane ${passageStyle}`}>
          {/* Literary */}
          {passageStyle === "literary" && rm && typeof rm === "object" && (
            <div className="literary-passage">
              {rm.title && <h3>{rm.title}</h3>}
            
              {rm.instructions && (
                <ul className="instructions">
                  {rm.instructions.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              )}
            
              {rm.paragraphs &&
                Object.entries(rm.paragraphs).map(([num, text]) => (
                  <p key={num} className="reading-paragraph">
                    <strong>{num}.</strong> {text}
                  </p>
                ))}
            </div>
            )}


          {/* Non-literary / Gapped */}
          {passageStyle !== "literary" && (
            <>
              {rm?.title && <h3>{rm.title}</h3>}

              {rm?.extracts &&
                Object.entries(rm.extracts).map(([k, v]) => (
                  <div key={k} className="extract">
                    <strong>{k}.</strong> {v}
                  </div>
                ))}

              {rm?.content && (
                <p className="reading-content">{rm.content}</p>
              )}

              {rm?.paragraphs &&
                Object.entries(rm.paragraphs).map(([k, v]) => (
                  <p key={k} className="reading-paragraph">
                    <strong>{k}.</strong> {v}
                  </p>
                ))}
            </>
          )}
        </div>
        {/* ================= AI EXPLANATION ================= */}
<div style={{ marginTop: "16px" }}>
  
  {!explanations[currentQuestion.question_id] && (
    <button
      className="ai-explain-btn"
      onClick={() => handleGenerateExplanation(currentQuestion)}
      disabled={loadingExplanation === String(currentQuestion.question_id)}
    >
      {loadingExplanation === String(currentQuestion.question_id)
        ? "Generating..."
        : "Generate AI Explanation"}
    </button>
  )}

  {explanations[currentQuestion.question_id] && (
    <div className="ai-explanation-box">
      <h4>Explanation</h4>
      <div
        dangerouslySetInnerHTML={{
          __html: formatExplanation(
            explanations[currentQuestion.question_id]
          )
        }}
      />
    </div>
  )}
</div>
        {/* =============================
           QUESTION + OPTIONS
        ============================= */}
        <div className="question-pane">
          <p className="question-text">
            Q{currentQuestion.question_number}.{" "}
            {currentQuestion.question_text}
          </p>

          {/* =============================
             OPTIONS (FIXED)
          ============================= */}
          <div className="options">
            {Object.keys(options).length === 0 && (
              <div className="no-options-warning">
                ⚠️ No answer options available for this question
              </div>
            )}

            {Object.entries(options).map(([k, v]) => {
              let cls = "option-btn";

              if (k === currentQuestion.correct_answer) {
                cls += " option-correct";
              } else if (k === currentQuestion.student_answer) {
                cls += " option-wrong";
              }

              return (
                <button key={k} disabled className={cls}>
                  <strong>{k}.</strong> {v}
                </button>
              );
            })}
          </div>

          {/* =============================
             NAV
          ============================= */}
          <div className="nav-buttons">
            <button
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
            >
              Previous
            </button>

            <button
              disabled={index === questions.length - 1}
              onClick={() => setIndex(index + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
