import React, { useState, useEffect } from "react";

export default function GenerateExam_reading() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [error, setError] = useState("");

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  // ---------------------------
  // Formatting Helpers
  // ---------------------------
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
  // GENERATE EXAM
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

    setLoading(true);
    setError("");
    setGeneratedExam(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/exams/generate-reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log("📥 Response JSON:", data);

      if (!res.ok) {
        setError(data.detail || "Failed to generate exam.");
        alert("❌ Error: " + (data.detail || "Failed to generate exam."));
        setLoading(false);
        return;
      }

      setGeneratedExam(data);
      alert("✅ Exam generated successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Network error while generating exam.");
      setError("Network error");
    }

    setLoading(false);
  };

  // ---------------------------
  // UI
  // ---------------------------
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
            setSelectedClass(parsed.class_name);
            setSelectedDifficulty(parsed.difficulty);
          }}
          style={{
            padding: "8px",
            minWidth: "260px",
            display: "block",
            marginTop: "10px"
          }}
        >
          <option value="">-- Select Quiz Requirement --</option>

          {quizzes.map((q) => (
            <option
              key={`${q.class_name}-${q.difficulty}`}
              value={JSON.stringify({
                class_name: q.class_name,
                difficulty: q.difficulty
              })}
            >
              {`${formatClassName(q.class_name)} | ${formatDifficulty(q.difficulty)}`}
            </option>
          ))}
        </select>
      </div>
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


      {/* ------------ Generate Button ------------ */}
      <button
        onClick={handleGenerateExam}
        disabled={loading}
        style={{
          padding: "10px 18px",
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>

      {/* ------------ Display Generated Exam ------------ */}
      {generatedExam && (
        <div style={{ marginTop: "30px" }}>
          <h3>Generated Exam</h3>

          <p>
            <strong>Total Questions:</strong> {generatedExam.total_questions}
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
