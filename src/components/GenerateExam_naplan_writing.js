import React, { useState } from "react";
import "./generate_exam.css";

const BACKEND_URL = process.env.REACT_APP_API_URL;

export default function GenerateExam_naplan_writing({
  mode,
  centerCode,
}) {
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedClassYear, setSelectedClassYear] = useState("5");

  /* ===========================
     Generate Actual Exam
  =========================== */
const handleGenerateNaplanWritingExam = async () => {
  setLoading(true);
  setErrorMessage("");
  setGeneratedExam(null);

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/exams/generate-naplan-writing`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class_year: selectedClassYear,
          center_code: centerCode,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to generate NAPLAN Writing exam."
      );
    }

    setGeneratedExam(data);

    alert("✅ NAPLAN Writing exam generated successfully!");

  } catch (error) {
    console.error("❌ Generate NAPLAN Writing exam failed:", error);

    setErrorMessage(
      error.message ||
      "Something went wrong while generating the exam."
    );
  } finally {
    setLoading(false);
  }
};
  /* ===========================
     Generate Homework Exam
  =========================== */
  const handleGenerateNaplanWritingHomework = async () => {
  setLoading(true);
  setErrorMessage("");
  setGeneratedExam(null);

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/exams/generate-naplan-writing-homework`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class_year: selectedClassYear,
          center_code: centerCode,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail ||
        "Failed to generate NAPLAN Writing homework exam."
      );
    }

    setGeneratedExam(data);

    alert(
      "✅ NAPLAN Writing homework exam generated successfully!"
    );

  } catch (error) {
    console.error(
      "❌ Generate NAPLAN Writing homework exam failed:",
      error
    );

    setErrorMessage(
      error.message ||
      "Something went wrong while generating the homework exam."
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

      {/* Class Year */}
      <div className="form-group">
        <label>Select Class Year:</label>

        <select
          value={selectedClassYear}
          onChange={(e) => setSelectedClassYear(e.target.value)}
        >
          <option value="3">Year 3</option>
          <option value="5">Year 5</option>
          <option value="7">Year 7</option>
          <option value="9">Year 9</option>
        </select>
      </div>

      {errorMessage && (
        <p className="error-text">
          {errorMessage}
        </p>
      )}

      {/* Generate Actual Exam */}
      <button
        className="generate-btn blue-btn"
        onClick={handleGenerateNaplanWritingExam}
        disabled={loading}
      >
        {loading
          ? "Generating..."
          : "Generate Exam"}
      </button>

      {/* Generate Homework */}
      <button
        className="generate-btn blue-btn"
        onClick={handleGenerateNaplanWritingHomework}
        disabled={loading}
        style={{ marginTop: "15px" }}
      >
        {loading
          ? "Generating..."
          : "Generate Homework Exam"}
      </button>

      {/* Result */}
      {generatedExam && (
        <div className="generated-output">
          <h3>Generated Exam Preview</h3>

          <p>
            <strong>Exam ID:</strong>{" "}
            {generatedExam.exam_id}
          </p>

          <p>
            <strong>Class Year:</strong>{" "}
            {generatedExam.class_year}
          </p>

          <p>
            <strong>Topic:</strong>{" "}
            {generatedExam.topic}
          </p>

          <p>
            <strong>Difficulty:</strong>{" "}
            {generatedExam.difficulty}
          </p>

          <div className="question-card">
            <h4>Writing Exam</h4>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
              }}
            >
              {generatedExam.exam_text}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}