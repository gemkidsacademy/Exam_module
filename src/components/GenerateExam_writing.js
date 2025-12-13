import React, { useState, useEffect } from "react";

export default function GenerateExam_writing() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");

  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [error, setError] = useState("");

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  /* ---------------------------
     Formatting Helpers
  --------------------------- */
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

  /* ---------------------------
     LOAD WRITING QUIZ CONFIGS
  --------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/get-quizzes-writing`);
        if (!res.ok) throw new Error("Failed to load writing quizzes");

        const data = await res.json();
        console.log("📦 Loaded writing quizzes:", data);

        // We only keep class + difficulty here
        const filtered = data.map((q) => ({
          class_name: q.class_name,
          difficulty: q.difficulty
        }));

        setQuizzes(filtered);
      } catch (err) {
        console.error("❌ Error loading writing quizzes:", err);
        setError("Failed to load writing quizzes.");
      }
    };

    load();
  }, []);

  /* ---------------------------
     GENERATE WRITING EXAM
  --------------------------- */
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
      const res = await fetch(
        `${BACKEND_URL}/api/exams/generate-writing`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();
      console.log("📥 Response JSON:", data);

      if (!res.ok) {
        setError(data.detail || "Failed to generate writing exam.");
        alert("❌ Error: " + (data.detail || "Failed to generate writing exam."));
        setLoading(false);
        return;
      }

      setGeneratedExam(data);
      alert("✅ Writing exam generated successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Network error while generating writing exam.");
      setError("Network error");
    }

    setLoading(false);
  };

  /* ---------------------------
     UI
  --------------------------- */
  return (
    <div style={{ padding: "20px" }}>
      <h2>Generate Writing Exam</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "20px" }}>
        <label>Select Writing Configuration:</label>

        <select
          value={selectedQuiz ? JSON.stringify(selectedQuiz) : ""}
          onChange={(e) => {
            const parsed = JSON.parse(e.target.value);

            console.log("📘 Class:", parsed.class_name);
            console.log("📙 Difficulty:", parsed.difficulty);

            setSelectedQuiz(parsed);
            setSelectedClass(parsed.class_name);
            setSelectedDifficulty(parsed.difficulty);
          }}
          style={{
            padding: "8px",
            minWidth: "300px",
            display: "block",
            marginTop: "10px"
          }}
        >
          <option value="">-- Select Writing Quiz --</option>

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

      {/* ------------ Generate Button ------------ */}
      <button
        onClick={handleGenerateExam}
        disabled={loading}
        style={{
          padding: "10px 18px",
          backgroundColor: "#673ab7",
          color: "white",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Generating..." : "Generate Writing Exam"}
      </button>

      {/* ------------ Preview Generated Writing Exam ------------ */}
      {generatedExam && (
        <div style={{ marginTop: "30px" }}>
          <h3>Generated Writing Prompt</h3>

          <p>
            <strong>Class:</strong> {generatedExam.class_name}
          </p>

          <p>
            <strong>Difficulty:</strong> {generatedExam.difficulty}
          </p>

          <div
            style={{
              padding: "15px",
              border: "1px solid #ccc",
              background: "#fafafa",
              whiteSpace: "pre-wrap"
            }}
          >
            {generatedExam.question_text}
          </div>
        </div>
      )}
    </div>
  );
}
