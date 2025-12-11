import React, { useState, useEffect } from "react";

export default function GenerateExam_reading() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null); // will store class_name + difficulty
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");


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
  // LOAD QUIZ CONFIGS
  // ---------------------------
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/quizzes-reading`);
        if (!res.ok) throw new Error("Failed to load quizzes");

        const data = await res.json();
        console.log("📦 Loaded quizzes:", data);
        setQuizzes(data);

      } catch (err) {
        console.error("❌ Error loading quizzes:", err);
        setError("Failed to load quizzes.");
      }
    };

    load();
  }, []);

  // ---------------------------
  // GENERATE EXAM (NO CONFIG ID)
  // ---------------------------
  const handleGenerateExam = async () => {
  if (!selectedClass || !selectedDifficulty) {
    alert("Please select class and difficulty");
    return;
  }

  const payload = {
    class_name: selectedClass,
    difficulty: selectedDifficulty
  };

  console.log("📤 Sending payload:", payload);

  const res = await fetch(`${BACKEND_URL}/api/exams/generate-reading`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  console.log("📡 Status:", res.status);

  const data = await res.json();
  console.log("📥 Response JSON:", data);
};

  return (
    <div style={{ padding: "20px" }}>
      <h2>Generate Reading Exam</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "20px" }}>
        <label>Select Quiz:</label>

       <select
          value={selectedQuiz ? JSON.stringify(selectedQuiz) : ""}
          onChange={(e) => {
            const parsed = JSON.parse(e.target.value);
        
            console.log("📘 Class selected:", parsed.class_name);
            console.log("📙 Difficulty selected:", parsed.difficulty);
        
            setSelectedQuiz(parsed);
            setSelectedClass(parsed.class_name);          // ✅ ADD THIS
            setSelectedDifficulty(parsed.difficulty);     // ✅ ADD THIS
          }}
          style={{ padding: "8px", minWidth: "260px", display: "block", marginTop: "10px" }}
        >
          <option value="">-- Select Quiz Requirement --</option>
        
          {quizzes.map((q) => (
            <option
              key={`${q.class_name}-${q.difficulty}`}
              value={JSON.stringify({
                class_name: q.class_name,
                difficulty: q.difficulty,
              })}
            >
              {`${formatClassName(q.class_name)} | ${formatDifficulty(q.difficulty)}`}
            </option>
          ))}
        </select>

      </div>

      <button
        onClick={handleGenerateExam}
        disabled={loading}
        style={{
          padding: "10px 18px",
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
          <h3>Generated Exam</h3>

          <p><strong>Total Questions:</strong> {generatedExam.total_questions}</p>

          {generatedExam.questions?.length > 0 ? (
            generatedExam.questions.map((q, idx) => (
              <div key={idx} style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
                <strong>Q{idx + 1}:</strong> {q.question}
                <p><strong>Correct:</strong> {q.correct}</p>
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
