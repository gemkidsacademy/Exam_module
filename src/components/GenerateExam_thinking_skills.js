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
    const res = await fetch(
      `${BACKEND_URL}/__diagnostic_ping`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      }
    );
  
    const data = await res.json();
    console.log("Diagnostic response:", data);
  } catch (err) {
    console.error("Diagnostic error:", err);
  }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Exam generation failed");
    }

    setGeneratedExam(data);
    alert("Exam generated successfully!");
  } catch (err) {
    console.error("❌ Generate exam failed:", err);
    setError("Failed to generate exam. Check console for details.");
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
          <p>
            <strong>Total Questions:</strong>{" "}
            {generatedExam.total_questions}
          </p>
        </div>
      )}
    </div>
  );
}
