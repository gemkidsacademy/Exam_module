import React, { useEffect, useState } from "react";
import "./generate_exam.css";

const BACKEND_URL = process.env.REACT_APP_API_URL;

export default function GenerateExam_naplan_writing({
  mode,
  centerCode,
}) {
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [classYears, setClassYears] = useState([]);
  const [selectedClassYear, setSelectedClassYear] = useState("");
  const [classesLoading, setClassesLoading] = useState(true);

  /* ===========================
     Generate Actual Exam
  =========================== */
const handleGenerateNaplanWritingExam = async () => {
  setLoading(true);
  setErrorMessage("");
  setGeneratedExam(null);

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/exams/generate-naplan-writing`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class_year: selectedClassYear,
          center_code: centerCode,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to generate NAPLAN Writing exam."
      );
    }

    setGeneratedExam(data);

    alert("✅ NAPLAN Writing exam generated successfully!");

  } catch (error) {
    console.error("❌ Generate NAPLAN Writing exam failed:", error);

    setErrorMessage(
      error.message ||
      "Something went wrong while generating the exam."
    );
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  const fetchClassYears = async () => {
    if (!centerCode) {
      setClassesLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/class-years-exam-module?center_code=${encodeURIComponent(centerCode)}`
      );

      if (!response.ok) {
        throw new Error("Failed to load class years");
      }

      const data = await response.json();

      console.log("CLASS YEARS FROM BACKEND:", data);

      setClassYears(data);

      // Automatically select the first available year
      if (data.length > 0) {
        setSelectedClassYear(
          data[0].year_name.replace(/^Year\s+/i, "")
        );
      }

    } catch (error) {
      console.error("Failed to load class years:", error);

      setErrorMessage(
        error.message || "Unable to load class years."
      );
    } finally {
      setClassesLoading(false);
    }
  };

  fetchClassYears();
}, [centerCode]);
  /* ===========================
     Generate Homework Exam
  =========================== */
  const handleGenerateNaplanWritingHomework = async () => {
  setLoading(true);
  setErrorMessage("");
  setGeneratedExam(null);

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/exams/generate-naplan-writing-homework`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class_year: selectedClassYear,
          center_code: centerCode,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail ||
        "Failed to generate NAPLAN Writing homework exam."
      );
    }

    setGeneratedExam(data);

    alert(
      "✅ NAPLAN Writing homework exam generated successfully!"
    );

  } catch (error) {
    console.error(
      "❌ Generate NAPLAN Writing homework exam failed:",
      error
    );

    setErrorMessage(
      error.message ||
      "Something went wrong while generating the homework exam."
    );
  } finally {
    setLoading(false);
  }
};

  /* ===========================
     UI
  =========================== */
  return (
    <div className="generate-exam-container">
      <h2>Generate NAPLAN Writing Exam</h2>

      {/* Class Year */}
      <div className="form-group">
        <label>Select Class Year:</label>

        <select
          value={selectedClassYear}
          onChange={(e) => setSelectedClassYear(e.target.value)}
          disabled={classesLoading}
        >
          <option value="">
            {classesLoading
              ? "Loading class years..."
              : "Select class year"}
          </option>

          {classYears.map((row) => {
            const yearValue = row.year_name.replace(/^Year\s+/i, "");

            return (
              <option
                key={row.id}
                value={yearValue}
              >
                {row.year_name}
              </option>
            );
          })}
        </select>
      </div>

      {errorMessage && (
        <p className="error-text">
          {errorMessage}
        </p>
      )}

      {/* Generate Actual Exam */}
      <button
        className="generate-btn blue-btn"
        onClick={handleGenerateNaplanWritingExam}
        disabled={loading || !selectedClassYear}
      >
        {loading
          ? "Generating..."
          : "Generate Exam"}
      </button>

      {/* Generate Homework */}
      <button
        className="generate-btn blue-btn"
        onClick={handleGenerateNaplanWritingHomework}
        disabled={loading || !selectedClassYear}
        style={{ marginTop: "15px" }}
      >
        {loading
          ? "Generating..."
          : "Generate Homework Exam"}
      </button>

      {/* Result */}
      {generatedExam && (
        <div className="generated-output">
          <h3>Generated Exam Preview</h3>

          <p>
            <strong>Exam ID:</strong>{" "}
            {generatedExam.exam_id}
          </p>

          <p>
            <strong>Class Year:</strong>{" "}
            {generatedExam.class_year}
          </p>

          <p>
            <strong>Topic:</strong>{" "}
            {generatedExam.topic}
          </p>

          <p>
            <strong>Difficulty:</strong>{" "}
            {generatedExam.difficulty}
          </p>

          <div className="question-card">
            <h4>Writing Exam</h4>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
              }}
            >
              {generatedExam.exam_text}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}