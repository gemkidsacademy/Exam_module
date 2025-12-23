import React, { useState, useEffect } from "react";
import "./generateexam_reading.css";

export default function GenerateExam_reading() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  /* ---------------------------
     LOAD QUIZ CONFIGS
  --------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/quizzes-reading`);
        if (!res.ok) throw new Error("Failed to load quizzes");

        const data = await res.json();
        setQuizzes(data);

        if (data.length > 0) {
          const latest = data[data.length - 1];
          setSelectedQuiz(latest);
          setSelectedClass(latest.class_name);
          setSelectedDifficulty(latest.difficulty);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load quizzes.");
      }
    };

    load();
  }, []);

  /* ---------------------------
     GENERATE EXAM
  --------------------------- */
  const handleGenerateExam = async () => {
    if (!selectedClass || !selectedDifficulty) {
      alert("Quiz configuration not ready");
      return;
    }

    // 🔑 reset UI state before request
    setLoading(true);
    setError("");
    setSuccessMessage("");
    setGeneratedExam(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/exams/generate-reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_name: selectedClass,
          difficulty: selectedDifficulty
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Failed to generate exam.");
        return;
      }

      // ✅ success message AFTER backend confirms
      setSuccessMessage("Exam created successfully.");
      setGeneratedExam(data);

    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------
     UI
  --------------------------- */
  return (
    <div className="generate-reading-container">
      {error && <p className="error-text">{error}</p>}
      {successMessage && (
        <p className="success-text">{successMessage}</p>
      )}

      <button
        className="primary-btn"
        onClick={handleGenerateExam}
        disabled={loading || !selectedClass}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>
    </div>
  );
}
