import React, { useState } from "react";

const GenerateExam_naplan_numeracy = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(
        "https://web-production-481a5.up.railway.app/naplan/numeracy/generate-exam",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate exam");
      }

      setMessage(
        `✅ Exam generated successfully (Exam ID: ${data.exam_id}, ${data.total_questions} questions)`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h3>Generate NAPLAN Numeracy Exam</h3>

      <button
        className="dashboard-button"
        onClick={handleGenerate}
        disabled={loading}
        style={{ width: "100%" }}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>

      {message && (
        <p style={{ color: "green", marginTop: "12px" }}>{message}</p>
      )}

      {error && (
        <p style={{ color: "red", marginTop: "12px" }}>{error}</p>
      )}
    </div>
  );
};

export default GenerateExam_naplan_numeracy;
