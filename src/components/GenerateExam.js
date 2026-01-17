import React, { useState } from "react";
import "./generateexam_MR.css";

const BACKEND_URL = "https://web-production-481a5.up.railway.app";

export default function GenerateExam() {
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [error, setError] = useState("");

  const renderText = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") return value.content ?? "";
    return String(value);
  };

  const handleGenerateExam = async () => {
    setLoading(true);
    setError("");
    setGeneratedExam(null);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/quizzes/generate-new`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ difficulty: "medium" })
        }
      );

      const data = await response.json();
      console.log("Diagnostic response:", data);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to generate exam");
      }

      setGeneratedExam(data);
    } catch (err) {
      console.error("Exam generation failed:", err);
      setError(err.message || "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generate-exam-container">
      <h2>Generate Mathematical Reasoning Exam</h2>

      {error && <div className="error-text">{error}</div>}

      <button
        className="primary-btn"
        onClick={handleGenerateExam}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>

      {generatedExam && (
        <div className="generated-output">
          <h3>Generated Exam Preview</h3>

          <p>
            <strong>Exam ID:</strong> {generatedExam.exam_id}
          </p>
          <p>
            <strong>Quiz ID:</strong> {generatedExam.quiz_id}
          </p>

          {generatedExam.questions?.length > 0 ? (
            <div className="questions-preview">
              {generatedExam.questions.map((question) => (
                <div
                  key={question.q_id}
                  className="question-card"
                >
                  <strong>Q{question.q_id}.</strong>{" "}
                  {renderText(question.question)}

                  <ul>
                    {Array.isArray(question.options)
                      ? question.options.map((option, index) => (
                          <li key={index}>
                            {renderText(option)}
                          </li>
                        ))
                      : Object.entries(question.options || {}).map(
                          ([key, value]) => (
                            <li key={key}>
                              <strong>{key}.</strong>{" "}
                              {renderText(value)}
                            </li>
                          )
                        )}
                  </ul>

                  <div className="correct-answer">
                    Correct Answer:{" "}
                    {renderText(question.correct)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No questions found.</p>
          )}
        </div>
      )}
    </div>
  );
}
