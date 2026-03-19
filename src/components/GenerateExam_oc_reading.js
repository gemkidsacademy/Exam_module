import React, { useState, useEffect } from "react";

const BACKEND_URL = "https://web-production-481a5.up.railway.app";

const GenerateExam_oc_reading = () => {
  const [className, setClassName] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* ---------------------------
     LOAD QUIZ CONFIGS
  --------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/quizzes-reading-oc`);
        if (!res.ok) throw new Error("Failed to load quizzes");

        const data = await res.json();

        if (data.length > 0) {
          const latest = data[data.length - 1];

          setClassName(latest.class_name);
          setDifficulty(latest.difficulty);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load quizzes.");
      }
    };

    load();
  }, []);

  const handleGenerateExam = async () => {
    if (!className || !difficulty) {
      setMessage("Config not loaded yet...");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${BACKEND_URL}/api/exams/generate-oc-reading`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            class_name: className,
            difficulty: difficulty,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ OC Reading Exam generated successfully");
      } else {
        setMessage(data.detail || "❌ Failed to generate exam");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Server error while generating exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2>Generate OC Reading Exam</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        className="dashboard-button"
        onClick={handleGenerateExam}
        disabled={loading || !className}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>

      {message && <p style={{ marginTop: "15px" }}>{message}</p>}
    </div>
  );
};

export default GenerateExam_oc_reading;
