import React, { useState, useEffect } from "react";

const BACKEND_URL = "https://web-production-481a5.up.railway.app";

export default function GenerateExam_foundational() {
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);

  /* -------------------------------------------
     LOAD CLASS NAMES FROM BACKEND
     These come from quiz_setup_foundational table
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
      alert("✅ Foundational exam generated successfully!");
    } catch (err) {
      console.error(err);
      alert("Network error while generating exam.");
    }

    setLoading(false);
  };

  /* -------------------------------------------
     UI
  ------------------------------------------- */
  return (
    <div style={{ padding: "20px", maxWidth: "500px" }}>
      <h2>Generate Mathematical Reasoning Exam</h2>

      {/* CLASS SELECTION */}
      <label style={{ display: "block", marginTop: "15px" }}>
        Select Class:
      </label>

      <select
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
        style={{ padding: "10px", width: "100%", marginTop: "5px" }}
      >
        <option value="">-- Select Class --</option>

        {availableClasses.map((c) => (
          <option key={c.class_name} value={c.class_name}>
            {c.class_name}
          </option>
        ))}
      </select>

      {/* GENERATE BUTTON */}
      <button
        onClick={handleGenerateExam}
        disabled={loading || !selectedClass}
        style={{
          marginTop: "20px",
          padding: "12px 22px",
          backgroundColor: "#2196f3",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "16px",
          cursor: loading || !selectedClass ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>

      {/* RESULT */}
      {generatedExam && (
        <div style={{ marginTop: "30px" }}>
          <h3>Generated Exam</h3>

          <p><strong>Total Questions:</strong> {generatedExam.total_questions}</p>

          {/* Optional: Show per-section breakdown */}
          {generatedExam.sections && (
            <div style={{ marginTop: "15px" }}>
              <h4>Sections:</h4>
              {generatedExam.sections.map((sec, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <strong>{sec.name}:</strong> {sec.total} questions  
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
