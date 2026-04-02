import React, { useMemo, useState } from "react";
import "./ExamPage_reading.css";
import "./ReadingReviewIndex.css";

/**
 * ReadingReviewOC
 * 
 * Handles OC-specific data variations safely
 */
export default function ReadingReviewOC({
  questions = [],
  attemptDates = [],
  selectedSessionId,
  setSelectedSessionId,
  onSessionChange,
  onExit
}) {
  const [index, setIndex] = useState(0);
  const [explanations, setExplanations] = useState({});
  const [loadingExplanation, setLoadingExplanation] = useState(null);
  console.log("📅 REVIEW attemptDates:", attemptDates);

  const API_BASE = process.env.REACT_APP_API_URL;

  /* =============================
     GROUP QUESTIONS BY TOPIC
  ============================= */
  const groupedQuestions = useMemo(() => {
    const g = {};

    questions.forEach((q, i) => {
      const key = q.topic || q.question_type || "Other";

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

  if (!currentQuestion) {
    return <div>No review data available.</div>;
  }

  const qid = String(currentQuestion.question_id);

  /* =============================
     SAFE OPTIONS (OC FIX)
  ============================= */
  const options =
    currentQuestion.answer_options ||
    currentQuestion.options ||
    currentQuestion.section_ref?.answer_options ||
    {};

  /* =============================
     SAFE PASSAGE (OC FIX)
  ============================= */
  let rm =
    currentQuestion.reading_material ||
    currentQuestion.passage ||
    currentQuestion.stimulus ||
    currentQuestion.section_ref?.reading_material ||
    {};

  if (typeof rm === "string") {
    rm = { content: rm };
  }

  const passageStyle =
    currentQuestion.passage_style ||
    currentQuestion.section_ref?.passage_style ||
    "informational";

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

  const formatExplanation = (text) => {
    if (!text) return "";

    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong style='display:block; margin-top:10px;'>$1</strong>")
      .replace(/\n\n/g, "<br/><br/>")
      .replace(/\n/g, "<br/>");
  };

  /* =============================
     AI EXPLANATION (OC ENDPOINT)
  ============================= */
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
            options:
              question.answer_options ||
              question.options ||
              {},
            correct_answer: question.correct_answer,
            passage:
              question.reading_material ||
              question.passage ||
              question.stimulus
          })
        }
      );

      if (!res.ok) throw new Error("API failed");

      const data = await res.json();

      setExplanations((prev) => ({
        ...prev,
        [qid]: data.explanation || "⚠️ Failed to generate explanation."
      }));
    } catch (err) {
      console.error("Explanation failed", err);

      setExplanations((prev) => ({
        ...prev,
        [qid]: "⚠️ Failed to generate explanation."
      }));
    } finally {
      setLoadingExplanation(null);
    }
  };

  /* =============================
     UI
  ============================= */
  return (
    <div className="exam-container review-mode">
      {/* HEADER */}
      <div className="exam-header">
        <div>OC Reading Review</div>

        <div className="counter">
          Question {index + 1} / {questions.length}
        </div>

        {onExit && (
          <button className="exit-review-btn" onClick={onExit}>
            Exit Review
          </button>
        )}
      </div>
      {/* 🔥 ADD DROPDOWN HERE */}
      <div style={{ padding: "12px 16px" }}>
        <select
          value={selectedSessionId || ""}
          onChange={(e) => {
            const sessionId = e.target.value;
            setSelectedSessionId(sessionId);
      
            // ✅ reload review for selected attempt
            onSessionChange(sessionId);
          }}
          style={{
            padding: "8px",
            marginBottom: "12px",
            display: "block"
          }}
        >
          <option value="">Select attempt date</option>
      
          {attemptDates.map((a) => (
            <option key={a.session_id} value={a.session_id}>
              {new Date(a.created_at).toLocaleString()}
            </option>
          ))}
        </select>
      </div>
      {/* QUESTION INDEX */}
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

      {/* BODY */}
      <div className="exam-body">
        {/* PASSAGE */}
        <div className={`passage-pane ${passageStyle}`}>
          {rm?.title && <h3>{rm.title}</h3>}
        
          {rm?.extracts && Object.keys(rm.extracts).length > 0 && (
            <div className="extracts">
              {Object.entries(rm.extracts).map(([key, text]) => (
                <div key={key} className="extract">
                  <strong>{key}.</strong> {text}
                </div>
              ))}
            </div>
          )}
        
          {rm?.content && (
            <p className="reading-content">{rm.content}</p>
          )}
        
          {rm?.paragraphs &&
            Object.entries(rm.paragraphs).map(([k, v]) => (
              <p key={k} className="reading-paragraph">
                <strong>{k}.</strong> {v}
              </p>
            ))}
        </div>

        {/* QUESTION */}
        <div className="question-pane">
          <div className="question-header-row">
            <p className="question-text">
              Q{currentQuestion.question_number || index + 1}.{" "}
              {currentQuestion.question_text}
            </p>

            {!explanations[qid] && (
              <button
                className="ai-explain-btn-inline"
                onClick={() => handleGenerateExplanation(currentQuestion)}
                disabled={loadingExplanation === qid}
              >
                {loadingExplanation === qid ? "..." : "💡 Explain"}
              </button>
            )}
          </div>

          {/* OPTIONS */}
          <div className="options">
            {Object.keys(options).length === 0 && (
              <div className="no-options-warning">
                ⚠️ No answer options available
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

          {/* EXPLANATION */}
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

          {/* NAV */}
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
