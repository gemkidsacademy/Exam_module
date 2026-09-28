import React, { useState, useEffect } from "react";
import "./GenerateExam.css";

export default function GenerateExam_oc_writing({
  mode,
  centerCode,
}) {
  const API_BASE = process.env.REACT_APP_API_URL;

  const [classYear, setClassYear] = useState("");
  const [quizSetup, setQuizSetup] = useState(null);
  
  const [homeworkSetup, setHomeworkSetup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    if (!classYear || mode !== "latest") {
      return;
    }

    const fetchAvailableDates = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/writing/upload-dates/${classYear}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to fetch upload dates");
        }

        setAvailableDates(data.dates || []);

        if (data.dates?.length > 0) {
          setSelectedDate(data.dates[0]);
        }
      } catch (err) {
        console.error("Error fetching upload dates:", err);
      }
    };

    fetchAvailableDates();
  }, [classYear, mode, API_BASE]);

  useEffect(() => {
    if (!classYear || !selectedDate || mode !== "latest") {
      return;
    }

    const fetchAvailableBatches = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/writing/available-batches` +
          `?class_year=${encodeURIComponent(classYear)}` +
          `&date=${selectedDate}` +
          `&class_name=OC`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to fetch batches");
        }

        setAvailableBatches(data.batches || []);

        if (data.batches?.length > 0) {
          setSelectedBatchId(data.batches[0]);
        } else {
          setSelectedBatchId("");
        }
      } catch (err) {
        console.error("Error fetching batches:", err);
      }
    };

    fetchAvailableBatches();
  }, [classYear, selectedDate, mode, API_BASE]);

  const fetchHomeworkQuizSetup = async (selectedYear) => {
  try {
    const response = await fetch(
      `${API_BASE}/api/quizzes-oc-writing-homework?class_year=${encodeURIComponent(
        selectedYear
      )}&center_code=${encodeURIComponent(centerCode)}`
    );

    if (response.status === 404) {
      setHomeworkSetup(null);
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to load homework quiz setup");
    }

    const data = await response.json();

    console.log("Homework Quiz Setup:", data);

    setHomeworkSetup(data);

  } catch (error) {
    console.error("Error loading homework quiz setup:", error);
    setHomeworkSetup(null);
  }
};
  const fetchQuizSetup = async (selectedYear) => {
  try {
    const response = await fetch(
      `${API_BASE}/api/quizzes-writing/oc?class_year=${encodeURIComponent(
        selectedYear
      )}&center_code=${encodeURIComponent(centerCode)}`
    );

    if (response.status === 404) {
      setQuizSetup(null);
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to load quiz setup");
    }

    const data = await response.json();

    console.log("Quiz Setup:", data);

    setQuizSetup(data);

  } catch (error) {
    console.error("Error loading quiz setup:", error);
    setQuizSetup(null);
  }
};

  const handleGenerateExam = async () => {
    if (!classYear) {
      alert("Please select a class year.");
      return;
    }

    if (mode === "latest" && !selectedDate) {
      alert("Please select an upload date");
      return;
    }

    if (mode === "latest" && !selectedBatchId) {
      alert("Please select a batch");
      return;
    }

    try {
      setLoading(true);

      const endpoint =
        mode === "latest"
          ? "/api/exams/generate-oc-writing-latest"
          : "/api/exams/generate-oc-writing";

      const payload =
        mode === "latest"
          ? {
              class_year: classYear,
              selected_date: selectedDate,
              batch_id: Number(selectedBatchId),
              center_code: centerCode,
            }
          : {
              class_name: "OC",
              class_year: classYear,
              center_code: centerCode,
              mode: mode,
            };

      const response = await fetch(
        `${API_BASE}${endpoint}`,
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
        throw new Error(data.detail || "Failed to generate exam.");
      }

      alert("✅ OC Writing exam generated successfully!");

    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to generate exam.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHomework = async () => {
    if (!classYear) {
      alert("Please select a class year.");
      return;
    }

    if (mode === "latest" && !selectedDate) {
      alert("Please select an upload date");
      return;
    }

    if (mode === "latest" && !selectedBatchId) {
      alert("Please select a batch");
      return;
    }

    try {
      setLoading(true);

      const endpoint =
        mode === "latest"
          ? "/api/exams/generate-oc-writing-homework-latest"
          : "/api/exams/generate-oc-writing-homework";

      const payload =
        mode === "latest"
          ? {
              class_year: classYear,
              selected_date: selectedDate,
              batch_id: Number(selectedBatchId),
              center_code: centerCode,
            }
          : {
              class_name: "OC",
              class_year: classYear,
              center_code: centerCode,
              mode: mode,
            };

      const response = await fetch(
        `${API_BASE}${endpoint}`,
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
        throw new Error(data.detail || "Failed to generate homework.");
      }

      alert("✅ OC Writing homework generated successfully!");

    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to generate homework.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generate-exam-container">

      <div className="form-group">
        <label>Class Year:</label>

        <select
          className="form-control"
          value={classYear}
          onChange={(e) => {
            const year = e.target.value;

            setClassYear(year);
            fetchQuizSetup(year);
            fetchHomeworkQuizSetup(year);
          }}
        >
          <option value="">Select Year</option>
          <option value="Kindergarten">Kindergarten</option>
          <option value="2">Year 2</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
          <option value="5">Year 5</option>
          <option value="6">Year 6</option>
          <option value="7">Year 7</option>
          <option value="8">Year 8</option>
          <option value="9">Year 9</option>
        </select>
      </div>

      {mode === "latest" && (
        <>
          <label>Select Upload Date:</label>

          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              width: "100%",
              marginBottom: "12px"
            }}
          >
            <option value="">Select Upload Date</option>

            {availableDates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>

          {availableBatches.length > 0 && (
            <>
              <label>Select Upload Batch:</label>

              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                style={{
                  width: "100%",
                  marginBottom: "12px"
                }}
              >
                <option value="">Select Batch</option>

                {availableBatches.map((batchId) => (
                  <option key={batchId} value={batchId}>
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
                Make sure none of the questions are part of previously generated exams
              </p>
            </>
          )}
        </>
      )}

      <h2 style={{ marginTop: "35px", marginBottom: "30px" }}>
        Generate Writing Exam
      </h2>

      <button
        className="dashboard-button"
        onClick={handleGenerateExam}
        disabled={loading}
        style={{ marginBottom: "20px" }}
      >
        {loading ? "Generating..." : "Generate Writing Exam"}
      </button>

      <button
        className="dashboard-button"
        onClick={handleGenerateHomework}
        disabled={loading}
        style={{
          background: "#635BFF",
        }}
      >
        {loading
          ? "Generating..."
          : "Generate Writing Exam (Homework)"}
      </button>

    </div>
  );
}