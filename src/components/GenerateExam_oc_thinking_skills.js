import React, { useState, useEffect } from "react";
import "./generate_exam.css";

export default function GenerateExam_oc_thinking_skills({
  mode,
  centerCode,
}) {
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  
  const [classYear, setClassYear] = useState("");
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");

  
  const BACKEND_URL = process.env.REACT_APP_API_URL;

  /* ===========================
     Generate OC Thinking Skills Exam
  =========================== */
  const handleGenerateHomework_oc_thinking_skills = async () => {
  if (!classYear) {
    setError("Please select class year");
    return;
  }
  if (mode === "latest" && !selectedBatchId) {
    setError("Please select a batch");
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
      center_code: centerCode,
      ...(mode === "latest" && {
      selected_date: selectedDate,
      batch_id: selectedBatchId
    })
    };

    console.log("📤 Sending payload (homework generation):", payload);

    // ✅ choose endpoint based on mode
    const endpoint =
      mode === "latest"
        ? "/api/exams/generate-oc-thinking-skills-homework-latest"
        : "/api/exams/generate-oc-thinking-skills-homework";

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
    const data = responseText ? JSON.parse(responseText) : {};

    console.log("📥 OC Homework response:", data);

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to generate OC homework"
      );
    }

    setGeneratedExam(data);

    alert(
      mode === "latest"
        ? "Latest OC Homework generated successfully!"
        : "OC Homework generated successfully!"
    );

  } catch (error) {
    console.error("❌ OC homework generation failed:", error);

    setError(
      error.message || "Something went wrong while generating homework"
    );

  } finally {
    setLoading(false);
  }
};
  const handleGenerateExam_oc_thinking_skills = async () => {
  if (!classYear) {
    setError("Please select class year");
    return;
  }
  if (mode === "latest" && !selectedBatchId) {
    setError("Please select a batch");
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
      center_code: centerCode,
      ...(mode === "latest" && {
      selected_date: selectedDate,
      batch_id: selectedBatchId
    })
    };

    console.log("📤 Sending payload (exam generation):", payload);

    // ✅ choose endpoint based on mode
    const endpoint =
      mode === "latest"
        ? "/api/exams/generate-oc-thinking-skills-latest"
        : "/api/exams/generate-oc-thinking-skills";

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
    const data = responseText ? JSON.parse(responseText) : {};

    console.log("📥 OC Thinking Skills exam response:", data);

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to generate OC Thinking Skills exam"
      );
    }

    setGeneratedExam(data);

    alert(
      mode === "latest"
        ? "Latest OC Thinking Skills exam generated successfully!"
        : "OC Thinking Skills exam generated successfully!"
    );

  } catch (error) {
    console.error("❌ OC exam generation failed:", error);

    setError(
      error.message || "Something went wrong while generating the exam"
    );

  } finally {
    setLoading(false);
  }
};
useEffect(() => {

  const fetchBatchIds = async () => {

    try {

      if (
        !classYear ||
        !selectedDate ||
        mode !== "latest"
      ) return;

      setSelectedBatchId("");
      setAvailableBatches([]);

      const params = new URLSearchParams({
        class_year: `Year ${classYear}`,
        date: selectedDate
      });

      const url =
        `${BACKEND_URL}/api/available-oc-thinking-batches?${params.toString()}`;

      console.log(
        "📦 FETCH OC THINKING BATCHES:",
        url
      );

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(
          "Failed to load batch ids"
        );
      }

      const data = await res.json();

      console.log(
        "📦 OC THINKING BATCH RESPONSE:",
        data
      );

      setAvailableBatches(data);

      if (data.length > 0) {
        setSelectedBatchId(data[0]);
      }

    } catch (err) {

      console.error(err);

      setError(
        "Failed to load batch ids."
      );
    }
  };

  fetchBatchIds();

}, [classYear, selectedDate, mode]);
useEffect(() => {
  const fetchDates = async () => {
    try {
      if (!classYear || mode !== "latest") return;

      const response = await fetch(
        `${BACKEND_URL}/api/exams/oc-thinking-skills-dates/${classYear}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dates");
      }

      const data = await response.json();

      console.log("📅 OC Dates Response:", data);

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
console.log("MODE:", mode);
console.log("AVAILABLE DATES:", availableDates);
console.log("CLASS YEAR:", classYear);
  /* ===========================
     UI
  =========================== */
  return (
    <div className="generate-exam-container">
      <h2>Generate OC Thinking Skills Exam</h2>

      {error && <p className="error-text">{error}</p>}
      <div className="input-group">
      <label>Select Class Year</label>
      <select
        value={classYear}
        onChange={(e) => setClassYear(e.target.value)}
      >
        <option value="">-- Select Year --</option>
        <option value="3">Year 3</option>
        <option value="4">Year 4</option>
      </select>
    </div>
    {mode === "latest" && availableDates.length > 0 && (
      <div className="input-group">
        <label>Select Upload Date</label>

        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          <option value="">-- Select Date --</option>

          {availableDates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>
    )}
    {mode === "latest" && (
      <div className="input-group">

        <label>Select Batch ID</label>

        <select
          value={selectedBatchId}
          onChange={(e) =>
            setSelectedBatchId(e.target.value)
          }
        >
          <option value="">
            -- Select Batch --
          </option>

          {availableBatches.map(
            (batchId, index) => (
              <option
                key={index}
                value={batchId}
              >
                Batch #{batchId}
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
          Make sure none of the questions are part of previously generated exam
        </p>

      </div>
    )}
      
      <button
        className="generate-btn blue-btn"
        onClick={handleGenerateExam_oc_thinking_skills}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>
      <button
        className="generate-btn green-btn"
        onClick={handleGenerateHomework_oc_thinking_skills}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Homework"}
      </button>

      {generatedExam && (
        <div className="generated-output">

          <h3>Generated Exam</h3>

          <p>
            <strong>Exam ID:</strong> {generatedExam.exam_id}
          </p>

          <p>
            <strong>Total Questions:</strong>{" "}
            {generatedExam.total_questions}
          </p>

          <div className="questions-preview">

            {generatedExam.questions?.map((question, index) => (
              <div
                key={question.q_id || index}
                className="question-card"
              >

                <h4>
                  Question {question.q_id}
                </h4>

                {/* QUESTION BLOCKS */}
                {question.blocks?.map((block, blockIndex) => {

                  // TEXT BLOCK
                  if (block.type === "text") {
                    return (
                      <p key={blockIndex}>
                        {block.content}
                      </p>
                    );
                  }

                  // IMAGE BLOCK
                  if (block.type === "image") {
                    return (
                      <img
                        key={blockIndex}
                        src={block.content}
                        alt="question"
                        style={{
                          maxWidth: "100%",
                          marginBottom: "10px"
                        }}
                      />
                    );
                  }

                  return null;
                })}

                {/* OPTIONS */}
                <div className="options-container">

                  {question.options &&
                    Object.entries(question.options).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="option-item"
                        >
                          <strong>{key}.</strong> {value}
                        </div>
                      )
                    )}

                </div>

                {/* CORRECT ANSWER */}
                <div
                  style={{
                    marginTop: "10px",
                    fontWeight: "bold",
                    color: "green"
                  }}
                >
                  Correct Answer: {question.correct}
                </div>

                {/* TOPIC + DIFFICULTY */}
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "14px",
                    color: "#666"
                  }}
                >
                  Topic: {question.topic} | Difficulty: {question.difficulty}
                </div>

              </div>
            ))}

          </div>
        </div>
      )}
    </div>
  );
}
