import React, { useState, useEffect } from "react";

const BACKEND_URL = "https://web-production-481a5.up.railway.app";

export default function GenerateExam_oc_mathematical_reasoning() {
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);

  /* -------------------------------------------
     LOAD OC CLASSES
  ------------------------------------------- */
  useEffect(() => {
    const loadClasses_OC_MR = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/oc/classes`
        ); // ✅ OC endpoint

        const data = await res.json();
        setAvailableClasses(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load OC classes.");
      }
    };

    loadClasses_OC_MR();
  }, []);

  /* -------------------------------------------
     GENERATE OC MATHEMATICAL REASONING EXAM
  ------------------------------------------- */
  const handleGenerateExam_OC_MR = async () => {
    if (!selectedClass) {
      alert("Please select a class.");
      return;
    }

    setLoading(true);
    setGeneratedExam(null);

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/exams/generate-oc-mathematical-reasoning`, // ✅ OC MR endpoint
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            class_name: selectedClass,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Failed to generate OC MR exam.");
        setLoading(false);
        return;
      }

      setGeneratedExam(data);
      alert("✅ OC Mathematical Reasoning exam generated!");
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
      <h2>Generate OC Mathematical Reasoning Exam</h2>

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
        onClick={handleGenerateExam_OC_MR}
        disabled={loading || !selectedClass}
        style={{
          marginTop: "20px",
          padding: "12px 22px",
          backgroundColor: "#4caf50", // slight visual difference
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "16px",
          cursor: loading || !selectedClass ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate OC Exam"}
      </button>

      {/* RESULT */}
      {generatedExam && (
        <div style={{ marginTop: "30px" }}>
          <h3>Generated Exam</h3>

          <p>
            <strong>Total Questions:</strong>{" "}
            {generatedExam.total_questions}
          </p>

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
