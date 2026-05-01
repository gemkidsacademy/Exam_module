import React, { useState, useEffect } from "react";


const BACKEND_URL = process.env.REACT_APP_API_URL;
//const BACKEND_URL = "http://127.0.0.1:8000";


const GenerateExam_oc_reading = () => {
  const [className, setClassName] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [classYear, setClassYear] = useState("");

  
  const handleGenerateHomeworkExam = async () => {
  if (!classYear) {
    setMessage("Config not loaded yet or class year missing...");
    return;
  }

  try {
    setLoading(true);
    setMessage("");

    const response = await fetch(
      `${BACKEND_URL}/api/exams/generate-oc-reading-homework`, // ✅ NEW ENDPOINT
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class_year: classYear,
          class_name: "OC"
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      setMessage("✅ OC Reading Homework generated successfully");
    } else {
      setMessage(data.detail || "❌ Failed to generate homework");
    }
  } catch (error) {
    console.error(error);
    setMessage("❌ Server error while generating homework");
  } finally {
    setLoading(false);
  }
};
  const handleGenerateExam = async () => {
  if (!classYear) {
    setMessage("Config not loaded yet or class year missing...");
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
          class_year: classYear,
          class_name: "OC"
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
      <label>Class Year:</label>
      <select
        value={classYear}
        onChange={(e) => setClassYear(e.target.value)}
      >
        <option value="">Select</option>
        <option value="Year 3">Year 3</option>
        <option value="Year 4">Year 4</option>
      </select>
      <button
        className="dashboard-button"
        onClick={handleGenerateExam}
        disabled={loading || !classYear}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>
      <button
        className="dashboard-button"
        onClick={handleGenerateHomeworkExam}
        disabled={loading || !classYear}
      >
        {loading ? "Generating..." : "Generate Exam (Homework)"}
      </button>

      {message && <p style={{ marginTop: "15px" }}>{message}</p>}
    </div>
  );
};

export default GenerateExam_oc_reading;
