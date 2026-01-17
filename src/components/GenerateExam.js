import React, { useState, useEffect } from "react";
import "./generateexam_MR.css";

export default function GenerateExam() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [error, setError] = useState("");
  const renderText = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return val.content ?? "";
  return String(val);
};


  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  const formatClassName = (cls) => {
    switch (cls) {
      case "year1": return "Year 1";
      case "year2": return "Year 2";
      case "year3": return "Year 3";
      case "year4": return "Year 4";
      case "year5": return "Year 5";
      case "year6": return "Year 6";
      case "selective": return "Selective";
      case "kindergarten": return "Kindergarten";
      default: return cls;
    }
  };

  const formatSubject = (subj) => {
    switch (subj) {
      case "thinking_skills": return "Thinking Skills";
      case "mathematical_reasoning": return "Math Reasoning";
      case "reading": return "Reading";
      case "writing": return "Writing";
      default: return subj;
    }
  };

  const formatDifficulty = (lvl) => {
    switch (lvl) {
      case "easy": return "Easy";
      case "medium": return "Medium";
      case "hard": return "Hard";
      default: return lvl;
    }
  };

  /* ---------------- FETCH QUIZZES ---------------- */
  
  /* ---------------- GENERATE EXAM ---------------- */
  const handleGenerateExam = async () => {
  setLoading(true);
  setError("");
  setGeneratedExam(null);

  try {
    // 1️⃣ Diagnostic ping
    const diagRes = await fetch(`${BACKEND_URL}/__diagnostic_ping`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!diagRes.ok) {
      throw new Error("Diagnostic ping failed");
    }

    const diagData = await diagRes.json();
    console.log("Diagnostic OK:", diagData);

    // 2️⃣ Generate exam
    const res = await fetch(
      `${BACKEND_URL}/api/quizzes/generate-new`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty: "medium"
        })
      }
    );

    const data = await res.json();
    console.log("Generate response:", data);

    if (!res.ok) {
      throw new Error(data.detail || "Failed to generate exam");
    }

    // ✅ success
    setGeneratedExam(data);

  } catch (err) {
    console.error("❌ Generate exam failed:", err);
    setError(err.message || "Failed to generate exam");
  } finally {
    setLoading(false);
  }
};



  /* ---------------- UI ---------------- */
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

          <p><strong>Exam ID:</strong> {generatedExam.exam_id}</p>
          <p><strong>Quiz ID:</strong> {generatedExam.quiz_id}</p>

          {generatedExam.questions?.length > 0 ? (
            <div className="questions-preview">
              {generatedExam.questions.map((q) => (
                <div key={q.q_id} className="question-card">
                  <strong>Q{q.q_id}.</strong> {renderText(q.question)}
              
                  <ul>
                    {Array.isArray(q.options)
                      ? q.options.map((opt, idx) => (
                          <li key={idx}>{renderText(opt)}</li>
                        ))
                      : Object.entries(q.options).map(([key, value]) => (
                          <li key={key}>
                            <strong>{key}.</strong> {renderText(value)}
                          </li>
                        ))
                    }
                  </ul>
              
                  <div className="correct-answer">
                    Correct Answer: {renderText(q.correct)}
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
