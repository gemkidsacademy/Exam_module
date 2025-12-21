import React, { useState, useEffect } from "react";
import "./generateexam_reading.css";

export default function GenerateExam_reading() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
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

  /* ---------------------------
     LOAD QUIZ CONFIGS
  --------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/quizzes-reading`);
        if (!res.ok) throw new Error("Failed to load quizzes");
        const data = await res.json();
        setQuizzes(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load quizzes.");
      }
    };

    load();
  }, []);

  /* ---------------------------
     GENERATE EXAM
  --------------------------- */
  const handleGenerateExam = async () => {
    if (!selectedClass || !selectedDifficulty) {
      alert("Please select class and difficulty");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedExam(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/exams/generate-reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_name: selectedClass,
          difficulty: selectedDifficulty
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Failed to generate exam.");
        return;
      }

      setGeneratedExam(data);
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------
     UI
  --------------------------- */
  return (
    <div className="generate-reading-container">
      <h2>Generate Reading Exam</h2>

      {error && <p className="error-text">{error}</p>}

      <div className="form-group">
        <label>Select Quiz</label>
        <select
          value={selectedQuiz ? JSON.stringify(selectedQuiz) : ""}
          onChange={(e) => {
            const parsed = JSON.parse(e.target.value);
            setSelectedQuiz(parsed);
            setSelectedClass(parsed.class_name);
            setSelectedDifficulty(parsed.difficulty);
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

      {selectedQuiz?.topics && (
        <div className="topics-preview">
          <strong>Included Topics:</strong>
          <ul>
            {selectedQuiz.topics.map((t, idx) => (
              <li key={idx}>
                {t.name} ({t.num_questions} questions)
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        className="primary-btn"
        onClick={handleGenerateExam}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>

      {generatedExam && (
        <div className="generated-exam">
          <h3>Generated Exam</h3>

          <p>
            <strong>Total Questions:</strong>{" "}
            {generatedExam.total_questions}
          </p>

          {generatedExam.questions?.map((q, idx) => (
            <div key={idx} className="question-card">
              <strong>Q{idx + 1}:</strong> {q.question}
              <p>
                <strong>Correct:</strong> {q.correct}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
