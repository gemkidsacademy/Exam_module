import React, { useState, useEffect } from "react";


const BACKEND_URL = process.env.REACT_APP_API_URL;

const GenerateExamNaplanNumeracy = ({ mode }) => {
  const [loading, setLoading] = useState(false);
  const [yearsLoading, setYearsLoading] = useState(true);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const [classYears, setClassYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
  if (!selectedYear || mode !== "latest") return;

  const fetchAvailableDates = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/naplan/numeracy/dates/${selectedYear}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to fetch dates"
        );
      }

      setAvailableDates(data.dates || []);

      // Auto select latest date
      if (data.dates?.length > 0) {
        setSelectedDate(data.dates[0]);
      }

    } catch (err) {
      console.error("Date fetch error:", err);

      setError(
        err.message || "Failed to load available dates"
      );
    }
  };

  fetchAvailableDates();
}, [selectedYear, mode]);

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

    if (!selectedYear) {
      setError("Please select a year first.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    setGeneratedExam(null);

    const endpoint =
      mode === "latest"
        ? "/naplan/numeracy/generate-homework-latest"
        : "/naplan/numeracy/generate-homework";

    const payload = {
      class_year: selectedYear,

      ...(mode === "latest" && {
        selected_date: selectedDate,
      }),
    };

    console.log("Homework payload:", payload);

    const response = await fetch(
      `${BACKEND_URL}${endpoint}`,
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
      throw new Error(
        data.detail?.[0]?.msg ||
        data.detail ||
        "Failed to generate homework exam."
      );
    }

    console.log("Homework exam response:", data);

    setGeneratedExam(data);

    setMessage(
      `✅ Homework exam generated successfully for Year ${selectedYear}`
    );

  } catch (error) {
    console.error("Homework generation error:", error);

    setError(
      error.message ||
      "Something went wrong while generating homework exam."
    );
  } finally {
    setLoading(false);
  }
};
  const handleGenerate = async () => {
  try {
    if (loading || yearsLoading) return;

    if (!selectedYear) {
      setError("Please select a class year first.");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);
    setGeneratedExam(null);

    const endpoint =
      mode === "latest"
        ? "/naplan/numeracy/generate-exam-latest"
        : "/naplan/numeracy/generate-exam";

    const payload = {
      class_year: selectedYear,

      ...(mode === "latest" && {
        selected_date: selectedDate,
      }),
    };

    console.log("Generate exam payload:", payload);

    const response = await fetch(
      `${BACKEND_URL}${endpoint}`,
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
      throw new Error(
        data.detail?.[0]?.msg ||
        data.detail ||
        "Failed to generate exam"
      );
    }

    console.log("Generate exam response:", data);

    setGeneratedExam(data);

    setMessage(
      `✅ Exam generated successfully for Year ${selectedYear}`
    );

  } catch (err) {
    console.error("Generate exam error:", err);

    setError(
      err.message || "Something went wrong"
    );
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
      {mode === "latest" && availableDates.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <label>Select Upload Date</label>

          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "6px",
            }}
          >
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>
      )}

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
        <p style={{ color: "green", marginTop: "14px" }}>
          {message}
        </p>
      )}

      {error && (
        <p style={{ color: "red", marginTop: "14px" }}>
          {error}
        </p>
      )}

      {generatedExam?.questions?.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>Generated Exam</h3>

          <p>
            <strong>Total Questions:</strong>{" "}
            {generatedExam.questions.length}
          </p>

          {generatedExam.questions.map((question, index) => (
            <div
              key={question.id || index}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "20px",
                background: "#fafafa",
              }}
            >
              <div style={{ marginBottom: "10px" }}>
                <strong>
                  Question {index + 1}
                </strong>
              </div>

              {/* Topic + Difficulty */}
              <div style={{ marginBottom: "10px" }}>
                <strong>Topic:</strong> {question.topic}
                <br />

                <strong>Difficulty:</strong>{" "}
                {question.difficulty}
              </div>

              {/* Question Text */}
              {question.question_text && (
                <div style={{ marginBottom: "14px" }}>
                  {question.question_text}
                </div>
              )}

              {/* Question Blocks */}
              {question.question_blocks?.map((block, blockIndex) => (
                <div
                  key={blockIndex}
                  style={{ marginBottom: "10px" }}
                >
                  {block.type === "text" && (
                    <p>{block.content}</p>
                  )}

                  {block.type === "image" && (
                    <img
                      src={block.content}
                      alt="question"
                      style={{
                        maxWidth: "100%",
                        borderRadius: "6px",
                      }}
                    />
                  )}
                </div>
              ))}

              {/* Options */}
              {question.options && (
                <div style={{ marginTop: "12px" }}>
                  {Object.entries(question.options).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        style={{
                          padding: "6px 0",
                        }}
                      >
                        <strong>{key}.</strong> {value}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Correct Answer */}
              <div
                style={{
                  marginTop: "14px",
                  color: "green",
                  fontWeight: "bold",
                }}
              >
                Correct Answer:{" "}
                {Array.isArray(question.correct_answer)
                  ? question.correct_answer.join(", ")
                  : question.correct_answer}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

  );
};

export default GenerateExamNaplanNumeracy;
