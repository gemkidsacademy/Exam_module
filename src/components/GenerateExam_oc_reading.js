import React, { useState } from "react";

const GenerateExam_oc_reading = () => {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleGenerateExam_oc_reading = async () => {
    if (!studentId) {
      setMessage("Please enter Student ID");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("/generate-exam-oc-reading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: studentId,
          subject: "oc_reading",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ OC Reading Exam generated successfully");
      } else {
        setMessage(data.detail || "❌ Failed to generate exam");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Server error while generating exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2>Generate OC Reading Exam</h2>

      <input
        type="text"
        placeholder="Enter Student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
      />

      <button
        className="dashboard-button"
        onClick={handleGenerateExam_oc_reading}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Exam"}
      </button>

      {message && (
        <p style={{ marginTop: "15px" }}>{message}</p>
      )}
    </div>
  );
};

export default GenerateExam_oc_reading;
