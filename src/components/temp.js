import React, { useState, useEffect } from "react";

const BACKEND_URL = process.env.REACT_APP_API_URL;

const GenerateExam_oc_reading = ({ mode }) => {

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [classYear, setClassYear] = useState("");

  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const [generatedExam, setGeneratedExam] = useState(null);

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

  /* ==================================================
     GENERATE HOMEWORK
  ================================================== */
  const handleGenerateHomeworkExam = async () => {

    if (!classYear) {
      setMessage(
        "Config not loaded yet or class year missing..."
      );
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

        ...(mode === "latest" && {
          selected_date: selectedDate
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
          data.detail || "❌ Failed to generate homework"
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

  /* ==================================================
     GENERATE EXAM
  ================================================== */
  const handleGenerateExam = async () => {

    if (!classYear) {
      setMessage(
        "Config not loaded yet or class year missing..."
      );
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

        ...(mode === "latest" && {
          selected_date: selectedDate
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
          data.detail || "❌ Failed to generate exam"
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
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto"
      }}
    >

      <h2>
        Generate OC Reading Exam
      </h2>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {/* CLASS YEAR */}
      <label>
        Class Year:
      </label>

      <select
        value={classYear}
        onChange={(e) =>
          setClassYear(e.target.value)
        }
      >
        <option value="">
          Select
        </option>

        <option value="Year 3">
          Year 3
        </option>

        <option value="Year 4">
          Year 4
        </option>

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

      {/* GENERATE EXAM */}
      <button
        className="dashboard-button"
        onClick={handleGenerateExam}
        disabled={loading || !classYear}
      >
        {loading
          ? "Generating..."
          : "Generate Exam"}
      </button>

      {/* GENERATE HOMEWORK */}
      <button
        className="dashboard-button"
        onClick={handleGenerateHomeworkExam}
        disabled={loading || !classYear}
      >
        {loading
          ? "Generating..."
          : "Generate Exam (Homework)"}
      </button>

      {/* MESSAGE */}
      {message && (
        <p style={{ marginTop: "15px" }}>
          {message}
        </p>
      )}

      {/* GENERATED EXAM */}
      {generatedExam && (
        <div
          style={{
            marginTop: "30px"
          }}
        >

          <h3>
            Generated Exam
          </h3>

          <p>
            <strong>Exam ID:</strong>{" "}
            {generatedExam.exam_id}
          </p>

          <p>
            <strong>Total Questions:</strong>{" "}
            {generatedExam.total_questions}
          </p>

          {/* QUESTIONS */}
          {generatedExam.questions?.map(
            (question, index) => (

            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "20px"
              }}
            >

              <h4>
                Question {question.q_id}
              </h4>

              {/* BLOCKS */}
              {question.blocks?.map(
                (block, blockIndex) => {

                if (block.type === "text") {
                  return (
                    <p key={blockIndex}>
                      {block.content}
                    </p>
                  );
                }

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
              <div>

                {question.options &&
                  Object.entries(question.options).map(
                    ([key, value]) => (

                    <div key={key}>
                      <strong>{key}.</strong> {value}
                    </div>
                  ))}

              </div>

              {/* ANSWER */}
              <div
                style={{
                  marginTop: "10px",
                  color: "green",
                  fontWeight: "bold"
                }}
              >
                Correct Answer: {question.correct}
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default GenerateExam_oc_reading;