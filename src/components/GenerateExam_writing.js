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

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  /* ---------------- Formatting Helpers ---------------- */
  const formatClassName = (cls) => {
    switch (cls) {
      case "year5": return "Year 5";
      case "year6": return "Year 6";
      case "selective": return "Selective";
      default: return cls;
    }
  };

  const formatDifficulty = (lvl) => {
    switch (lvl) {
      case "easy": return "Easy";
      case "medium": return "Medium";
      case "hard": return "Hard";
      default: return lvl;
    }
  };

  /* ---------------- Load Writing Quiz Configs ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/get-quizzes-writing`);
        if (!res.ok) throw new Error("Failed to load writing quizzes");

        const data = await res.json();
        const filtered = data.map((q) => ({
          class_name: q.class_name,
          difficulty: q.difficulty
        }));

        setQuizzes(filtered);
      } catch (err) {
        console.error(err);
        setError("Failed to load writing quizzes.");
      }
    };

    load();
  }, []);

  /* ---------------- Generate Writing Exam ---------------- */
  const handleGenerateExam = async () => {
    if (!selectedClass || !selectedDifficulty) {
      alert("Please select class and difficulty");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedExam(null);

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/exams/generate-writing`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            class_name: selectedClass,
            difficulty: selectedDifficulty
          })
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to generate exam");

      setGeneratedExam(data);
    } catch (err) {
      console.error(err);
      setError("Network error while generating writing exam.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="generate-writing-container">
      <h2>Generate Writing Exam</h2>

      {error && <div className="error-text">{error}</div>}

      <div className="form-group">
        <label>Select Writing Configuration</label>
        <select
          value={selectedQuiz ? JSON.stringify(selectedQuiz) : ""}
          onChange={(e) => {
            const parsed = JSON.parse(e.target.value);
            setSelectedQuiz(parsed);
            setSelectedClass(parsed.class_name);
            setSelectedDifficulty(parsed.difficulty);
          }}
        >
          <option value="">-- Select Writing Quiz --</option>
          {quizzes.map((q) => (
            <option
              key={`${q.class_name}-${q.difficulty}`}
              value={JSON.stringify(q)}
            >
              {`${formatClassName(q.class_name)} | ${formatDifficulty(q.difficulty)}`}
            </option>
          ))}
        </select>
      </div>

      <button
        className="primary-btn"
        onClick={handleGenerateExam}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Writing Exam"}
      </button>

      {generatedExam && (
        <div className="generated-output">
          <h3>Generated Writing Prompt</h3>

          <p><strong>Class:</strong> {generatedExam.class_name}</p>
          <p><strong>Difficulty:</strong> {generatedExam.difficulty}</p>

          <div className="writing-prompt">
            {generatedExam.question_text}
          </div>
        </div>
      )}
    </div>
  );
}
