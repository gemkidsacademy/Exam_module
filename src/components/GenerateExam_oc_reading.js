import React, { useState, useEffect } from "react";


const BACKEND_URL = process.env.REACT_APP_API_URL;
//const BACKEND_URL = "http://127.0.0.1:8000";


const GenerateExam_oc_reading = ({ 
  mode,
  centerCode,
 }) => {
  const [className, setClassName] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [classYear, setClassYear] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [generatedExam, setGeneratedExam] = useState(null);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  /* ==================================================
     FETCH AVAILABLE DATES
  ================================================== */
  useEffect(() => {

    const fetchDates = async () => {

      if (!classYear || mode !== "latest") {
        return;
      }

      try {

        console.log(
          "📅 Fetching OC Reading dates for:",
          classYear
        );
        setAvailableDates([]);
        setSelectedDate("");
        setAvailableBatches([]);
        setSelectedBatchId("");

        const response = await fetch(
          `${BACKEND_URL}/api/exams/oc-reading-dates/${classYear}`
        );

        const data = await response.json();

        console.log("📅 Dates response:", data);

        setAvailableDates(data.dates || []);

        // auto-select latest date
        if (data.dates?.length > 0) {
          setSelectedDate(data.dates[0]);
        }

      } catch (error) {

        console.error(
          "❌ Failed to fetch dates:",
          error
        );

        setError("Failed to load dates");
      }
    };

    fetchDates();

  }, [classYear, mode]);
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
        class_year: classYear,
        date: selectedDate
      });

      const url =
        `${BACKEND_URL}/api/available-oc-reading-batches?${params.toString()}`;

      console.log(
        "📦 FETCH OC READING BATCHES:",
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
        "📦 OC READING BATCH RESPONSE:",
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

  
  const handleGenerateHomeworkExam = async () => {

    if (!classYear) {
      setMessage(
        "Config not loaded yet or class year missing..."
      );
      return;
    }
    if (mode === "latest" && !selectedBatchId) {
      setMessage("Please select a batch");
      return;
    }

    if (mode === "latest" && !selectedDate) {
      setMessage("Please select a date");
      return;
    }

    try {

      setLoading(true);
      setMessage("");
      setGeneratedExam(null);

      const payload = {
        class_year: classYear,
        class_name: "OC",
        center_code: centerCode,

        ...(mode === "latest" && {
          selected_date: selectedDate,
          batch_id: Number(selectedBatchId)
        })
      };

      console.log(
        "📤 Homework payload:",
        payload
      );

      const endpoint =
        mode === "latest"
          ? "/api/exams/generate-oc-reading-homework-latest"
          : "/api/exams/generate-oc-reading-homework";

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

      console.log(
        "📥 Homework response:",
        data
      );

      if (response.ok) {

        setGeneratedExam(data);

        setMessage(
          mode === "latest"
            ? "✅ OC Reading Latest Homework generated successfully"
            : "✅ OC Reading Homework generated successfully"
        );

      } else {

        setMessage(
          data.detail?.[0]?.msg ||
          data.detail ||
          "❌ Failed to generate homework"
        );
      }

    } catch (error) {

      console.error(error);

      setMessage(
        "❌ Server error while generating homework"
      );

    } finally {

      setLoading(false);
    }
  };

  const handleGenerateExam = async () => {

    if (!classYear) {
      setMessage(
        "Config not loaded yet or class year missing..."
      );
      return;
    }
    if (mode === "latest" && !selectedBatchId) {
      setMessage("Please select a batch");
      return;
    }

    if (mode === "latest" && !selectedDate) {
      setMessage("Please select a date");
      return;
    }

    try {

      setLoading(true);
      setMessage("");
      setGeneratedExam(null);

      const payload = {
        class_year: classYear,
        class_name: "OC",
        center_code: centerCode,

        ...(mode === "latest" && {
          selected_date: selectedDate,
          batch_id: Number(selectedBatchId)
        })
      };

      console.log(
        "📤 Exam payload:",
        payload
      );

      const endpoint =
        mode === "latest"
          ? "/api/exams/generate-oc-reading-latest"
          : "/api/exams/generate-oc-reading";

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

      console.log(
        "📥 Exam response:",
        data
      );

      if (response.ok) {

        setGeneratedExam(data);

        setMessage(
          mode === "latest"
            ? "✅ OC Reading Latest Exam generated successfully"
            : "✅ OC Reading Exam generated successfully"
        );

      } else {

        setMessage(
        data.detail?.[0]?.msg ||
        data.detail ||
        "❌ Failed to generate exam"
      );
      }

    } catch (error) {

      console.error(error);

      setMessage(
        "❌ Server error while generating exam"
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2>Generate OC Reading Exam</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      <label>Class Year:</label>
      <select
        value={classYear}
        onChange={(e) => setClassYear(e.target.value)}
      >
        <option value="">Select</option>
        <option value="Year 3">Year 3</option>
        <option value="Year 4">Year 4</option>
        <option value="Year 6">Year 6</option>
      </select>
      {/* DATE DROPDOWN */}
      {mode === "latest" &&
        availableDates.length > 0 && (

        <>
          <label
            style={{
              marginTop: "15px",
              display: "block"
            }}
          >
            Select Upload Date:
          </label>

          <select
            value={selectedDate}
            onChange={(e) =>
              setSelectedDate(e.target.value)
            }
          >
            <option value="">
              Select Date
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
        </>
      )}
      {mode === "latest" && (

        <>
          <label
            style={{
              marginTop: "15px",
              display: "block"
            }}
          >
            Select Batch ID:
          </label>

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
          <p
            style={{
              color: "red",
              marginTop: "8px",
              fontWeight: "500",
            }}
          >
            Make sure none of the questions are part of previously generated exam
          </p>
        </>
      )}
      <button
        className="dashboard-button"
        onClick={handleGenerateExam}
        disabled={loading || !classYear}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>
      <button
        className="dashboard-button"
        onClick={handleGenerateHomeworkExam}
        disabled={loading || !classYear}
      >
        {loading ? "Generating..." : "Generate Exam (Homework)"}
      </button>

      {message && <p style={{ marginTop: "15px" }}>{message}</p>}
      {/* ==================================================
        GENERATED EXAM RENDER
      ================================================== */}
      {generatedExam?.exam_json && (

        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            background: "#fff"
          }}
        >

          <h3>
            Generated Reading Exam
          </h3>

          <p>
            <strong>Total Questions:</strong>{" "}
            {generatedExam.exam_json.total_questions}
          </p>

          <p>
            <strong>Subject:</strong>{" "}
            {generatedExam.exam_json.subject}
          </p>

          {/* =========================================
            SECTIONS
          ========================================= */}
          {generatedExam.exam_json.sections?.map(
            (section, sectionIndex) => (

            <div
              key={section.section_id}
              style={{
                marginTop: "30px",
                padding: "20px",
                border: "1px solid #e5e5e5",
                borderRadius: "10px"
              }}
            >

              <h4>
                Section {sectionIndex + 1}
              </h4>

              <p>
                <strong>Topic:</strong>{" "}
                {section.topic}
              </p>

              <p>
                <strong>Difficulty:</strong>{" "}
                {section.difficulty}
              </p>

              {/* =========================================
                READING MATERIAL
              ========================================= */}
              {section.reading_material && (

                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    background: "#f8f8f8",
                    borderRadius: "8px"
                  }}
                >

                  <h5>
                    Reading Material
                  </h5>

                  {/* TEXT */}
                  {section.reading_material.text && (

                    <p
                      style={{
                        whiteSpace: "pre-wrap",
                        lineHeight: "1.7"
                      }}
                    >
                      {section.reading_material.text}
                    </p>
                  )}

                  {/* IMAGE */}
                  {section.reading_material.image && (

                    <img
                      src={section.reading_material.image}
                      alt="reading"
                      style={{
                        maxWidth: "100%",
                        marginTop: "15px",
                        borderRadius: "8px"
                      }}
                    />
                  )}

                </div>
              )}

              {/* =========================================
                QUESTIONS
              ========================================= */}
              {section.questions?.map((question) => (

                <div
                  key={question.question_id}
                  style={{
                    marginTop: "25px",
                    padding: "15px",
                    border: "1px solid #ddd",
                    borderRadius: "8px"
                  }}
                >

                  <h5>
                    Q{question.question_number}
                  </h5>

                  <p
                    style={{
                      lineHeight: "1.6",
                      whiteSpace: "pre-wrap"
                    }}
                  >
                    {question.question_text}
                  </p>

                  {/* OPTIONS */}
                  <div
                    style={{
                      marginTop: "12px"
                    }}
                  >

                    {Object.entries(
                      question.answer_options ||
                      section.answer_options ||
                      {}
                    ).map(([key, value]) => (

                      <div
                        key={key}
                        style={{
                          marginBottom: "8px"
                        }}
                      >
                        <strong>{key}.</strong>{" "}
                        {value}
                      </div>
                    ))}

                  </div>

                  {/* ANSWER */}
                  <div
                    style={{
                      marginTop: "12px",
                      color: "green",
                      fontWeight: "bold"
                    }}
                  >
                    Correct Answer:{" "}
                    {question.correct_answer}
                  </div>

                </div>
              ))}

            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default GenerateExam_oc_reading;
