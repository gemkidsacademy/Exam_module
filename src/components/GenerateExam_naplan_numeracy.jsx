import React, { useEffect, useState } from "react";

const GenerateExam_naplan_numeracy = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [year, setYear] = useState("");
  const [availableYears, setAvailableYears] = useState([]);

  // --------------------------------------------------
  // Fetch available years from backend
  // --------------------------------------------------
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await fetch(
          "https://web-production-481a5.up.railway.app/api/naplan/numeracy/available-years"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to load available years");
        }

        setAvailableYears(data.years || []);
      } catch (err) {
        setError(err.message || "Unable to load years");
      }
    };

    fetchYears();
  }, []);

  // --------------------------------------------------
  // Generate exam
  // --------------------------------------------------
  const handleGenerate = async () => {
    if (!year) {
      setError("Please select a year before generating the exam");
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
            year: Number(year), // explicit admin intent
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate exam");
      }

      setMessage(
        `✅ Exam generated successfully for Year ${year} (${data.total_questions} questions)`
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

      {/* YEAR SELECT */}
      <label style={{ display: "block", marginBottom: 6 }}>
        Select Year
      </label>

      <select
        value={year}
        onChange={(e) => setYear(e.target.value)}
        disabled={loading || availableYears.length === 0}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "14px",
        }}
      >
        <option value="">-- Select Year --</option>
        {availableYears.map((y) => (
          <option key={y} value={y}>
            Year {y}
          </option>
        ))}
      </select>

      {/* GENERATE BUTTON */}
      <button
        className="dashboard-button"
        onClick={handleGenerate}
        disabled={loading || !year}
        style={{ width: "100%" }}
      >
        {loading ? "Generating Exam..." : "Generate Exam"}
      </button>

      {/* SUCCESS MESSAGE */}
      {message && (
        <p style={{ color: "green", marginTop: "14px" }}>{message}</p>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <p style={{ color: "red", marginTop: "14px" }}>{error}</p>
      )}

      {/* EMPTY STATE */}
      {availableYears.length === 0 && !error && (
        <p style={{ marginTop: "14px", color: "#666" }}>
          No exams available yet. Please create a quiz first.
        </p>
      )}
    </div>
  );
};

export default GenerateExam_naplan_numeracy;
