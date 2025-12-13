import React, { useState } from "react";

export default function GenerateExam_foundational() {
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  // ---------------------------
  // GENERATE EXAM
  // ---------------------------
  const handleGenerateExam = async () => {
    setLoading(true);
    setGeneratedExam(null);

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/exams/generate-foundational`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}) // no payload needed
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Failed to generate exam.");
        setLoading(false);
        return;
      }

      setGeneratedExam(data);
      alert("✅ Foundational exam generated successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Network error while generating exam.");
    }

    setLoading(false);
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div style={{ padding: "20px" }}>
      <h2>Generate Foundational Exam</h2>

      <button
        onClick={handleGenerateExam}
        disabled={loading}
        style={{
          padding: "12px 22px",
          backgroundColor: "#2196f3",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>

      {generatedExam && (
        <div style={{ marginTop: "30px" }}>
          <h3>Generated Exam</h3>

          <p>
            <strong>Total Questions:</strong>{" "}
            {generatedExam.total_questions}
          </p>
        </div>
      )}
    </div>
  );
}
