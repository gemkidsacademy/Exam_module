import React, { useState, useEffect } from "react";

export default function GenerateExam_reading() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [error, setError] = useState("");

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  // ---------------------------
  // Formatting Helpers
  // ---------------------------
  const formatClassName = (cls) => {
    const map = {
      year1: "Year 1",
      year2: "Year 2",
      year3: "Year 3",
      year4: "Year 4",
      year5: "Year 5",
      year6: "Year 6",
      selective: "Selective",
      kindergarten: "Kindergarten"
    };
    return map[cls] || cls;
  };

  const formatDifficulty = (lvl) => {
    const map = {
      easy: "Easy",
      medium: "Medium",
      hard: "Hard"
    };
    return map[lvl] || lvl;
  };

  // ---------------------------
  // LOAD QUIZ CONFIGS
  // ---------------------------
  useEffect(() => {
    const loadQuizzes = async () => {
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

    loadQuizzes();
  }, []);

  // ---------------------------
  // GENERATE EXAM
  // ---------------------------
  const handleGenerateExam = async () => {
    if (!selectedQuiz) {
      alert("Please select a quiz requirement.");
      return;
    }

    const payload = {
      class_name: selectedQuiz.class_name,
      difficulty: selectedQuiz.difficulty
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
        setLoading(false);
        return;
      }

      setGeneratedExam(data.exam_json);
    } catch (err) {
      console.error("❌ Network error:", err);
      setError("Network error while generating exam.");
    }

    setLoading(false);
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div style={{ padding: "20px", maxWidth: "900px" }}>
      <h2>Generate Reading Exam</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ---------------- Quiz Selector ---------------- */}
      <div style={{ marginBottom: "20px" }}>
        <label><strong>Select Quiz Requirement</strong></label>

        <select
          value={selectedQuiz ? selectedQuiz.id : ""}
          onChange={(e) => {
            const quiz = quizzes.find(q => String(q.id) === e.target.value);
            setSelectedQuiz(quiz || null);
          }}
          style={{
            padding: "8px",
            minWidth: "300px",
            display: "block",
            marginTop: "10px"
          }}
        >
          <option value="">-- Select Quiz Requirement --</option>

          {quizzes.map((q) => (
            <option key={q.id} value={q.id}>
              {`${formatClassName(q.class_name)} | ${formatDifficulty(q.difficulty)}`}
            </option>
          ))}
        </select>
      </div>

      {/* ---------------- Read-only Topics ---------------- */}
      {selectedQuiz?.topics && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px",
            border: "1px solid #ddd",
            backgroundColor: "#f9f9f9"
          }}
        >
          <strong>Included Topics</strong>
          <ul style={{ marginTop: "8px" }}>
            {selectedQuiz.topics.map((t, idx) => (
              <li key={idx}>
                {t.name} ({t.num_questions} questions)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ---------------- Generate Button ---------------- */}
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

      {/* ---------------- Generated Exam Preview ---------------- */}
      {generatedExam && (
        <div style={{ marginTop: "30px" }}>
          <h3>Generated Exam Preview</h3>

          <p>
            <strong>Total Questions:</strong> {generatedExam.total_questions}
          </p>

          {generatedExam.questions?.map((q, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "16px",
                padding: "12px",
                border: "1px solid #ccc",
                background: "#fff"
              }}
            >
              <strong>Q{idx + 1}:</strong> {q.question_text}
              <p>
                <strong>Correct Answer:</strong> {q.correct_answer}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
