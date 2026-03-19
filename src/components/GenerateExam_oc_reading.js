import React, { useState } from "react";

const GenerateExam_oc_reading = () => {
  const [className, setClassName] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleGenerateExam = async () => {
    if (!className || !difficulty) {
      setMessage("Please enter class name and difficulty");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "https://web-production-481a5.up.railway.app/api/exams/generate-oc-reading",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            class_name: className,
            difficulty: difficulty,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ OC Reading Exam generated successfully");
      } else {
        setMessage(data.detail || "❌ Failed to generate exam");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Server error while generating exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2>Generate OC Reading Exam</h2>

      <input
        type="text"
        placeholder="Enter Class Name (e.g. OC)"
        value={className}
        onChange={(e) => setClassName(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
      />

      <input
        type="text"
        placeholder="Enter Difficulty (e.g. medium)"
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
      />

      <button
        className="dashboard-button"
        onClick={handleGenerateExam}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>

      {message && <p style={{ marginTop: "15px" }}>{message}</p>}
    </div>
  );
};

export default GenerateExam_oc_reading;
