import React, { useState, useEffect } from "react";


const BACKEND_URL = process.env.REACT_APP_API_URL;

const GenerateExamNaplanNumeracy = () => {
  const [loading, setLoading] = useState(false);
  const [yearsLoading, setYearsLoading] = useState(true);
  const [generatedExam, setGeneratedExam] = useState(null);

  const [classYears, setClassYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // ---------------------------------------
  // Fetch available class years
  // ---------------------------------------
  const fetchClassYears = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/naplan/numeracy/class-years`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch class years");
      }

      setClassYears(data.class_years || []);
    } catch (err) {
      setError(err.message || "Failed to load class years");
    } finally {
      setYearsLoading(false);
    }
  };

  useEffect(() => {
    fetchClassYears();
  }, []);

  // ---------------------------------------
  // Generate exam
  // ---------------------------------------
  const handleGenerateHomeWork = async () => {
  try {
    if (loading || yearsLoading) return;

    setLoading(true);

    if (!selectedYear) {
      alert("Please select a year first.");
      return;
    }

    const response = await fetch(
      `${BACKEND_URL}/naplan/numeracy/generate-homework`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class_year: selectedYear
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to generate homework exam."
      );
    }

    console.log("Homework exam response:", data);

    setGeneratedExam(data);

    alert("Homework exam generated successfully!");

  } catch (error) {
    console.error("Homework generation error:", error);

    alert(
      error.message ||
      "Something went wrong while generating homework exam."
    );
  } finally {
    setLoading(false);
  }
};
  const handleGenerate = async () => {
    if (!selectedYear) {
      setError("Please select a class year first.");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(
        `${BACKEND_URL}/naplan/numeracy/generate-exam`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            class_year: selectedYear,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate exam");
      }

      setMessage(
        `✅ Exam generated successfully for Year ${selectedYear} (${data.total_questions} questions)`
      );
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "0 auto" }}>
      <h3>Generate NAPLAN Numeracy Exam</h3>

      {/* Class Year Dropdown */}
      <div style={{ marginBottom: "12px" }}>
        <label>Select Class Year</label>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginTop: "6px",
          }}
          disabled={yearsLoading}
        >
          <option value="">-- Select Year --</option>

          {classYears.map((year) => (
            <option key={year} value={year}>
              Year {year}
            </option>
          ))}
        </select>
      </div>

      {/* Generate Button */}
      <button
        className="dashboard-button"
        onClick={handleGenerate}
        disabled={loading || yearsLoading}
        style={{ width: "100%" }}
      >
        {loading ? "Generating Exam..." : "Generate Exam"}
      </button>
      {/* Generate HOMEWORK Button */}
      <button
        className="dashboard-button"
        onClick={handleGenerateHomeWork}
        disabled={loading || yearsLoading}
        style={{ width: "100%" }}
      >
        {loading ? "Generating Exam..." : "Generate Exam(homework)"}
      </button>
      

      {message && (
        <p style={{ color: "green", marginTop: "14px" }}>{message}</p>
      )}

      {error && (
        <p style={{ color: "red", marginTop: "14px" }}>{error}</p>
      )}
    </div>
  );
};

export default GenerateExamNaplanNumeracy;
