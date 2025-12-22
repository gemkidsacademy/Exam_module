import React, { useState, useEffect } from "react";
import "./generateexam_MR.css";

export default function GenerateExam() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [error, setError] = useState("");

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
    const res = await fetch(
      `${BACKEND_URL}/api/quizzes/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          difficulty: "medium", // or selectedDifficulty from UI
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Exam generation failed");

    setGeneratedExam(data);
  } catch (err) {
    console.error(err);
    setError("Failed to generate exam. Check console for details.");
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
                  <strong>Q{q.q_id}.</strong> {q.question}
                  <ul>
                    {Object.entries(q.options).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}.</strong> {value}
                      </li>
                    ))}
                  </ul>
                  <div className="correct-answer">
                    Correct Answer: {q.correct}
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
