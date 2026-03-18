import React, { useState } from "react";
import "./generate_exam.css";

export default function GenerateExam_oc_mathematical_reasoning() {
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [error, setError] = useState("");

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  /* ===========================
     Generate OC Mathematical Reasoning Exam
  =========================== */
  const handleGenerateExam_oc_mathematical_reasoning = async () => {
    setLoading(true);
    setError("");
    setGeneratedExam(null);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/exams/generate-oc-mathematical-reasoning`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: null
        }
      );

      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : {};

      console.log("OC Mathematical Reasoning exam response:", data);

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to generate OC Mathematical Reasoning exam"
        );
      }

      setGeneratedExam(data);
      alert("OC Mathematical Reasoning exam generated successfully!");
    } catch (error) {
      console.error("❌ OC MR exam generation failed:", error);
      setError(
        error.message || "Something went wrong while generating the exam"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     UI
  =========================== */
  return (
    <div className="generate-exam-container">
      <h2>Generate OC Mathematical Reasoning Exam</h2>

      {error && <p className="error-text">{error}</p>}

      <button
        className="generate-btn blue-btn"
        onClick={handleGenerateExam_oc_mathematical_reasoning}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>

      {generatedExam && (
        <div className="generated-output">
          <h3>Generated Exam</h3>

          <p>
            <strong>Exam ID:</strong> {generatedExam.exam_id}
          </p>
          <p>
            <strong>Total Questions:</strong>{" "}
            {generatedExam.total_questions}
          </p>
        </div>
      )}
    </div>
  );
}
