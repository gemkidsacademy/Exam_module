import React, { useState } from "react";
import "./generate_exam.css";

export default function GenerateExam_oc_thinking_skills() {
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [classYear, setClassYear] = useState("");
  const [error, setError] = useState("");

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  /* ===========================
     Generate OC Thinking Skills Exam
  =========================== */
  const handleGenerateHomework_oc_thinking_skills = async () => {
  if (!classYear) {
    setError("Please select class year");
    return;
  }

  setLoading(true);
  setError("");
  setGeneratedExam(null);

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/exams/generate-oc-thinking-skills-homework`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          class_year: Number(classYear)
        })
      }
    );

    const responseText = await response.text();
    const data = responseText ? JSON.parse(responseText) : {};

    console.log("OC Homework response:", data);

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to generate OC homework"
      );
    }

    setGeneratedExam(data);
    alert("OC Homework generated successfully!");
  } catch (error) {
    console.error("❌ OC homework generation failed:", error);
    setError(
      error.message || "Something went wrong while generating homework"
    );
  } finally {
    setLoading(false);
  }
};
  const handleGenerateExam_oc_thinking_skills = async () => {
    setLoading(true);
    setError("");
    setGeneratedExam(null);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/exams/generate-oc-thinking-skills`,
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

      console.log("OC Thinking Skills exam response:", data);

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to generate OC Thinking Skills exam"
        );
      }

      setGeneratedExam(data);
      alert("OC Thinking Skills exam generated successfully!");
    } catch (error) {
      console.error("❌ OC exam generation failed:", error);
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
      <h2>Generate OC Thinking Skills Exam</h2>

      {error && <p className="error-text">{error}</p>}
      <div className="input-group">
      <label>Select Class Year</label>
      <select
        value={classYear}
        onChange={(e) => setClassYear(e.target.value)}
      >
        <option value="">-- Select Year --</option>
        <option value="3">Year 3</option>
        <option value="4">Year 4</option>
        
      </select>
    </div>
      <button
        className="generate-btn blue-btn"
        onClick={handleGenerateExam_oc_thinking_skills}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>
      <button
        className="generate-btn green-btn"
        onClick={handleGenerateHomework_oc_thinking_skills}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Homework"}
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
