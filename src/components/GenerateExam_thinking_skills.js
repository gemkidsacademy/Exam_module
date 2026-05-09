import React, { useState, useEffect } from "react";
import "./generate_exam.css";


const BACKEND_URL = process.env.REACT_APP_API_URL;

export default function GenerateExam_thinking_skills({ mode }) {
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [questionCount, setQuestionCount] = useState(40);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");

  // ✅ NEW: class year state
  const [selectedClassYear, setSelectedClassYear] = useState(5);
  
useEffect(() => {

  const fetchBatchIds = async () => {

    try {

      if (
        !selectedClassYear ||
        !selectedDate ||
        mode !== "latest"
      ) return;

      const params = new URLSearchParams({
        class_year: `Year ${selectedClassYear}`,
        date: selectedDate
      });

      const url =
        `${BACKEND_URL}/api/available-thinking-batches?${params.toString()}`;

      console.log("📦 FETCH THINKING BATCHES:", url);

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Failed to load batch ids");
      }

      const data = await res.json();

      console.log("📦 BATCH RESPONSE:", data);

      setAvailableBatches(data);

      if (data.length > 0) {
        setSelectedBatchId(data[0]);
      }

    } catch (err) {

      console.error(err);

      setErrorMessage(
        "Failed to load batch ids."
      );
    }
  };

  fetchBatchIds();

}, [selectedClassYear, selectedDate, mode]);

