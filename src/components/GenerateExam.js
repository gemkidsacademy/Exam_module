import React, { useState, useEffect } from "react";
import "./generateexam_MR.css";


const BACKEND_URL = process.env.REACT_APP_API_URL;

export default function GenerateExam({ mode }) {
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [error, setError] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  

useEffect(() => {
  const fetchDates = async () => {
    try {
      if (!selectedYear || mode !== "latest") return;

      const parsedYear = extractYearNumber(selectedYear);

      const params = new URLSearchParams({
        class_year: `Year ${parsedYear}`,
      });

      const url = `${BACKEND_URL}/api/available-MR-dates?${params.toString()}`;

      console.log("📅 FETCH THINKING DATES:", url);

      const res = await fetch(url);

      if (!res.ok) throw new Error("Failed to load dates");

      const data = await res.json();

      console.log("📅 DATES RESPONSE:", data);

      setAvailableDates(data);

      if (data.length > 0) {
        setSelectedDate(data[0]); // auto select latest
      }

    } catch (err) {
      console.error(err);
      setError("Failed to load dates.");
    }
  };

  fetchDates();
}, [selectedYear, mode]);

  const renderText = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") return value.content ?? "";
    return String(value);
  };

  /* -------------------------------------------
     GENERATE NORMAL EXAM
  ------------------------------------------- */
  const extractYearNumber = (val) => {
  if (!val) return null;
  const num = val.replace(/\D/g, ""); // remove non-digits
  return num ? Number(num) : null;
};

const handleGenerateExam = async () => {
  if (!selectedYear) {
    setError("Please select a class year first");
    return;
  }
  if (mode === "latest" && !selectedDate) {
    setError("Please select a date.");
    return;
  }

  const parsedYear = extractYearNumber(selectedYear);

  if (!parsedYear) {
    setError("Invalid year format");
    return;
  }

  setLoading(true);
  setError("");
  setGeneratedExam(null);

  try {
    console.log("Sending class_year:", parsedYear, typeof parsedYear);

    // ✅ decide endpoint based on mode
    const endpoint =
      mode === "latest"
        ? "/generate-new-mr-latest"
        : "/generate-new-mr";

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        difficulty: "medium",
        class_year: parsedYear,
        ...(mode === "latest" && { date: selectedDate })
      })
    });

    const data = await response.json();
    console.log("Diagnostic response:", data);

    if (!response.ok) {
      throw new Error(data?.detail || "Failed to generate exam");
    }

    setGeneratedExam(data);
  } catch (err) {
    console.error("Exam generation failed:", err);
    setError(err.message || "Unexpected error occurred");
  } finally {
    setLoading(false);
  }
};
  /* -------------------------------------------
     GENERATE HOMEWORK EXAM
  ------------------------------------------- */
  const handleGenerateHomeworkExam = async () => {
  if (!selectedYear) {
    setError("Please select a class year first");
    return;
  }
  if (mode === "latest" && !selectedDate) {
    setError("Please select a date.");
    return;
  }

  const parsedYear = extractYearNumber(selectedYear);

  if (!parsedYear) {
    setError("Invalid year format");
    return;
  }

  setLoading(true);
  setError("");
  setGeneratedExam(null);

  try {
    console.log("Sending class_year:", parsedYear, typeof parsedYear);

    // ✅ decide endpoint based on mode
    const endpoint =
      mode === "latest"
        ? "/generate-new-mr-homework-latest"
        : "/generate-new-mr-homework";

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        difficulty: "medium",
        class_year: parsedYear,
        ...(mode === "latest" && { date: selectedDate })
      })
    });

    const data = await response.json();
    console.log("Diagnostic response:", data);

    if (!response.ok) {
      throw new Error(data?.detail || "Failed to generate exam");
    }

    setGeneratedExam(data);
  } catch (err) {
    console.error("Exam generation failed:", err);
    setError(err.message || "Unexpected error occurred");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="generate-exam-container">
      <h2>Generate Mathematical Reasoning Exam</h2>

      {error && <div className="error-text">{error}</div>}

      {/* YEAR DROPDOWN */}
      <label style={{ marginTop: "10px", display: "block" }}>
        Select Year:
      </label>

      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          marginTop: "5px",
          marginBottom: "15px"
        }}
      >
        <option value="">-- Select Year --</option>
        <option value="Year 3">Year 3</option>
        <option value="Year 4">Year 4</option>
        <option value="Year 5">Year 5</option>
        <option value="Year 6">Year 6</option>
      </select>
      {mode === "latest" && (
      <>
        <label>Select Date:</label>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "15px"
          }}
        >
          <option value="">-- Select Date --</option>

          {availableDates.map((date, index) => (
            <option key={index} value={date}>
              {date}
            </option>
          ))}
        </select>
      </>
    )}

      {/* NORMAL EXAM BUTTON */}
      <button
        className="primary-btn"
        onClick={handleGenerateExam}
        disabled={loading || !selectedYear}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>

      {/* HOMEWORK BUTTON */}
      <button
        className="primary-btn"
        style={{ marginTop: "10px", backgroundColor: "#4caf50" }}
        onClick={handleGenerateHomeworkExam}
        disabled={loading || !selectedYear}
      >
        {loading ? "Generating..." : "Generate Exam (Homework)"}
      </button>

      {generatedExam && (
        <div className="generated-output">
          <h3>Generated Exam Preview</h3>

          <p>
            <strong>Exam ID:</strong> {generatedExam.exam_id}
          </p>
          <p>
            <strong>Quiz ID:</strong> {generatedExam.quiz_id}
          </p>

          {generatedExam.questions?.length > 0 ? (
            <div className="questions-preview">
              {generatedExam.questions.map((question) => (
                <div key={question.q_id} className="question-card">
                  <strong>Q{question.q_id}.</strong>{" "}
                  {question.question_blocks?.map((block, i) => (
                    <p key={i}>{renderText(block)}</p>
                  ))}

                  <ul>
                    {Array.isArray(question.options)
                      ? question.options.map((option, index) => (
                          <li key={index}>
                            {renderText(option)}
                          </li>
                        ))
                      : Object.entries(question.options || {}).map(
                          ([key, value]) => (
                            <li key={key}>
                              <strong>{key}.</strong>{" "}
                              {renderText(value)}
                            </li>
                          )
                        )}
                  </ul>

                  <div className="correct-answer">
                    Correct Answer: {renderText(question.correct)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No questions found.</p>
          )}
        </div>
      )}
    </div>
  );
}