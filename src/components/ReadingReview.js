import React, { useMemo, useState } from "react";
import "./ExamPage_reading.css";

/**
 * ReadingReview
 *
 * Props:
 * - questions: review questions from backend
 * - onExit: callback to leave review
 */
export default function ReadingReview({ questions = [], onExit }) {
  const [index, setIndex] = useState(0);

  const currentQuestion = questions[index];

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

  const rm = currentQuestion.reading_material ?? {};
  const passageStyle = currentQuestion.passage_style || "informational";

  /* =============================
     GROUP QUESTIONS BY TOPIC
  ============================= */
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

  /* =============================
     HELPERS
  ============================= */
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
                  i === index ? "active" : "",
                  q.student_answer
                    ? q.is_correct
                      ? "answered-correct"
                      : "answered-wrong"
                    : ""
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
          {passageStyle === "literary" && (
            <pre className="literary-passage">
              {typeof rm === "string" ? rm : ""}
            </pre>
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
