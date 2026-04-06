import React, { useState } from "react";
import "./generate_exam.css";

const BACKEND_URL = "https://web-production-481a5.up.railway.app";

export default function GenerateExam_thinking_skills() {
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ NEW: class year state
  const [selectedClassYear, setSelectedClassYear] = useState(5);

  /* ===========================
     Generate Exam Handler
  =========================== */
  const handleGenerateThinkingSkillsExam = async () => {
    setLoading(true);
    setErrorMessage("");
    setGeneratedExam(null);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/exams/generate-thinking-skills`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            class_year: selectedClassYear   // ✅ KEY CHANGE
          })
        }
      );

      const data = await response.json();

      console.log("Generate exam response:", data);

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate Thinking Skills exam");
      }

      setGeneratedExam(data);
      alert("✅ Exam generated successfully!");
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
      <h2>Generate Thinking Skills Exam</h2>

      {/* ✅ NEW: Class Year Selector */}
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
      <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
      <button
        className="generate-btn blue-btn"
        onClick={handleGenerateThinkingSkillsExam}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>
      <button
  className="generate-btn blue-btn"
  type="button"
  onClick={async () => {
    try {
      const res = await fetch(
        "https://web-production-481a5.up.railway.app/api/exams/generate-thinking-skills-homework",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            class_year: selectedClassYear
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error("Backend returned:", err);
        throw new Error("Failed to generate homework exam");
      }

      const data = await res.json();
      console.log("Homework exam generated:", data);

      alert("Homework exam generated successfully!");
    } catch (error) {
      console.error(error);
      alert("Error generating homework exam.");
    }
  }}
  style={{ marginLeft: "10px" }}
>
  Generate Exam (Homework)
</button>
</div>

      {/* RESULT */}
      {generatedExam && (
        <div className="generated-output">
          <h3>Generated Exam</h3>

          <p><strong>Exam ID:</strong> {generatedExam.exam_id}</p>
          <p><strong>Total Questions:</strong> {generatedExam.total_questions}</p>
          <p><strong>Class Year:</strong> {selectedClassYear}</p>

          {generatedExam.sections && (
            <div style={{ marginTop: "15px" }}>
              <h4>Sections:</h4>
              {generatedExam.sections.map((sectionItem, index) => (
                <div key={index} style={{ marginBottom: "10px" }}>
                  <strong>{sectionItem.name}:</strong> {sectionItem.total} questions
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


/*
import React, { useState } from "react";
import "./generate_exam.css";

export default function GenerateExam_thinking_skills() {
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [error, setError] = useState("");

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  // ===========================
  // Generate Exam
  // ===========================
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

  // ===========================
  // UI
  // ===========================
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
*/


