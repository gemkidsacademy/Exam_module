import React, { useState, useEffect } from "react";
import "./generateexam_writing.css";

export default function GenerateExam_writing() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedClassYear, setSelectedClassYear] = useState("Year 6");


  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  /* ---------------- Load Writing Quiz Configs ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/get-quizzes-writing`);
        if (!res.ok) throw new Error("Failed to load writing quizzes");

        const data = await res.json();
        const filtered = data.map((q) => ({
          class_name: q.class_name,
          difficulty: q.difficulty,
          class_year: q.class_year   // ✅ ADD THIS
        }));

        setQuizzes(filtered);

        // 🔑 Auto-select latest config (same data dropdown used before)
        if (filtered.length > 0) {
          const latest = filtered[filtered.length - 1];
          setSelectedQuiz(latest);
          setSelectedClass(latest.class_name);
          setSelectedDifficulty(latest.difficulty);
          setSelectedClassYear(latest.class_year);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load writing quizzes.");
      }
    };

    load();
  }, []);
  const handleGenerateHomeworkExam = async () => {
  if (!selectedClass || !selectedClassYear || !selectedDifficulty) {
    alert("Quiz configuration not ready");
    return;
  }

  setLoading(true);
  setError("");
  setGeneratedExam(null);
  setSuccessMessage("");

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/exams/generate-writing-homework`, // ✅ NEW ENDPOINT /api/exams/generate-writing-homework
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_name: selectedClass,
          class_year: selectedClassYear,
          difficulty: selectedDifficulty
        })
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to generate homework exam");

    setSuccessMessage("Writing homework exam created successfully.");
    setGeneratedExam(data);
  } catch (err) {
    console.error(err);
    setError("Network error while generating writing homework exam.");
  } finally {
    setLoading(false);
  }
};
  /* ---------------- Generate Writing Exam ---------------- */
  const handleGenerateExam = async () => {
  

  setLoading(true);
  setError("");
  setGeneratedExam(null);
  setSuccessMessage("");

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/exams/generate-writing`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_name: selectedClass,
          class_year: selectedClassYear,   // ✅ ADD THIS
          difficulty: selectedDifficulty
        })
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to generate exam");

    setSuccessMessage("Writing exam created successfully.");
    setGeneratedExam(data);
  } catch (err) {
    console.error(err);
    setError("Network error while generating writing exam.");
  } finally {
    setLoading(false);
  }
};

  /* ---------------- UI (BUTTON ONLY) ---------------- */
  return (
    <div className="generate-writing-container">
    
      {error && <div className="error-text">{error}</div>}
      {successMessage && (
        <div className="success-text">{successMessage}</div>
      )}
      {/* CLASS YEAR */}
      <label>Class Year:</label>
      <select
        value={selectedClassYear}
        onChange={(e) => setSelectedClassYear(e.target.value)}
        required
      >
        <option value="">Select Year</option>
        <option value="Year 4">Year 4</option>
        <option value="Year 5">Year 5</option>
        <option value="Year 6">Year 6</option>
        
      </select>
      <h2>Generate Writing Exam</h2>

      <button
        className="primary-btn"
        onClick={handleGenerateExam}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Writing Exam"}
      </button>
      <button
        className="primary-btn"
        onClick={handleGenerateHomeworkExam}
        disabled={loading}
        style={{ marginTop: "10px", backgroundColor: "#6c63ff" }}
      >
        {loading ? "Generating..." : "Generate Writing Exam (Homework)"}
      </button>
    </div>
  );
}
