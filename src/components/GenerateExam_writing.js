import React, { useState } from "react";

export default function GenerateExam_writing() {
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [error, setError] = useState("");

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  /* -----------------------------------------------------------
     GENERATE WRITING EXAM
     (Backend decides class/topic/difficulty)
  ----------------------------------------------------------- */
  const handleGenerateExam = async () => {
    setLoading(true);
    setError("");
    setGeneratedExam(null);

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/exams/generate-writing`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to generate writing exam");
      }

      setGeneratedExam(data);
      alert("✅ Writing exam generated successfully!");
    } catch (err) {
      console.error(err);
      setError(err.message || "Network error");
      alert("❌ Error generating writing exam");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------------------------------------
     UI
  ----------------------------------------------------------- */
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Generate Writing Exam</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={handleGenerateExam}
        disabled={loading}
        style={{
          padding: "14px 22px",
          fontSize: "16px",
          fontWeight: "600",
          backgroundColor: "#673ab7",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Generating..." : "Generate Writing Exam"}
      </button>

      {/* ------------ Preview (Optional) ------------ */}
      {generatedExam && (
        <div style={{ marginTop: "30px", textAlign: "left" }}>
          <h3>Generated Writing Prompt</h3>

          <p>
            <strong>Class:</strong> {generatedExam.class_name}
          </p>
          <p>
            <strong>Topic:</strong> {generatedExam.topic}
          </p>
          <p>
            <strong>Difficulty:</strong> {generatedExam.difficulty}
          </p>

          <div
            style={{
              marginTop: "10px",
              padding: "15px",
              border: "1px solid #ccc",
              background: "#fafafa",
              whiteSpace: "pre-wrap"
            }}
          >
            {generatedExam.question_text}
          </div>
        </div>
      )}
    </div>
  );
}
