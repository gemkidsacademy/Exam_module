import React, { useState, useEffect } from "react";
import "./generateexam_writing.css";

export default function GenerateExam_writing({
   mode,
  centerCode
   }) {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedClassYear, setSelectedClassYear] = useState("Year 6");
  const [availableBatches, setAvailableBatches] = useState([]);

  const [selectedBatchId, setSelectedBatchId] = useState("");
  

  const [availableDates, setAvailableDates] = useState([]);

  const [selectedDate, setSelectedDate] = useState("");


  const BACKEND_URL = process.env.REACT_APP_API_URL;

  /* ---------------- Load Writing Quiz Configs ---------------- */
  useEffect(() => {

  if (
    !selectedClassYear ||
    !selectedDate ||
    mode !== "latest"
  ) {
    return;
  }

  const fetchAvailableBatches = async () => {

    try {

      console.log("\n==============================");

      console.log("📦 FETCH WRITING BATCHES");

      console.log("==============================");

      console.log(
        "selectedClassYear:",
        selectedClassYear
      );

      console.log(
        "selectedDate:",
        selectedDate
      );

      const response = await fetch(
        `${BACKEND_URL}/api/writing/available-batches` +
        `?class_year=${encodeURIComponent(selectedClassYear)}` +
        `&date=${selectedDate}`
      );

      const data = await response.json();

      console.log(
        "📥 Batch response:",
        data
      );

      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to fetch batches"
        );
      }

      setAvailableBatches(
        data.batches || []
      );

      if (data.batches?.length > 0) {

        setSelectedBatchId(
          data.batches[0]
        );

        console.log(
          "✅ Auto-selected batch:",
          data.batches[0]
        );

      } else {

        setSelectedBatchId("");

        console.log(
          "⚠️ No batches returned"
        );
      }

    } catch (err) {

      console.error(
        "❌ Batch fetch error:",
        err
      );

      setError(
        err.message ||
        "Failed to fetch batches"
      );
    }
  };

  fetchAvailableBatches();

}, [
  selectedClassYear,
  selectedDate,
  mode
]); 
  useEffect(() => {

  console.log("🔥 DATE EFFECT TRIGGERED");

  console.log("mode =", mode);
  console.log("selectedClassYear =", selectedClassYear);

  if (!selectedClassYear || mode !== "latest") {
    console.log("⛔ EFFECT EXITED EARLY");
    return;
  }

  console.log("✅ FETCHING DATES NOW");

  const fetchAvailableDates = async () => {

    try {

      console.log(
        "📡 CALLING:",
        `${BACKEND_URL}/api/writing/upload-dates/${selectedClassYear}`
      );

      const response = await fetch(
        `${BACKEND_URL}/api/writing/upload-dates/${selectedClassYear}`
      );

      console.log("📥 RESPONSE STATUS:", response.status);

      const data = await response.json();

      console.log("📦 RESPONSE DATA:", data);

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to fetch upload dates"
        );
      }

      setAvailableDates(data.dates || []);

      if (data.dates?.length > 0) {
        setSelectedDate(data.dates[0]);
      }

    } catch (err) {

      console.error("❌ DATE FETCH ERROR:", err);

      setError(
        err.message || "Failed to fetch upload dates"
      );
    }
  };

  fetchAvailableDates();

}, [selectedClassYear, mode]);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/get-quizzes-writing`);
        if (!res.ok) throw new Error("Failed to load writing quizzes");

        const data = await res.json();
        const filtered = data.map((q) => ({
          class_name: q.class_name,
          difficulty: q.difficulty,
          class_year: q.class_year   // ✅ ADD THIS
        }));

        setQuizzes(filtered);

        // 🔑 Auto-select latest config (same data dropdown used before)
        if (filtered.length > 0) {
          const latest = filtered[filtered.length - 1];

          setSelectedQuiz(latest);
          setSelectedClass(latest.class_name);
          setSelectedDifficulty(latest.difficulty);

          // ✅ prevent overwriting with empty/undefined
          if (latest.class_year && latest.class_year.trim() !== "") {
            setSelectedClassYear(latest.class_year.trim());
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load writing quizzes.");
      }
    };

    load();
  }, []);
  const handleGenerateHomeworkExam = async () => {
    if (
      mode === "latest" &&
      !selectedBatchId
    ) {
      setError(
        "Please select a batch"
      );

      return;
    }

  if (!selectedClassYear) {
    setError("Please select a class year");
    return;
  }

  if (mode === "latest" && !selectedDate) {
    setError("Please select an upload date");
    return;
  }

  setLoading(true);

  setError("");

  setGeneratedExam(null);

  setSuccessMessage("");

  try {

    const endpoint =
      mode === "latest"
        ? "/api/exams/generate-writing-homework-latest"
        : "/api/exams/generate-writing-homework";

    const body =
      mode === "latest"
        ? {
            class_year: selectedClassYear,
            selected_date: selectedDate,
            batch_id: Number(selectedBatchId),
            center_code: centerCode

          }
        : {
            class_year: selectedClassYear,
            center_code: centerCode
          };

    const res = await fetch(
      `${BACKEND_URL}${endpoint}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(body)
      }
    );

    const data = await res.json();

    if (!res.ok) {

      throw new Error(
        data.detail ||
        "Failed to generate homework exam"
      );
    }

    setSuccessMessage(
      "Writing homework exam created successfully."
    );

    setGeneratedExam(data);

  } catch (err) {

    console.error(err);

    setError(
      err.message ||
      "Network error while generating homework exam."
    );

  } finally {

    setLoading(false);

  }
};
  /* ---------------- Generate Writing Exam ---------------- */
  const handleGenerateExam = async () => {
  if (
    mode === "latest" &&
    !selectedBatchId
  ) {
    setError(
      "Please select a batch"
    );

    return;
  }

  if (!selectedClassYear) {
    setError("Please select a class year");
    return;
  }

  if (mode === "latest" && !selectedDate) {
    setError("Please select an upload date");
    return;
  }

  setLoading(true);

  setError("");

  setGeneratedExam(null);

  setSuccessMessage("");

  try {

    const endpoint =
      mode === "latest"
        ? "/api/exams/generate-writing-latest"
        : "/api/exams/generate-writing";

    const body =
      mode === "latest"
        ? {
            class_year: selectedClassYear,
            selected_date: selectedDate,
            batch_id: Number(selectedBatchId),
            center_code: centerCode
          }
        : {
            class_year: selectedClassYear,
            center_code: centerCode
          };

    const res = await fetch(
      `${BACKEND_URL}${endpoint}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(body)
      }
    );

    const data = await res.json();

    if (!res.ok) {

      throw new Error(
        data.detail || "Failed to generate exam"
      );
    }

    setSuccessMessage(
      "Writing exam created successfully."
    );

    setGeneratedExam(data);

  } catch (err) {

    console.error(err);

    setError(
      err.message ||
      "Network error while generating writing exam."
    );

  } finally {

    setLoading(false);

  }
};

  /* ---------------- UI (BUTTON ONLY) ---------------- */
  return (
    <div className="generate-writing-container">
    
      {error && <div className="error-text">{error}</div>}
      {successMessage && (
        <div className="success-text">{successMessage}</div>
      )}
      {/* CLASS YEAR */}
      <label>Class Year:</label>
      <select
        value={selectedClassYear || "Year 6"}   // ✅ fallback fix
        onChange={(e) => setSelectedClassYear(e.target.value)}
      >
        <option value="">Select Year</option>
        <option value="Year 4">Year 4</option>
        <option value="Year 5">Year 5</option>
        <option value="Year 6">Year 6</option>
        
      </select>
      {mode === "latest" && (
      <>
        {/* Upload Date Dropdown */}
        <label>Select Upload Date:</label>

        <select
          value={selectedDate}
          onChange={(e) =>
            setSelectedDate(e.target.value)
          }
          style={{
            width: "100%",
            marginBottom: "12px"
          }}
        >
          <option value="">
            Select Upload Date
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

        {/* Batch Dropdown */}
        {availableBatches.length > 0 && (
          <>
            <label>Select Upload Batch:</label>

            <select
              value={selectedBatchId}
              onChange={(e) => {

                console.log(
                  "📦 Selected batch:",
                  e.target.value
                );

                setSelectedBatchId(
                  e.target.value
                );
              }}
              style={{
                width: "100%",
                marginBottom: "12px"
              }}
            >
              <option value="">
                Select Batch
              </option>

              {availableBatches.map(
                (batchId) => (
                  <option
                    key={batchId}
                    value={batchId}
                  >
                    Batch {batchId}
                  </option>
                )
              )}
            </select>

            <p
              style={{
                color: "red",
                marginTop: "8px",
                fontWeight: "500",
              }}
            >
              Make sure none of the
              questions are part of
              previously generated exams
            </p>
          </>
        )}
      </>
    )}
      <h2>Generate Writing Exam</h2>

      <button
        className="primary-btn"
        onClick={handleGenerateExam}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Writing Exam"}
      </button>
      <button
        className="primary-btn"
        onClick={handleGenerateHomeworkExam}
        disabled={loading}
        style={{ marginTop: "10px", backgroundColor: "#6c63ff" }}
      >
        {loading ? "Generating..." : "Generate Writing Exam (Homework)"}
      </button>
      

{generatedExam && (
  <div
    style={{
      marginTop: "20px",
      padding: "16px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      background: "#fafafa"
    }}
  >
    <h3>Generated Writing Exam</h3>

    <p>
      <strong>Exam ID:</strong>{" "}
      {generatedExam.exam_id}
    </p>

    <p>
      <strong>Topic:</strong>{" "}
      {generatedExam.topic}
    </p>

    <p>
      <strong>Difficulty:</strong>{" "}
      {generatedExam.difficulty}
    </p>

    <p>
      <strong>Batch ID:</strong>{" "}
      {generatedExam.batch_id}
    </p>

    <p>
      <strong>Center Code:</strong>{" "}
      {generatedExam.center_code}
    </p>

    <pre
      style={{
        whiteSpace: "pre-wrap",
        lineHeight: "1.6",
        marginTop: "16px"
      }}
    >
      {generatedExam.exam_text}
    </pre>
  </div>
)}
    </div>
  );
}
