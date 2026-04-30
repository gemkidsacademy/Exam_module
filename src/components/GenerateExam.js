import React, { useState } from "react";
import "./generateexam_MR.css";


const BACKEND_URL = process.env.REACT_APP_API_URL;

export default function GenerateExam() {
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [error, setError] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

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

    const response = await fetch(
      `${BACKEND_URL}/generate-new-mr`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty: "medium",
          class_year: parsedYear   // ✅ FIXED
        })
      }
    );

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
      alert("Please select a class year.");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedExam(null);

    try {
      const response = await fetch(
        `${BACKEND_URL}/generate-new-mr-homework`, // 👈 separate endpoint
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            difficulty: "medium",
            class_year: selectedYear
          })
        }
      );

      const data = await response.json();
      console.log("Homework response:", data);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to generate homework exam");
      }

      setGeneratedExam(data);
      alert("✅ Homework exam generated!");

    } catch (err) {
      console.error("Homework generation failed:", err);
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