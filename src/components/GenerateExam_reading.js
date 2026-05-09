import React, { useState, useEffect } from "react";
import "./generateexam_reading.css";

export default function GenerateExam_reading({ mode }) {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");

  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedClassYear, setSelectedClassYear] = useState("");
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const BACKEND_URL = process.env.REACT_APP_API_URL;

  /* ---------------------------
     LOAD QUIZ CONFIGS
  --------------------------- */
  useEffect(() => {
  const fetchDates = async () => {
    try {
      if (!selectedClassYear || mode !== "latest") return;

      const params = new URLSearchParams({
        class_year: selectedClassYear,
      });

      const url = `${BACKEND_URL}/api/available-reading-dates?${params.toString()}`;

      console.log("📅 FETCH DATES URL:", url);

      const res = await fetch(url);

      if (!res.ok) throw new Error("Failed to load dates");

      const data = await res.json();

      console.log("📅 DATES RESPONSE:", data);

      setAvailableDates(data);

      // Optional: auto-select latest date
      if (data.length > 0) {
        setSelectedDate(data[0]); // assuming backend sends latest first
      }

    } catch (err) {
      console.error(err);
      setError("Failed to load dates.");
    }
  };

  fetchDates();
}, [selectedClassYear, mode]);
useEffect(() => {

  const fetchBatchIds = async () => {

    try {

      if (
        !selectedClassYear ||
        !selectedDate ||
        mode !== "latest"
      ) return;

      setSelectedBatchId("");
      setAvailableBatches([]);

      const params = new URLSearchParams({
        class_year: selectedClassYear,
        date: selectedDate
      });

      const url =
        `${BACKEND_URL}/api/available-reading-batches?${params.toString()}`;

      console.log(
        "📦 FETCH READING BATCHES:",
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
        "📦 READING BATCH RESPONSE:",
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

}, [
  selectedClassYear,
  selectedDate,
  mode
]);
  useEffect(() => {
  const load = async () => {
    try {
      // ✅ Guard (optional but recommended)
      if (!selectedClassYear) {
        console.log("⏸ Waiting for class year...");
        return;
      }

      const params = new URLSearchParams({
        class_year: selectedClassYear, // ✅ ADD THIS
      });

      const url = `${BACKEND_URL}/api/quizzes-reading?${params.toString()}`;

      console.log("🚀 FETCH QUIZZES URL:", url);

      const res = await fetch(url);

      if (!res.ok) throw new Error("Failed to load quizzes");

      const data = await res.json();

      console.log("📦 QUIZZES RESPONSE:", data);

      setQuizzes(data);
      if (data.length === 0) {
        setSelectedQuiz(null);
        setSelectedClass("");
        setSelectedDifficulty("");
      }

      if (data.length > 0) {
        const latest = data[data.length - 1];
        setSelectedQuiz(latest);
        setSelectedClass(latest.class_name);
        setSelectedDifficulty(latest.difficulty);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load quizzes.");
    }
  };

  load();
}, [selectedClassYear]); // ✅ IMPORTANT dependency

  const handleGenerateHomeworkExam = async () => {
    if (mode === "latest" && !selectedBatchId) {
      console.log("❌ Missing batch");
      alert("Please select a batch.");
      return;
    }
  console.log("\n================ GENERATE HOMEWORK DEBUG =================");

  console.log("📦 selectedClassYear:", selectedClassYear);

  if (!selectedClassYear) {
    console.log("❌ Missing class year");
    alert("Please select class year.");
    return;
  }
    if (mode === "latest" && !selectedDate) {
    console.log("❌ Missing date");
    alert("Please select a date.");
    return;
  }

  setLoading(true);
  setError("");
  setSuccessMessage("");
  setGeneratedExam(null);

  try {
    // ✅ Decide endpoint based on mode
    const endpoint =
      mode === "latest"
        ? "/api/exams/generate-reading-homework-latest"
        : "/api/exams/generate-reading-homework";

    const payload = {
      class_name: "Selective",
      class_year: selectedClassYear,
      ...(mode === "latest" && {
        selected_date: selectedDate,
        batch_id: Number(selectedBatchId)
      })
    };

    console.log("🚀 REQUEST PAYLOAD:", payload);
    console.log("🌐 ENDPOINT:", endpoint);

    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("📡 RESPONSE STATUS:", res.status);

    const data = await res.json();

    console.log("📦 RESPONSE DATA:", data);

    if (!res.ok) {
      throw new Error(
        typeof data.detail === "string"
          ? data.detail
          : JSON.stringify(data.detail, null, 2)
      );
    }

    setGeneratedExam(data);
    setSuccessMessage("Homework exam created successfully.");

    console.log("✅ HOMEWORK GENERATED SUCCESSFULLY");

  } catch (error) {
    console.error("💥 GENERATE HOMEWORK ERROR:", error);

    setError(
      error.message || "Failed to generate homework exam."
    );

  } finally {
    setLoading(false);
    console.log("================ END HOMEWORK DEBUG =================\n");
  }
};

  /* ---------------------------
     GENERATE EXAM
  --------------------------- */
const handleGenerateExam = async () => {
  if (mode === "latest" && !selectedBatchId) {
    console.log("❌ Missing batch");
    alert("Please select a batch.");
    return;
  }
  console.log("\n================ GENERATE EXAM DEBUG =================");

  console.log("📦 selectedClass:", selectedClass);
  console.log("📦 selectedDifficulty:", selectedDifficulty);
  console.log("📦 selectedClassYear:", selectedClassYear);

  if (!selectedClassYear) {
    console.log("❌ Missing required fields");
    alert("Please select class year.");
    return;
  }
  if (mode === "latest" && !selectedDate) {
    console.log("❌ Missing date");
    alert("Please select a date.");
    return;
  }

  // Reset UI before request
  setLoading(true);
  setError("");
  setSuccessMessage("");
  setGeneratedExam(null);

  try {
    // ✅ Decide endpoint based on mode
    const endpoint =
      mode === "latest"
        ? "/api/exams/generate-reading-latest"
        : "/api/exams/generate-reading";

    const payload = {
      class_name: "Selective",
      class_year: selectedClassYear,
      ...(mode === "latest" && {
        selected_date: selectedDate,
        batch_id: Number(selectedBatchId)
      })
    };

    console.log("🚀 REQUEST PAYLOAD:", payload);
    console.log("🌐 ENDPOINT:", endpoint);

    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log("📡 RESPONSE STATUS:", res.status);

    const data = await res.json();

    console.log("📦 RESPONSE DATA:", data);

    if (!res.ok) {
      console.log("❌ API ERROR:", data);
      throw new Error(data.detail || "Exam generation failed");
    }

    setGeneratedExam(data);
    setSuccessMessage("Exam created successfully.");

    console.log("✅ EXAM GENERATED SUCCESSFULLY");

  } catch (err) {
    console.error("💥 GENERATE EXAM ERROR:", err);
    setError(err.message || "Failed to generate exam.");
  } finally {
    setLoading(false);
    console.log("================ END GENERATE EXAM =================\n");
  }
};

  /* ---------------------------
     UI
  --------------------------- */
  return (
    <div className="generate-reading-container">
      
      {error && <p className="error-text">{error}</p>}
      {successMessage && <p className="success-text">{successMessage}</p>}
      <label>Class Year:</label>
      <select
        value={selectedClassYear}
        onChange={(e) => setSelectedClassYear(e.target.value)}
      >
        <option value="">Select Year</option>
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
        >
          <option value="">Select Date</option>

          {availableDates.map((date, index) => (
            <option key={index} value={date}>
              {date}
            </option>
          ))}
        </select>
      </>
    )}
    {mode === "latest" && (

  <>
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
  </>
)}

      <h2>Generate Reading Exam</h2>
      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
  
      {/* Exam */}
      <button
        className="primary-btn"
        onClick={handleGenerateExam}
        disabled={loading || !selectedClassYear}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>

      {/* Homework */}
      <button
        className="primary-btn"
        onClick={handleGenerateHomeworkExam}
        disabled={loading || !selectedClassYear}
      >
        {loading ? "Generating..." : "Generate Exam (Homework)"}
      </button>

    </div>

      {/* Optional: keep preview logic if backend returns exam */}
      {generatedExam && (
        <div className="generated-output">
          <h3>Generated Reading Exam</h3>

          <p><strong>Exam ID:</strong> {generatedExam.generated_exam_id}</p>
          <p><strong>Total Questions:</strong> {generatedExam.total_questions}</p>

          <p>
            <strong>Class Year:</strong>{" "}
            {generatedExam.exam_json?.class_year}
          </p>

          <p>
            <strong>Difficulty:</strong>{" "}
            {generatedExam.exam_json?.difficulty}
          </p>

          {generatedExam.exam_json?.sections?.length > 0 ? (
            <div className="sections-wrapper">

              {generatedExam.exam_json.sections.map(
                (section, sectionIndex) => (
                  <div
                    key={sectionIndex}
                    className="section-card"
                    style={{
                      border: "1px solid #ddd",
                      padding: "15px",
                      marginBottom: "20px",
                      borderRadius: "8px"
                    }}
                  >
                    <h4>
                      Section {section.section_index}: {section.topic}
                    </h4>

                    <p>
                      <strong>Type:</strong>{" "}
                      {section.question_type}
                    </p>

                    {/* Reading Passage */}
                    {section.reading_material && (
                      <div
                        style={{
                          background: "#f8f8f8",
                          padding: "10px",
                          marginBottom: "15px",
                          borderRadius: "6px"
                        }}
                      >
                        <strong>Passage:</strong>
                        {typeof section.reading_material === "string" ? (
                          <p>{section.reading_material}</p>
                        ) : section.reading_material?.extracts ? (
                              <div>
                                {Array.isArray(section.reading_material.extracts) ? (
                                  section.reading_material.extracts.map((item, idx) => (
                                    <p key={idx}>
                                      {typeof item === "string"
                                        ? item
                                        : JSON.stringify(item)}
                                    </p>
                                  ))
                                ) : typeof section.reading_material.extracts === "string" ? (
                                  <p>{section.reading_material.extracts}</p>
                                ) : (
                                  <pre>
                                    {JSON.stringify(
                                      section.reading_material.extracts,
                                      null,
                                      2
                                    )}
                                  </pre>
                                )}
                              </div>
                            ) : (
                          <pre>{JSON.stringify(section.reading_material, null, 2)}</pre>
                        )}
                      </div>
                    )}

                    {/* Shared Options */}
                    {section.answer_options && (
                      <div style={{ marginBottom: "15px" }}>
                        <strong>Shared Options:</strong>

                        <ul>
                          {Array.isArray(section.answer_options) ? (
                            section.answer_options.map((option, idx) => (
                              <li key={idx}>{option}</li>
                            ))
                          ) : (
                            Object.entries(section.answer_options).map(
                              ([key, value]) => (
                                <li key={key}>
                                  <strong>{key}.</strong> {value}
                                </li>
                              )
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Questions */}
                    {section.questions?.map(
                      (question, qIndex) => (
                        <div
                          key={qIndex}
                          style={{
                            marginBottom: "15px",
                            padding: "10px",
                            border: "1px solid #eee",
                            borderRadius: "6px"
                          }}
                        >
                          <p>
                            <strong>
                              Q{question.question_number}
                            </strong>{" "}
                            {typeof question.question_text === "string"
                              ? question.question_text
                              : JSON.stringify(question.question_text)}
                          </p>

                          {/* Per Question Options */}
                          {(
                            question.answer_options ||
                            section.answer_options
                          ) && (
                            <ul>
                              {Object.entries(
                                question.answer_options ||
                                section.answer_options ||
                                {}
                              ).map(
                                ([key, value]) => (
                                  <li key={key}>
                                    <strong>{key}.</strong>{" "}
                                    {typeof value === "string"
                                      ? value
                                      : JSON.stringify(value)}
                                  </li>
                                )
                              )}
                            </ul>
                          )}

                          <p>
                            <strong>
                              Correct:
                            </strong>{" "}
                            {question.correct_answer}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                )
              )}

            </div>
          ) : (
            <p>No sections found.</p>
          )}
        </div>
      )}
    </div>
  );
}
