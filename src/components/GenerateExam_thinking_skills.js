import React, { useState, useEffect } from "react";
import "./generate_exam.css";

export default function GenerateExam_thinking_skills() {
  const [difficulty, setDifficulty] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [error, setError] = useState("");

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  /* ===========================
     Formatting Helpers
  =========================== */
  const formatDifficulty = (lvl) => {
    switch (lvl) {
      case "easy":
        return "Easy";
      case "medium":
        return "Medium";
      case "hard":
        return "Hard";
      default:
        return lvl;
    }
  };

  /* ===========================
     Load Difficulty
  =========================== */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/quizzes/thinking-skills/difficulty`
        );

        if (!res.ok) throw new Error("Failed to load difficulty");

        const data = await res.json();
        setDifficulty(data);
      } catch (err) {
        console.error("❌ Error loading difficulty:", err);
        setError("Failed to load difficulty.");
      }
    };

    load();
  }, []);

  /* ===========================
     Generate Exam
  =========================== */
  const handleGenerateExam = async () => {
    if (!selectedDifficulty) {
      alert("Please select a difficulty before generating the exam.");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedExam(null);

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/exams/generate-thinking-skills`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ difficulty: selectedDifficulty })
        }
      );

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

      <div className="form-group">
        <label>Select Difficulty</label>
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
        >
          <option value="">-- Select Difficulty --</option>
          {difficulty && (
            <option value={difficulty}>
              {formatDifficulty(difficulty)}
            </option>
          )}
        </select>
      </div>

      <button
        className="generate-btn"
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
