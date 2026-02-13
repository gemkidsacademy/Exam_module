import React, { useState } from "react";
import "./generate_exam.css";

export default function GenerateExam_thinking_skills() {
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [error, setError] = useState("");

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  /* ===========================
     Generate Exam
  =========================== */
  const handleGenerateExam = async () => {
  setLoading(true);
  setError("");
  setGeneratedExam(null);

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/exams/generate-thinking-skills`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: null
      }
    );

    // Safely read response (may be empty or non-JSON on error)
    const responseText = await response.text();
    const data = responseText ? JSON.parse(responseText) : {};

    console.log("Generate exam response:", data);

    if (!response.ok) {
      throw new Error(data.detail || "Failed to generate Thinking Skills exam");
    }

    setGeneratedExam(data);
    alert("Exam generated successfully!");
  } catch (error) {
    console.error("❌ Generate exam failed:", error);
    setError(error.message || "Something went wrong while generating the exam");
  } finally {
    setLoading(false);
  }
};

  /* ===========================
     UI
  =========================== */
  return (
    <div className="generate-exam-container">
      <h2>Generate Thinking Skills Exam</h2>

      {error && <p className="error-text">{error}</p>}

      <button
        className="generate-btn blue-btn"
        onClick={handleGenerateExam}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>

      {generatedExam && (
        <div className="generated-output">
          <h3>Generated Exam</h3>
          <div className="generated-output">
            <h3>Generated Exam</h3>
          
            <p><strong>Exam ID:</strong> {generatedExam.exam_id}</p>
            <p><strong>Total Questions:</strong> {generatedExam.total_questions}</p>
          </div>

        </div>
      )}
    </div>
  );
}
