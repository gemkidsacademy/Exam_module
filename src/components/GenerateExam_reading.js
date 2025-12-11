import React, { useState, useEffect } from "react";

export default function GenerateExam_reading() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [error, setError] = useState("");

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  const formatClassName = (cls) => {
    switch (cls) {
      case "year1": return "Year 1";
      case "year2": return "Year 2";
      case "year3": return "Year 3";
      case "year4": return "Year 4";
      case "year5": return "Year 5";
      case "year6": return "Year 6";
      case "selective": return "Selective";
      case "kindergarten": return "Kindergarten";
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

  // ---------------------------
  // LOAD QUIZZES (DEBUG LOGS)
  // ---------------------------
  useEffect(() => {
  const fetchQuizzes = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/quizzes-reading`);
      if (!res.ok) throw new Error("Failed to load quizzes");
      const data = await res.json();
      console.log("📦 Loaded quizzes:", data);
      setQuizzes(data);
    } catch (err) {
      console.error("❌ Error loading quizzes:", err);
      setError("Error loading quizzes from backend.");
    }
  };

  fetchQuizzes();
}, []);
  // ---------------------------
  // GENERATE EXAM (DEBUG LOGS)
  // ---------------------------
  const handleGenerateExam = async () => {
    console.log("\n==========================");
    console.log("▶️ GENERATE EXAM CLICKED");
    console.log("==========================");

    console.log("🔍 selectedQuiz Raw:", selectedQuiz);
    console.log("🔍 typeof selectedQuiz:", typeof selectedQuiz);

    if (!selectedQuiz || selectedQuiz === "0") {
      alert("Please select a quiz before generating the exam.");
      console.log("⚠️ BLOCKED: selectedQuiz is invalid");
      return;
    }

    const quizId = Number(selectedQuiz);

    console.log("🔢 Converted quizId (Number):", quizId);
    console.log("🔍 typeof quizId:", typeof quizId);

    if (isNaN(quizId)) {
      console.error("❌ quizId is NaN! Aborting.");
      alert("Internal error: quizId is NaN");
      return;
    }

    const url = `${BACKEND_URL}/api/exams/generate/${quizId}`;
    console.log("🌍 FINAL REQUEST URL:", url);

    setLoading(true);
    setError("");
    setGeneratedExam(null);

    try {
      const res = await fetch(url, { method: "POST" });

      console.log("📡 Backend response status:", res.status);

      let data;
      try {
        data = await res.json();
        console.log("📦 Response JSON:", data);
      } catch (parseErr) {
        console.error("❌ Failed to parse JSON:", parseErr);
      }

      if (!res.ok) {
        console.error("❌ Backend returned error:", data);
        throw new Error(data?.detail || "Exam generation failed");
      }

      console.log("✅ Exam generated successfully:", data);
      setGeneratedExam(data);

    } catch (err) {
      console.error("❌ Error generating exam:", err);
      setError("Failed to generate exam. Check console for details.");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Generate Exam</h2>

      {error && <div style={{ color: "red" }}>{error}</div>}

      <div style={{ margin: "10px 0" }}>
        <label style={{ marginRight: "10px" }}>Select Quiz:</label>

        <select
          value={selectedQuiz}
          onChange={(e) => {
            console.log("🟦 onChange → new value:", e.target.value);
            setSelectedQuiz(e.target.value);
          }}
          style={{ padding: "6px", minWidth: "280px" }}
        >
          <option value="">-- Select Quiz Requirement --</option>

          {quizzes.map((q) => (
            <option key={q.id} value={q.id}>
              {`${formatClassName(q.class_name)} | ${formatDifficulty(q.difficulty)}`}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleGenerateExam}
        disabled={loading}
        style={{
          padding: "8px 15px",
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>

      {generatedExam && (
        <div style={{ marginTop: "30px" }}>
          <h3>Generated Exam Preview</h3>

          <p><strong>Exam ID:</strong> {generatedExam.exam_id}</p>
          <p><strong>Quiz ID:</strong> {generatedExam.quiz_id}</p>

          {generatedExam.questions?.length > 0 ? (
            <div style={{ marginTop: "20px" }}>
              {generatedExam.questions.map((q) => (
                <div
                  key={q.question_number}
                  style={{
                    marginBottom: "20px",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                  }}
                >
                  <strong>Q{q.question_number}.</strong> {q.question_text}
                  <p><strong>Correct Answer:</strong> {q.correct_answer}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No questions found.</p>
          )}
        </div>
      )}
    </div>
  );
}
