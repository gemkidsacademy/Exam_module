import React, { useState, useEffect } from "react";

export default function GenerateExam_thinking_skills() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
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
        console.log("📦 Loaded thinking skills quizzes:", data);
        setQuizzes(data);
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
    if (!selectedQuiz) {
      alert("Please select a quiz before generating the exam.");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedExam(null);

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/exams/generate-thinking-skills/${selectedQuiz}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Exam generation failed");
      }

      setGeneratedExam(data);
      alert("Exam generated successfully!");

    } catch (err) {
      console.error(err);
      setError("Failed to generate exam. Check console for details.");
    }

    setLoading(false);
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
          value={selectedQuiz ? JSON.stringify(selectedQuiz) : ""}
          onChange={(e) => {
            const parsed = JSON.parse(e.target.value);
        
            setSelectedQuiz(parsed);   // ✅ now includes topics[]
            setSelectedClass(parsed.class_name);
            setSelectedDifficulty(parsed.difficulty);
          }}
        >
          <option value="">-- Select Quiz Requirement --</option>
        
          {quizzes.map((q) => (
            <option
              key={`${q.class_name}-${q.difficulty}`}
              value={JSON.stringify(q)}   // ✅ full object
            >
              {formatClassName(q.class_name)} | {formatDifficulty(q.difficulty)}
            </option>
          ))}
        </select>

      </div>

      {/* -------- Topics Preview -------- */}
      {selectedQuiz && selectedQuiz.topics && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            border: "1px solid #ddd",
            background: "#f9f9f9"
          }}
        >
          <strong>Included Topics:</strong>
          <ul style={{ marginTop: "8px" }}>
            {selectedQuiz.topics.map((t, idx) => (
              <li key={idx}>
                {t.name} ({t.num_questions} questions)
              </li>
            ))}
          </ul>
        </div>
      )}

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
