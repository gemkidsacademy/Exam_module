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
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedClassYear, setSelectedClassYear] = useState("");

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  /* ---------------------------
     LOAD QUIZ CONFIGS
  --------------------------- */
  useEffect(() => {
  const load = async () => {
    try {
      // ✅ Guard (optional but recommended)
      if (!selectedClassYear) {
        console.log("⏸ Waiting for class year...");
        return;
      }

      const params = new URLSearchParams({
        class_year: selectedClassYear, // ✅ ADD THIS
      });

      const url = `${BACKEND_URL}/api/quizzes-reading?${params.toString()}`;

      console.log("🚀 FETCH QUIZZES URL:", url);

      const res = await fetch(url);

      if (!res.ok) throw new Error("Failed to load quizzes");

      const data = await res.json();

      console.log("📦 QUIZZES RESPONSE:", data);

      setQuizzes(data);

      if (data.length > 0) {
        const latest = data[data.length - 1];
        setSelectedQuiz(latest);
        setSelectedClass(latest.class_name);
        setSelectedDifficulty(latest.difficulty);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load quizzes.");
    }
  };

  load();
}, [selectedClassYear]); // ✅ IMPORTANT dependency

  const handleGenerateHomeworkExam = async () => {
  if (!selectedClass || !selectedDifficulty || !selectedClassYear) {
    alert("Please select class, difficulty, and class year.");
    return;
  }

  setLoading(true);
  setError("");
  setSuccessMessage("");
  setGeneratedExam(null);

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/exams/generate-reading-homework`, // ✅ NEW ENDPOINT
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_name: selectedClass,
          class_year: selectedClassYear, // ✅ KEY
          difficulty: selectedDifficulty
        })
      }
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || "Homework generation failed");
    }

    setGeneratedExam(data);
    setSuccessMessage("Homework exam created successfully.");

  } catch (err) {
    console.error(err);
    setError("Failed to generate homework exam.");
  } finally {
    setLoading(false);
  }
};
  /* ---------------------------
     GENERATE EXAM
  --------------------------- */
  const handleGenerateExam = async () => {
  console.log("\n================ GENERATE EXAM DEBUG =================");

  console.log("📦 selectedClass:", selectedClass);
  console.log("📦 selectedDifficulty:", selectedDifficulty);
  console.log("📦 selectedClassYear:", selectedClassYear);

  if (!selectedClass || !selectedDifficulty || !selectedClassYear) {
    console.log("❌ Missing required fields");
    alert("Please select class, difficulty, and class year.");
    return;
  }

  // Reset UI before request
  setLoading(true);
  setError("");
  setSuccessMessage("");
  setGeneratedExam(null);

  try {
    const payload = {
      class_name: selectedClass,
      class_year: selectedClassYear, // ✅ ADDED
      difficulty: selectedDifficulty
    };

    console.log("🚀 REQUEST PAYLOAD:", payload);

    const res = await fetch(
      `${BACKEND_URL}/api/exams/generate-reading`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    console.log("📡 RESPONSE STATUS:", res.status);

    const data = await res.json();

    console.log("📦 RESPONSE DATA:", data);

    if (!res.ok) {
      console.log("❌ API ERROR:", data);
      throw new Error(data.detail || "Exam generation failed");
    }

    // ✅ success only AFTER backend response
    setGeneratedExam(data);
    setSuccessMessage("Exam created successfully.");

    console.log("✅ EXAM GENERATED SUCCESSFULLY");

  } catch (err) {
    console.error("💥 GENERATE EXAM ERROR:", err);
    setError("Failed to generate exam. Check console for details.");
  } finally {
    setLoading(false);
    console.log("================ END GENERATE EXAM =================\n");
  }
};

  /* ---------------------------
     UI
  --------------------------- */
  return (
    <div className="generate-reading-container">
      
      {error && <p className="error-text">{error}</p>}
      {successMessage && <p className="success-text">{successMessage}</p>}
      <label>Class Year:</label>
      <select
        value={selectedClassYear}
        onChange={(e) => setSelectedClassYear(e.target.value)}
      >
        <option value="">Select Year</option>
        <option value="Year 4">Year 4</option>
        <option value="Year 5">Year 5</option>
        <option value="Year 6">Year 6</option>
      </select>

      <h2>Generate Reading Exam</h2>
      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
  
      {/* Exam */}
      <button
        className="primary-btn"
        onClick={handleGenerateExam}
        disabled={loading || !selectedClass || !selectedDifficulty}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>

      {/* Homework */}
      <button
        className="primary-btn"
        onClick={handleGenerateHomeworkExam}
        disabled={
          loading ||
          !selectedClass ||
          !selectedDifficulty ||
          !selectedClassYear
        }
      >
        {loading ? "Generating..." : "Generate Exam (Homework)"}
      </button>

    </div>

      {/* Optional: keep preview logic if backend returns exam */}
      {generatedExam && (
        <div className="generated-output">
          <p><strong>Exam ID:</strong> {generatedExam.generated_exam_id}</p>
        </div>
      )}
    </div>
  );
}
