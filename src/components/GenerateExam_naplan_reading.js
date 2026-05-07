import React, { useState, useEffect } from "react";


const BACKEND_URL = process.env.REACT_APP_API_URL;


const GenerateExamNaplanReading = ({ mode }) => {
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [generatedExam, setGeneratedExam] = useState(null);

  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  // --------------------------------------
  // Fetch available exam years from backend
  // --------------------------------------
  useEffect(() => {
  if (!selectedYear || mode !== "latest") return;

  const fetchAvailableDates = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/naplan/reading/upload-dates/${selectedYear}`
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
    const fetchAvailableYears = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/naplan/reading/available-years`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to load available years");
        }

        setYears(data.years || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAvailableYears();
  }, []);

  // --------------------------------------
  // Generate exam
  // --------------------------------------
  const handleGenerate = async () => {
  if (!selectedYear) {
    setError("Please select a year first");
    return;
  }

  setLoading(true);
  setMessage(null);
  setError(null);
  setGeneratedExam(null);

  try {
    const endpoint =
      mode === "latest"
        ? "/naplan/reading/generate-exam-latest"
        : "/naplan/reading/generate-exam";

    const payload = {
      year: parseInt(selectedYear),

      ...(mode === "latest" && {
        selected_date: selectedDate,
      }),
    };

    console.log(
      "Generate reading exam payload:",
      payload
    );

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

    console.log(
      "Generate reading exam response:",
      data
    );

    setGeneratedExam(data);

    setMessage(
      `✅ Year ${selectedYear} exam generated successfully (Exam ID: ${data.exam_id}, ${data.total_questions} questions)`
    );

  } catch (err) {
    console.error(err);

    setError(
      err.message || "Something went wrong"
    );

  } finally {
    setLoading(false);
  }
};
  const handleGenerateHomeWork = async () => {
  if (!selectedYear) {
    setError("Please select a year first");
    return;
  }

  setLoading(true);
  setMessage(null);
  setError(null);
  setGeneratedExam(null);

  try {
    const endpoint =
      mode === "latest"
        ? "/naplan/reading/generate-homework-latest"
        : "/naplan/reading/generate-homework";

    const payload = {
      year: parseInt(selectedYear),

      ...(mode === "latest" && {
        selected_date: selectedDate,
      }),
    };

    console.log(
      "Generate reading homework payload:",
      payload
    );

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

    console.log(
      "Generate reading homework response:",
      data
    );

    setGeneratedExam(data);

    setMessage(
      `✅ Year ${selectedYear} homework exam generated successfully (Exam ID: ${data.exam_id}, ${data.total_questions} questions)`
    );

  } catch (err) {
    console.error(err);

    setError(
      err.message || "Something went wrong"
    );

  } finally {
    setLoading(false);
  }
};
  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h3>Generate NAPLAN Reading Exam</h3>

      {/* Year selector */}
      <label>Class Year</label>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        style={{ width: "100%", marginBottom: "12px" }}
      >
        <option value="">Select Year</option>
        {years.map((year) => (
          <option key={year} value={year}>
            Year {year}
          </option>
        ))}
      </select>
      {mode === "latest" && availableDates.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <label>Select Upload Date</label>

          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              width: "100%",
              marginBottom: "12px"
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

      <button
        className="dashboard-button"
        onClick={handleGenerate}
        disabled={loading}
        style={{ width: "100%" }}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>
      <button
        className="dashboard-button"
        onClick={handleGenerateHomeWork}
        disabled={loading}
        style={{ width: "100%" }}
      >
        {loading ? "Generating..." : "Generate Exam(homework)"}
      </button>

      {message && (
        <p style={{ color: "green", marginTop: "12px" }}>{message}</p>
      )}

      {error && (
        <p style={{ color: "red", marginTop: "12px" }}>{error}</p>
      )}
      {generatedExam?.questions?.length > 0 && (
  <div style={{ marginTop: "30px" }}>
    <h3>Generated Exam</h3>

    <p>
      <strong>Total Questions:</strong>{" "}
      {generatedExam.questions.length}
    </p>

    {generatedExam.questions.map((question, index) => {
      const bundle = question.exam_bundle;

      return (
        <div
          key={question.question_id || index}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
            background: "#fafafa",
          }}
        >
          {/* Passage Header */}
          <div style={{ marginBottom: "10px" }}>
            <strong>
              Passage {index + 1}
            </strong>
          </div>

          {/* Topic + Difficulty */}
          <div style={{ marginBottom: "12px" }}>
            <strong>Topic:</strong> {question.topic}
            <br />

            <strong>Difficulty:</strong>{" "}
            {question.difficulty}
          </div>

          {/* Question Blocks */}
          {bundle?.question_blocks?.map(
            (block, blockIndex) => (
              <div
                key={blockIndex}
                style={{
                  marginBottom: "20px",
                  padding: "12px",
                  background: "#fff",
                  borderRadius: "6px",
                }}
              >
                {/* Reading Passage */}
                {block.type === "reading" &&
                  block.extracts?.map(
                    (extract, extractIndex) => (
                      <div
                        key={extractIndex}
                        style={{
                          marginBottom: "20px",
                        }}
                      >
                        {/* Title */}
                        {extract.title && (
                          <h4>
                            {extract.title}
                          </h4>
                        )}

                        {/* Reading Content */}
                        <div
                          style={{
                            whiteSpace: "pre-wrap",
                            lineHeight: "1.6",
                          }}
                        >
                          {extract.content}
                        </div>

                        {/* Images */}
                        {extract.images?.map(
                          (img, imgIndex) => (
                            <img
                              key={imgIndex}
                              src={img}
                              alt="reading"
                              style={{
                                maxWidth: "100%",
                                marginTop: "12px",
                                borderRadius: "6px",
                              }}
                            />
                          )
                        )}
                      </div>
                    )
                  )}

                {/* Question Text */}
                {block.type === "text" && (
                  <div
                    style={{
                      fontWeight: "500",
                    }}
                  >
                    {block.content}
                  </div>
                )}
              </div>
            )
          )}

          {/* Options */}
          {bundle?.options && (
            <div style={{ marginTop: "12px" }}>
              {Object.entries(bundle.options).map(
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
            {Array.isArray(bundle.correct_answer)
              ? bundle.correct_answer.join(", ")
              : bundle.correct_answer}
          </div>
        </div>
      );
    })}
  </div>
)}
    </div>
  );
};

export default GenerateExamNaplanReading;
