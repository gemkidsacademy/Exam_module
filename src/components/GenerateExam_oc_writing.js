import React, { useState } from "react";
import "./GenerateExam.css";

export default function GenerateExam_oc_writing({
  mode,
  centerCode,
}) {
  const API_BASE = process.env.REACT_APP_API_URL;

  const [classYear, setClassYear] = useState("");
  const [quizSetup, setQuizSetup] = useState(null);
  
  const [homeworkSetup, setHomeworkSetup] = useState(null);
  const [loading, setLoading] = useState(false);
  const fetchHomeworkQuizSetup = async (selectedYear) => {
  try {
    const response = await fetch(
      `${API_BASE}/api/quizzes-oc-writing-homework?class_year=${encodeURIComponent(
        selectedYear
      )}&center_code=${encodeURIComponent(centerCode)}`
    );

    if (response.status === 404) {
      setHomeworkSetup(null);
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to load homework quiz setup");
    }

    const data = await response.json();

    console.log("Homework Quiz Setup:", data);

    setHomeworkSetup(data);

  } catch (error) {
    console.error("Error loading homework quiz setup:", error);
    setHomeworkSetup(null);
  }
};
  const fetchQuizSetup = async (selectedYear) => {
  try {
    const response = await fetch(
      `${API_BASE}/api/quizzes-writing/oc?class_year=${encodeURIComponent(
        selectedYear
      )}&center_code=${encodeURIComponent(centerCode)}`
    );

    if (response.status === 404) {
      setQuizSetup(null);
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to load quiz setup");
    }

    const data = await response.json();

    console.log("Quiz Setup:", data);

    setQuizSetup(data);

  } catch (error) {
    console.error("Error loading quiz setup:", error);
    setQuizSetup(null);
  }
};

  const handleGenerateExam = async () => {
    if (!classYear) {
      alert("Please select a class year.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        class_name: "OC",
        class_year: classYear,
        center_code: centerCode,
        mode: mode,
      };

      const response = await fetch(
        `${API_BASE}/api/exams/generate-oc-writing`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate exam.");
      }

      alert("✅ OC Writing exam generated successfully!");

    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to generate exam.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHomework = async () => {
    if (!classYear) {
      alert("Please select a class year.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        class_name: "OC",
        class_year: classYear,
        center_code: centerCode,
        mode: mode,
      };

      const response = await fetch(
        `${API_BASE}/api/exams/generate-oc-writing-homework`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate homework.");
      }

      alert("✅ OC Writing homework generated successfully!");

    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to generate homework.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generate-exam-container">

      <div className="form-group">
        <label>Class Year:</label>

        <select
          className="form-control"
          value={classYear}
          onChange={(e) => {
            const year = e.target.value;

            setClassYear(year);
            fetchQuizSetup(year);
            fetchHomeworkQuizSetup(year);
          }}
        >
          <option value="">Select Year</option>
          <option value="Kindergarten">Kindergarten</option>
          <option value="2">Year 2</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
          <option value="5">Year 5</option>
          <option value="6">Year 6</option>
          <option value="7">Year 7</option>
          <option value="8">Year 8</option>
          <option value="9">Year 9</option>
        </select>
      </div>

      <h2 style={{ marginTop: "35px", marginBottom: "30px" }}>
        Generate Writing Exam
      </h2>

      <button
        className="dashboard-button"
        onClick={handleGenerateExam}
        disabled={loading}
        style={{ marginBottom: "20px" }}
      >
        {loading ? "Generating..." : "Generate Writing Exam"}
      </button>

      <button
        className="dashboard-button"
        onClick={handleGenerateHomework}
        disabled={loading}
        style={{
          background: "#635BFF",
        }}
      >
        {loading
          ? "Generating..."
          : "Generate Writing Exam (Homework)"}
      </button>

    </div>
  );
}