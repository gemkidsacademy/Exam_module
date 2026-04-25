import React, { useState, useEffect } from "react";
const BACKEND_URL = "https://web-production-481a5.up.railway.app";
//const BACKEND_URL = "http://127.0.0.1:8000";

const GenerateExamNaplanReading = () => {
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // --------------------------------------
  // Fetch available exam years from backend
  // --------------------------------------
  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/naplan/reading/available-years`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to load available years");
        }

        setYears(data.years || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAvailableYears();
  }, []);

  // --------------------------------------
  // Generate exam
  // --------------------------------------
  const handleGenerate = async () => {
    if (!selectedYear) {
      setError("Please select a year first");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(
        `${BACKEND_URL}/naplan/reading/generate-exam`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            year: parseInt(selectedYear),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate exam");
      }

      setMessage(
        `✅ Year ${selectedYear} exam generated successfully (Exam ID: ${data.exam_id}, ${data.total_questions} questions)`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleGenerateHomeWork = async () => {
  if (!selectedYear) {
    setError("Please select a year first");
    return;
  }

  setLoading(true);
  setMessage(null);
  setError(null);

  try {
    const response = await fetch(
      `${BACKEND_URL}/naplan/reading/generate-homework`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year: parseInt(selectedYear),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail ||
        "Failed to generate homework exam"
      );
    }

    setMessage(
      `✅ Year ${selectedYear} homework exam generated successfully (Exam ID: ${data.exam_id}, ${data.total_questions} questions)`
    );

  } catch (err) {
    setError(err.message);

  } finally {
    setLoading(false);
  }
};
  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h3>Generate NAPLAN Reading Exam</h3>

      {/* Year selector */}
      <label>Class Year</label>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        style={{ width: "100%", marginBottom: "12px" }}
      >
        <option value="">Select Year</option>
        {years.map((year) => (
          <option key={year} value={year}>
            Year {year}
          </option>
        ))}
      </select>

      <button
        className="dashboard-button"
        onClick={handleGenerate}
        disabled={loading}
        style={{ width: "100%" }}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>
      <button
        className="dashboard-button"
        onClick={handleGenerateHomeWork}
        disabled={loading}
        style={{ width: "100%" }}
      >
        {loading ? "Generating..." : "Generate Exam(homework)"}
      </button>

      {message && (
        <p style={{ color: "green", marginTop: "12px" }}>{message}</p>
      )}

      {error && (
        <p style={{ color: "red", marginTop: "12px" }}>{error}</p>
      )}
    </div>
  );
};

export default GenerateExamNaplanReading;
