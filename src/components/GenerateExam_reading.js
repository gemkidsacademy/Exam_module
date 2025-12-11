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

const formatSubject = (subj) => {
  switch (subj) {
    case "thinking_skills": return "Thinking Skills";
    case "mathematical_reasoning": return "Math Reasoning";
    case "reading": return "Reading";
    case "writing": return "Writing";
    default: return subj;
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


  // Fetch quiz setups from backend
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/quizzes`);
        if (!res.ok) throw new Error("Failed to load quizzes");
        const data = await res.json();
        setQuizzes(data);
      } catch (err) {
        console.error(err);
        setError("Error loading quizzes from backend.");
      }
    };

    fetchQuizzes();
  }, []);

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
        `${BACKEND_URL}/api/exams/generate/${selectedQuiz}`,
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

  return (
    <div style={{ padding: "20px" }}>
      <h2>Generate Exam</h2>

      {/* Error message */}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* Quiz selection dropdown */}
      <div style={{ margin: "10px 0" }}>
        <label style={{ marginRight: "10px" }}>Select Quiz:</label>
        <select
          value={selectedQuiz}
          onChange={(e) => setSelectedQuiz(e.target.value)}
          style={{ padding: "6px", minWidth: "280px" }}
        >
          <option value="">-- Select Quiz Requirement --</option>
        
          {quizzes.map((q) => (
            <option key={q.id} value={q.id}>
              {`${formatClassName(q.class_name)} | ${formatSubject(q.subject)} | ${formatDifficulty(q.difficulty)}`}
            </option>
          ))}
        </select>
      </div>

      {/* Generate button */}
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

      {/* Show generated exam preview */}
      {generatedExam && (
        <div style={{ marginTop: "30px" }}>
          <h3>Generated Exam Preview</h3>
          <p>
            <strong>Exam ID:</strong> {generatedExam.exam_id}
          </p>
          <p>
            <strong>Quiz ID:</strong> {generatedExam.quiz_id}
          </p>

          {generatedExam.questions && generatedExam.questions.length > 0 ? (
            <div style={{ marginTop: "20px" }}>
              {generatedExam.questions.map((q) => (
                <div
                  key={q.q_id}
                  style={{
                    marginBottom: "20px",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                  }}
                >
                  <strong>Q{q.q_id}.</strong> {q.question}
                  <ul>
                    {Object.entries(q.options).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}.</strong> {value}
                      </li>
                    ))}
                  </ul>
                  <p>
                    <strong>Correct Answer:</strong> {q.correct}
                  </p>
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
