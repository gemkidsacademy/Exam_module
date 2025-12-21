import React, { useState, useEffect } from "react";
import "./generateexam_foundational.css";

const BACKEND_URL = "https://web-production-481a5.up.railway.app";

export default function GenerateExam_foundational() {
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);

  /* -------------------------------------------
     LOAD CLASS NAMES
  ------------------------------------------- */
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/foundational/classes`);
        const data = await res.json();
        setAvailableClasses(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load available classes.");
      }
    };

    loadClasses();
  }, []);

  /* -------------------------------------------
     GENERATE FOUNDATIONAL EXAM
  ------------------------------------------- */
  const handleGenerateExam = async () => {
    if (!selectedClass) {
      alert("Please select a class.");
      return;
    }

    setLoading(true);
    setGeneratedExam(null);

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/exams/generate-foundational`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            class_name: selectedClass
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Failed to generate foundational exam.");
        setLoading(false);
        return;
      }

      setGeneratedExam(data);
    } catch (err) {
      console.error(err);
      alert("Network error while generating exam.");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------
     UI
  ------------------------------------------- */
  return (
    <div className="generate-foundational-container">
      <h2>Generate Foundational Exam</h2>

      <div className="form-group">
        <label>Select Class</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">-- Select Class --</option>
          {availableClasses.map((c) => (
            <option key={c.class_name} value={c.class_name}>
              {c.class_name}
            </option>
          ))}
        </select>
      </div>

      <button
        className="primary-btn"
        onClick={handleGenerateExam}
        disabled={loading || !selectedClass}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>

      {generatedExam && (
        <div className="generated-output">
          <h3>Generated Exam</h3>

          <p>
            <strong>Total Questions:</strong>{" "}
            {generatedExam.total_questions}
          </p>

          {generatedExam.sections && (
            <div className="sections-list">
              {generatedExam.sections.map((sec, i) => (
                <div key={i} className="section-item">
                  {sec.name}: {sec.total} questions
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
