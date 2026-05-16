import React, { useState, useEffect } from "react";

const BACKEND_URL = process.env.REACT_APP_API_URL;

const GenerateExam_naplan_language_conventions = ({
   mode,
  centerCode }) => {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  const [loadingYears, setLoadingYears] = useState(true);
  const [loadingExam, setLoadingExam] = useState(false);

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [generatedExam, setGeneratedExam] = useState(null);

  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");

  /* ----------------------------------------------------
     Fetch available years from backend
  ---------------------------------------------------- */
  useEffect(() => {

  if (
    !selectedYear ||
    !selectedDate ||
    mode !== "latest"
  ) return;

  const fetchAvailableBatches = async () => {

    try {

      console.log("\n==============================");
      console.log("📦 FETCH LANGUAGE BATCHES");
      console.log("==============================");

      console.log("selectedYear:", selectedYear);
      console.log("selectedDate:", selectedDate);

      const response = await fetch(
        `${BACKEND_URL}/naplan/language-conventions/available-batches` +
        `?year=${selectedYear}` +
        `&date=${selectedDate}`
      );

      const data = await response.json();

      console.log("📥 Batch response:", data);

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to fetch batches"
        );
      }

      setAvailableBatches(data.batches || []);

      if (data.batches?.length > 0) {

        setSelectedBatchId(data.batches[0]);

        console.log(
          "✅ Auto-selected batch:",
          data.batches[0]
        );

      } else {

        setSelectedBatchId("");

        console.log("⚠️ No batches returned");
      }

    } catch (err) {

      console.error(
        "❌ Batch fetch error:",
        err
      );

      setError(
        err.message || "Failed to fetch batches"
      );
    }
  };

  fetchAvailableBatches();

}, [selectedYear, selectedDate, mode]);
  useEffect(() => {
  if (!selectedYear || mode !== "latest") return;

  const fetchAvailableDates = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/naplan/language-conventions/dates/${selectedYear}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to fetch dates"
        );
      }

      setAvailableDates(data.dates || []);

      if (data.dates?.length > 0) {
        setSelectedDate(data.dates[0]);
      }

    } catch (err) {
      console.error(err);

      setError(
        err.message || "Failed to fetch dates"
      );
    }
  };

  fetchAvailableDates();

}, [selectedYear, mode]);
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
  if (mode === "latest" && !selectedBatchId) {
    setError("Please select a batch");
    return;
    }
  
  if (!selectedYear) {
    setError("Please select a year");
    return;
  }

  setLoadingExam(true);
  setMessage(null);
  setError(null);
  setGeneratedExam(null);

  try {
    const endpoint =
      mode === "latest"
        ? "/naplan/language-conventions/generate-homework-latest"
        : "/naplan/language-conventions/generate-homework";

    const payload = {
      year: selectedYear,
      center_code: centerCode,

      ...(mode === "latest" && {
        selected_date: selectedDate,
        batch_id: Number(selectedBatchId),
      }),
    };

    console.log("Generate homework payload:", payload);

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
        "Failed to generate homework exam"
      );
    }

    console.log("Generate homework response:", data);

    setGeneratedExam(data);

    setMessage(
      `✅ Homework exam generated successfully (Year: ${selectedYear}, Exam ID: ${data.exam_id}, ${data.total_questions} questions)`
    );

  } catch (err) {
    console.error("Generate homework error:", err);

    setError(
      err.message || "Something went wrong"
    );

  } finally {
    setLoadingExam(false);
  }
};
  const handleGenerate = async () => {
  if (mode === "latest" && !selectedBatchId) {
  setError("Please select a batch");
  return;
  }
  if (!selectedYear) {
    setError("Please select a year");
    return;
  }

  setLoadingExam(true);
  setMessage(null);
  setError(null);
  setGeneratedExam(null);

  try {
    const endpoint =
      mode === "latest"
        ? "/naplan/language-conventions/generate-exam-latest"
        : "/naplan/language-conventions/generate-exam";

    const payload = {
      year: selectedYear,
      center_code: centerCode,

      ...(mode === "latest" && {
        selected_date: selectedDate,
        batch_id: Number(selectedBatchId),
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
      `✅ Exam generated successfully (Year: ${selectedYear}, Exam ID: ${data.exam_id}, ${data.total_questions} questions)`
    );

  } catch (err) {
    console.error("Generate exam error:", err);

    setError(
      err.message || "Something went wrong"
    );
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
      {mode === "latest" && availableDates.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <label>Select Upload Date</label>

          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "6px"
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
      {mode === "latest" && availableBatches.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <label>Select Upload Batch</label>

          <select
            value={selectedBatchId}
            onChange={(e) => {
              console.log(
                "📦 Selected batch:",
                e.target.value
              );

              setSelectedBatchId(e.target.value);
            }}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "6px"
            }}
          >
            {availableBatches.map((batchId) => (
              <option
                key={batchId}
                value={batchId}
              >
                Batch {batchId}
              </option>
            ))}
          </select>
          <p
            style={{
              color: "red",
              marginTop: "8px",
              fontWeight: "500",
            }}
          >
            Make sure none of the questions are part of previously generated exam
          </p>
        </div>
      )}

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

              <div style={{ marginBottom: "10px" }}>
                <strong>Topic:</strong> {question.topic}
                <br />

                <strong>Difficulty:</strong>{" "}
                {question.difficulty}
              </div>

              {question.question_text && (
                <div style={{ marginBottom: "14px" }}>
                  {question.question_text}
                </div>
              )}

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
                        <strong>{key}.</strong>{" "}
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : value}
                      </div>
                    )
                  )}
                </div>
              )}

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
                  : typeof question.correct_answer === "object"
                    ? question.correct_answer?.value
                    : question.correct_answer}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenerateExam_naplan_language_conventions;
