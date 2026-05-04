import React, { useState, useEffect } from "react";

const BACKEND_URL = process.env.REACT_APP_API_URL;

const GenerateExam_naplan_language_conventions = () => {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  const [loadingYears, setLoadingYears] = useState(true);
  const [loadingExam, setLoadingExam] = useState(false);

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  /* ----------------------------------------------------
     Fetch available years from backend
  ---------------------------------------------------- */
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/naplan/language-conventions/available-years`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to load years");
        }

        setYears(data.years);

        if (data.years.length > 0) {
          setSelectedYear(data.years[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingYears(false);
      }
    };

    fetchYears();
  }, []);

  /* ----------------------------------------------------
     Generate exam
  ---------------------------------------------------- */
  const handleGenerateHomeWork = async () => {
  if (!selectedYear) {
    setError("Please select a year");
    return;
  }

  setLoadingExam(true);
  setMessage(null);
  setError(null);

  try {
    const response = await fetch(
      `${BACKEND_URL}/naplan/language-conventions/generate-homework`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year: selectedYear,
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
      `✅ Homework exam generated successfully (Year: ${selectedYear}, Exam ID: ${data.exam_id}, ${data.total_questions} questions)`
    );

  } catch (err) {
    setError(err.message);

  } finally {
    setLoadingExam(false);
  }
};
  const handleGenerate = async () => {
    if (!selectedYear) {
      setError("Please select a year");
      return;
    }

    setLoadingExam(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(
        `${BACKEND_URL}/naplan/language-conventions/generate-exam`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            year: selectedYear,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate exam");
      }

      setMessage(
        `✅ Exam generated successfully (Year: ${selectedYear}, Exam ID: ${data.exam_id}, ${data.total_questions} questions)`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingExam(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h3>Generate NAPLAN Language Conventions Exam</h3>

      {/* YEAR DROPDOWN */}
      <div style={{ marginBottom: "12px" }}>
        <label>Select Year</label>

        {loadingYears ? (
          <p>Loading years...</p>
        ) : (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "6px"
            }}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* GENERATE BUTTON */}
      <button
        className="dashboard-button"
        onClick={handleGenerate}
        disabled={loadingExam || loadingYears}
        style={{ width: "100%" }}
      >
        {loadingExam ? "Generating..." : "Generate Exam"}
      </button>
      <button
        className="dashboard-button"
        onClick={handleGenerateHomeWork}
        disabled={loadingExam || loadingYears}
        style={{ width: "100%" }}
      >
        {loadingExam ? "Generating..." : "Generate Exam (home work)"}
      </button>

      {/* SUCCESS */}
      {message && (
        <p style={{ color: "green", marginTop: "12px" }}>
          {message}
        </p>
      )}

      {/* ERROR */}
      {error && (
        <p style={{ color: "red", marginTop: "12px" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default GenerateExam_naplan_language_conventions;