useEffect(() => {
  const fetchDates = async () => {
    try {
      if (!selectedClassYear || mode !== "latest") return;

      const params = new URLSearchParams({
        class_year: `Year ${selectedClassYear}`,
      });

      const url = `${BACKEND_URL}/api/available-thinking-dates?${params.toString()}`;

      console.log("📅 FETCH THINKING DATES:", url);

      const res = await fetch(url);

      if (!res.ok) throw new Error("Failed to load dates");

      const data = await res.json();

      console.log("📅 DATES RESPONSE:", data);

      setAvailableDates(data);

      if (data.length > 0) {
        setSelectedDate(data[0]); // auto-select latest
      }

    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to load dates.");
    }
  };

  fetchDates();
}, [selectedClassYear, mode]);

  /* ===========================
     Generate Exam Handler
  =========================== */
  const handleGenerateThinkingSkillsHomework = async () => {
    if (mode === "latest" && !selectedDate) {
      setErrorMessage("Please select a date.");
      return;
    }
    if (mode === "latest" && !selectedBatchId) {
      setErrorMessage("Please select a batch.");
      return;
    }
  setLoading(true);
  setErrorMessage("");
  setGeneratedExam(null);

  try {
    // ✅ decide endpoint based on mode
    const endpoint =
      mode === "latest"
        ? "/api/exams/generate-thinking-skills-homework-latest"
        : "/api/exams/generate-thinking-skills-homework";

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        class_year: selectedClassYear,

        ...(mode === "latest" && {
          date: selectedDate,
          batch_id: selectedBatchId
        })
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to generate homework exam");
    }

    setGeneratedExam(data);
    alert("✅ Homework exam generated successfully!");
  } catch (error) {
    console.error(error);
    setErrorMessage(error.message);
  } finally {
    setLoading(false);
  }
};
  const handleGenerateThinkingSkillsExam = async () => {
    if (mode === "latest" && !selectedDate) {
      setErrorMessage("Please select a date.");
      return;
    }
    if (mode === "latest" && !selectedBatchId) {
      setErrorMessage("Please select a batch.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    setGeneratedExam(null);

    try {
      // ✅ decide endpoint based on mode
      const endpoint =
        mode === "latest"
          ? "/api/exams/generate-thinking-skills-latest"
          : "/api/exams/generate-thinking-skills";

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          class_year: selectedClassYear,

          ...(mode === "latest" && {
            date: selectedDate,
            batch_id: selectedBatchId
          })
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate exam");
      }

      setGeneratedExam(data);
      alert("✅ Exam generated successfully!");
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     UI
  =========================== */
  return (
    <div className="generate-exam-container">
      <h2>Generate Thinking Skills Exam</h2>


      {/* ✅ NEW: Class Year Selector */}
      <div className="form-group">
        <label>Select Class Year:</label>
        <select
          value={selectedClassYear}
          onChange={(e) => setSelectedClassYear(Number(e.target.value))}
        >
          <option value={3}>Year 3</option>
          <option value={4}>Year 4</option>
          <option value={5}>Year 5</option>
          <option value={6}>Year 6</option>
        </select>
      </div>
      {mode === "latest" && (
        <div className="form-group">
          <label>Select Date:</label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            <option value="">Select Date</option>

            {availableDates.map((date, index) => (
              <option key={index} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>
      )}
      {mode === "latest" && (
      <div className="form-group">

        <label>Select Batch ID:</label>

        <select
          value={selectedBatchId}
          onChange={(e) =>
            setSelectedBatchId(e.target.value)
          }
        >
          <option value="">
            Select Batch
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

      </div>
    )}

      {errorMessage && <p className="error-text">{errorMessage}</p>}
      <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
      <button
        className="generate-btn blue-btn"
        onClick={handleGenerateThinkingSkillsExam}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>
      <button
        className="generate-btn blue-btn"
        type="button"
        onClick={handleGenerateThinkingSkillsHomework}
        disabled={loading}
        style={{ marginLeft: "10px" }}
      >
        {loading ? "Generating..." : "Generate Exam (Homework)"}
      </button>
    </div>

      {/* RESULT */}
      {generatedExam && (
      <div className="generated-output">
        <h3>Generated Exam Preview</h3>

        <p><strong>Exam ID:</strong> {generatedExam.exam_id}</p>
        <p><strong>Quiz ID:</strong> {generatedExam.quiz_id}</p>
        <p><strong>Total Questions:</strong> {generatedExam.total_questions}</p>
        <p><strong>Class Year:</strong> {generatedExam.class_year}</p>

        {generatedExam.questions?.length > 0 ? (
          <div className="questions-preview">
            {generatedExam.questions.map((question, index) => (
              <div key={index} className="question-card">

                <h4>
                  Q{question.q_id || index + 1}
                </h4>

                {/* Question Blocks */}
                {question.question_blocks?.map((block, i) => (
                  <div key={i} style={{ marginBottom: "10px" }}>

                    {block.type === "text" && (
                      <p>{block.content}</p>
                    )}

                    {block.type === "image" && (
                      <img
                        src={block.content}
                        alt="question"
                        style={{
                          maxWidth: "300px",
                          borderRadius: "8px"
                        }}
                      />
                    )}

                  </div>
                ))}

                {/* Options */}
                <ul>
                  {Object.entries(question.options || {}).map(
                    ([key, value]) => (
                      <li key={key}>
                        <strong>{key}.</strong> {value}
                      </li>
                    )
                  )}
                </ul>

                {/* Correct Answer */}
                <div className="correct-answer">
                  Correct Answer: {question.correct}
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


/*
import React, { useState } from "react";
import "./generate_exam.css";

export default function GenerateExam_thinking_skills() {
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [error, setError] = useState("");

  const BACKEND_URL = "${backend_url}";

  // ===========================
  // Generate Exam
  // ===========================
  const handleGenerateExam = async () => {
    setLoading(true);
    setError("");
    setGeneratedExam(null);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/exams/generate-thinking-skills`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: null
        }
      );

      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : {};

      console.log("Generate exam response:", data);

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate Thinking Skills exam");
      }

      setGeneratedExam(data);
      alert("Exam generated successfully!");
    } catch (error) {
      console.error("❌ Generate exam failed:", error);
      setError(error.message || "Something went wrong while generating the exam");
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // UI
  // ===========================
  return (
    <div className="generate-exam-container">
      <h2>Generate Thinking Skills Exam</h2>

      {error && <p className="error-text">{error}</p>}

      <button
        className="generate-btn blue-btn"
        onClick={handleGenerateExam}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>

      {generatedExam && (
        <div className="generated-output">
          <h3>Generated Exam</h3>
          <div className="generated-output">
            <h3>Generated Exam</h3>
          
            <p><strong>Exam ID:</strong> {generatedExam.exam_id}</p>
            <p><strong>Total Questions:</strong> {generatedExam.total_questions}</p>
          </div>
        </div>
      )}
    </div>
  );
}
*/


