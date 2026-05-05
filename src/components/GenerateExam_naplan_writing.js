import React, { useState } from "react";
import "./generate_exam.css";

const BACKEND_URL = process.env.REACT_APP_API_URL;

export default function GenerateExam_naplan_writing({ mode }) {
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedClassYear, setSelectedClassYear] = useState(5);

  /* ===========================
     Generate Exam Handler
  =========================== */
  const handleGenerateNaplanWritingExam = async () => {
    setLoading(true);
    setErrorMessage("");
    setGeneratedExam(null);

    try {
      let endpoint = "";

      if (mode === "random") {
        endpoint = "/api/exams/generate-naplan-writing";
      } else if (mode === "latest") {
        endpoint = "/api/exams/generate-naplan-writing-latest";
      } else {
        throw new Error("Invalid generation mode");
      }

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class_year: selectedClassYear,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate NAPLAN Writing exam");
      }

      setGeneratedExam(data);
      alert("✅ NAPLAN Writing exam generated successfully!");
    } catch (error) {
      console.error("❌ Generate exam failed:", error);
      setErrorMessage(
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
      <h2>Generate NAPLAN Writing Exam</h2>

      {/* Class Year Selector */}
      <div className="form-group">
        <label>Select Class Year:</label>
        <select
          value={selectedClassYear}
          onChange={(e) => setSelectedClassYear(Number(e.target.value))}
        >
          <option value={3}>Year 3</option>
          <option value={4}>Year 4</option>
          <option value={5}>Year 5</option>
          <option value={6}>Year 6</option>
        </select>
      </div>

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {/* Generate Button */}
      <button
        className="generate-btn blue-btn"
        onClick={handleGenerateNaplanWritingExam}
        disabled={loading}
      >
        {loading
          ? "Generating..."
          : mode === "latest"
          ? "Generate Exam (Latest Questions)"
          : "Generate Exam (Random Questions)"}
      </button>

      {/* RESULT */}
      {generatedExam && (
        <div className="generated-output">
          <h3>Generated Exam Preview</h3>

          <p>
            <strong>Exam ID:</strong> {generatedExam.exam_id}
          </p>
          <p>
            <strong>Quiz ID:</strong> {generatedExam.quiz_id}
          </p>
          <p>
            <strong>Class Year:</strong> {generatedExam.class_year}
          </p>

          {/* Writing Prompt */}
          {generatedExam.prompt && (
            <div className="question-card">
              <h4>Writing Prompt</h4>
              <p>{generatedExam.prompt}</p>
            </div>
          )}

          {/* Optional Instructions */}
          {generatedExam.instructions && (
            <div className="question-card">
              <h4>Instructions</h4>
              <p>{generatedExam.instructions}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}