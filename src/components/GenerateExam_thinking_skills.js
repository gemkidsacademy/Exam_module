import React, { useState, useEffect } from "react";
import generateexam.css

export default function GenerateExam_thinking_skills() {
  const [difficulty, setDifficulty] = useState("");
  
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [error, setError] = useState("");

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  /* ===========================
     Formatting Helpers
  =========================== */
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

  /* ===========================
     Load Quiz Configs
  =========================== */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/quizzes/thinking-skills/difficulty`);
        if (!res.ok) throw new Error("Failed to load quizzes");

        const data = await res.json();
        setDifficulty(data);

      } catch (err) {
        console.error("❌ Error loading quizzes:", err);
        setError("Failed to load quizzes.");
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
          body: JSON.stringify({
            difficulty: selectedDifficulty
          })
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
    <div style={{ padding: "20px" }}>
      <h2>Generate Thinking Skills Exam</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* -------- Quiz Selector -------- */}
      <div style={{ marginBottom: "20px" }}>
        <label>Select Quiz:</label>

        <select
          value={selectedDifficulty}
          onChange={(e) => {
            setSelectedDifficulty(e.target.value);
          }}
        >
          <option value="">-- Select Difficulty --</option>
        
          {difficulty && (
            <option value={difficulty}>
              {formatDifficulty(difficulty)}
            </option>
          )}
        </select>


      </div>

      {/* -------- Topics Preview -------- */}
      

      {/* -------- Generate Button -------- */}
      <button
        onClick={handleGenerateExam}
        disabled={loading}
        style={{
          marginTop: "20px",
          padding: "10px 18px",
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>

      {/* -------- Generated Exam Output -------- */}
      {generatedExam && (
        <div style={{ marginTop: "30px" }}>
          <h3>Generated Exam</h3>

          <p>
            <strong>Total Questions:</strong>{" "}
            {generatedExam.total_questions}
          </p>

          {generatedExam.questions?.length > 0 ? (
            generatedExam.questions.map((q, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: "20px",
                  padding: "10px",
                  border: "1px solid #ccc"
                }}
              >
                <strong>Q{idx + 1}:</strong> {q.question}
                <p>
                  <strong>Correct:</strong> {q.correct}
                </p>
              </div>
            ))
          ) : (
            <p>No questions generated.</p>
          )}
        </div>
      )}
    </div>
  );
}
