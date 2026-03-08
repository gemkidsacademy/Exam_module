import React, { useState, useEffect } from "react";

const GenerateExamNaplanNumeracy = () => {
  const [loading, setLoading] = useState(false);
  const [yearsLoading, setYearsLoading] = useState(true);

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
        "https://web-production-481a5.up.railway.app/naplan/numeracy/class-years"
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
        "https://web-production-481a5.up.railway.app/naplan/numeracy/generate-exam",
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
