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
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");

  useEffect(() => {
    if (!selectedClassYear || mode !== "latest") {
      return;
    }

    setAvailableDates([]);
    setSelectedDate("");
    setAvailableBatches([]);
    setSelectedBatchId("");

    const fetchAvailableDates = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/writing/upload-dates/${selectedClassYear}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to fetch upload dates"
          );
        }

        setAvailableDates(data.dates || []);

        if (data.dates?.length > 0) {
          setSelectedDate(data.dates[0]);
        }
      } catch (error) {
        console.error("Failed to fetch upload dates:", error);
        setErrorMessage(
          error.message || "Failed to fetch upload dates"
        );
      }
    };

    fetchAvailableDates();
  }, [selectedClassYear, mode]);

  useEffect(() => {
    if (!selectedClassYear || !selectedDate || mode !== "latest") {
      return;
    }

    setAvailableBatches([]);
    setSelectedBatchId("");

    const fetchAvailableBatches = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/writing/available-batches?class_year=${selectedClassYear}&date=${selectedDate}&class_name=Naplan`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to fetch batches");
        }

        setAvailableBatches(data.batches || []);

        if (data.batches?.length > 0) {
          setSelectedBatchId(data.batches[0]);
        }
      } catch (error) {
        console.error("Failed to fetch batches:", error);
        setErrorMessage(error.message || "Failed to fetch batches");
      }
    };

    fetchAvailableBatches();
  }, [selectedClassYear, selectedDate, mode]);

  /* ===========================
     Generate Actual Exam
  =========================== */
const handleGenerateNaplanWritingExam = async () => {
  if (mode === "latest" && !selectedDate) {
    setErrorMessage("Please select an upload date");
    return;
  }

  if (mode === "latest" && !selectedBatchId) {
    setErrorMessage("Please select a batch");
    return;
  }

  setLoading(true);
  setErrorMessage("");
  setGeneratedExam(null);

  try {
    const endpoint =
      mode === "latest"
        ? "/api/exams/generate-naplan-writing-latest"
        : "/api/exams/generate-naplan-writing";

    const payload =
      mode === "latest"
        ? {
            class_year: selectedClassYear,
            selected_date: selectedDate,
            batch_id: Number(selectedBatchId),
            center_code: centerCode,
          }
        : {
            class_year: selectedClassYear,
            center_code: centerCode,
          };

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
  if (mode === "latest" && !selectedDate) {
    setErrorMessage("Please select an upload date");
    return;
  }

  if (mode === "latest" && !selectedBatchId) {
    setErrorMessage("Please select a batch");
    return;
  }

  setLoading(true);
  setErrorMessage("");
  setGeneratedExam(null);

  try {
    const endpoint =
      mode === "latest"
        ? "/api/exams/generate-naplan-writing-homework-latest"
        : "/api/exams/generate-naplan-writing-homework";

    const payload =
      mode === "latest"
        ? {
            class_year: selectedClassYear,
            selected_date: selectedDate,
            batch_id: Number(selectedBatchId),
            center_code: centerCode,
          }
        : {
            class_year: selectedClassYear,
            center_code: centerCode,
          };

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

      {mode === "latest" && (
        <>
          <div className="form-group">
            <label>Select Upload Date:</label>

            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="">Select upload date</option>

              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Upload Batch:</label>

            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
            >
              <option value="">Select upload batch</option>

              {availableBatches.map((batchId) => (
                <option key={batchId} value={batchId}>
                  Batch {batchId}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {errorMessage && (
        <p className="error-text">
          {errorMessage}
        </p>
      )}

      {/* Generate Actual Exam */}
      <button
        className="generate-btn blue-btn"
        onClick={handleGenerateNaplanWritingExam}
        disabled={
          loading ||
          !selectedClassYear ||
          (mode === "latest" && (!selectedDate || !selectedBatchId))
        }
      >
        {loading
          ? "Generating..."
          : "Generate Exam"}
      </button>

      {/* Generate Homework */}
      <button
        className="generate-btn blue-btn"
        onClick={handleGenerateNaplanWritingHomework}
        disabled={
          loading ||
          !selectedClassYear ||
          (mode === "latest" && (!selectedDate || !selectedBatchId))
        }
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