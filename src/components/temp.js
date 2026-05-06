import React, { useState, useEffect } from "react";
import "./generate_exam.css";

export default function GenerateExam_oc_mathematical_reasoning({
  examType,
  mode
}) {
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [error, setError] = useState("");
  const [classYear, setClassYear] = useState("");

  const BACKEND_URL = process.env.REACT_APP_API_URL;

  /* ===========================
     Fetch Available Dates
  =========================== */
  useEffect(() => {
    const fetchDates = async () => {
      try {
        if (!classYear || mode !== "latest") return;

        const response = await fetch(
          `${BACKEND_URL}/api/exams/oc-mathematical-reasoning-dates/${classYear}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch dates");
        }

        const data = await response.json();

        console.log("📅 OC MR Dates Response:", data);

        setAvailableDates(data.dates || []);

        // auto select latest date
        if (data.dates?.length > 0) {
          setSelectedDate(data.dates[0]);
        }

      } catch (error) {
        console.error("❌ Failed to fetch dates:", error);
        setError("Failed to load dates");
      }
    };

    fetchDates();
  }, [classYear, mode]);

  /* ===========================
     Generate Homework
  =========================== */
  const handleGenerateHomework_oc_mathematical_reasoning = async () => {

    if (!classYear) {
      setError("Please select class year");
      return;
    }

    if (mode === "latest" && !selectedDate) {
      setError("Please select a date");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedExam(null);

    try {

      const payload = {
        class_year: Number(classYear),
        ...(mode === "latest" && {
          selected_date: selectedDate
        })
      };

      console.log(
        "📤 Sending payload (OC MR homework):",
        payload
      );

      const endpoint =
        mode === "latest"
          ? "/api/exams/generate-oc-mathematical-reasoning-homework-latest"
          : "/api/exams/generate-oc-mathematical-reasoning-homework";

      const response = await fetch(
        `${BACKEND_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const responseText = await response.text();
      const data = responseText
        ? JSON.parse(responseText)
        : {};

      console.log("📥 OC MR homework response:", data);

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to generate homework"
        );
      }

      setGeneratedExam(data);

      alert(
        mode === "latest"
          ? "Latest OC Mathematical Reasoning homework generated!"
          : "OC Mathematical Reasoning homework generated!"
      );

    } catch (error) {

      console.error(
        "❌ OC MR homework generation failed:",
        error
      );

      setError(
        error.message ||
        "Something went wrong while generating homework"
      );

    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     Generate Exam
  =========================== */
  const handleGenerateExam_oc_mathematical_reasoning = async () => {

    if (!classYear) {
      setError("Please select class year");
      return;
    }

    if (mode === "latest" && !selectedDate) {
      setError("Please select a date");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedExam(null);

    try {

      const payload = {
        class_year: Number(classYear),
        ...(mode === "latest" && {
          selected_date: selectedDate
        })
      };

      console.log(
        "📤 Sending payload (OC MR exam):",
        payload
      );

      const endpoint =
        mode === "latest"
          ? "/api/exams/generate-oc-mathematical-reasoning-latest"
          : "/api/exams/generate-oc-mathematical-reasoning";

      const response = await fetch(
        `${BACKEND_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const responseText = await response.text();

      const data = responseText
        ? JSON.parse(responseText)
        : {};

      console.log("📥 OC MR exam response:", data);

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Failed to generate OC Mathematical Reasoning exam"
        );
      }

      setGeneratedExam(data);

      alert(
        mode === "latest"
          ? "Latest OC Mathematical Reasoning exam generated!"
          : "OC Mathematical Reasoning exam generated successfully!"
      );

    } catch (error) {

      console.error(
        "❌ OC MR exam generation failed:",
        error
      );

      setError(
        error.message ||
        "Something went wrong while generating the exam"
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

      <h2>
        Generate OC Mathematical Reasoning Exam
      </h2>

      {error && (
        <p className="error-text">
          {error}
        </p>
      )}

      {/* CLASS YEAR */}
      <div className="input-group">

        <label>Select Class Year</label>

        <select
          value={classYear}
          onChange={(e) => setClassYear(e.target.value)}
        >
          <option value="">
            -- Select Year --
          </option>

          <option value="3">
            Year 3
          </option>

          <option value="4">
            Year 4
          </option>

        </select>

      </div>

      {/* DATE DROPDOWN */}
      {mode === "latest" &&
        availableDates.length > 0 && (

        <div className="input-group">

          <label>Select Upload Date</label>

          <select
            value={selectedDate}
            onChange={(e) =>
              setSelectedDate(e.target.value)
            }
          >
            <option value="">
              -- Select Date --
            </option>

            {availableDates.map((date) => (
              <option
                key={date}
                value={date}
              >
                {date}
              </option>
            ))}

          </select>

        </div>
      )}

      {/* GENERATE EXAM */}
      <button
        className="generate-btn blue-btn"
        onClick={
          handleGenerateExam_oc_mathematical_reasoning
        }
        disabled={loading}
      >
        {loading
          ? "Generating..."
          : "Generate Exam"}
      </button>

      {/* GENERATE HOMEWORK */}
      <button
        className="generate-btn green-btn"
        onClick={
          handleGenerateHomework_oc_mathematical_reasoning
        }
        disabled={loading}
        style={{ marginTop: "10px" }}
      >
        {loading
          ? "Generating..."
          : "Generate Homework"}
      </button>

      {/* GENERATED OUTPUT */}
      {generatedExam && (
        <div className="generated-output">

          <h3>Generated Exam</h3>

          <p>
            <strong>Exam ID:</strong>{" "}
            {generatedExam.exam_id}
          </p>

          <p>
            <strong>Total Questions:</strong>{" "}
            {generatedExam.total_questions}
          </p>

        </div>
      )}

    </div>
  );
}