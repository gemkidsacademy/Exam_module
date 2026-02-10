import React, { useState } from "react";
import "./UploadPDF.css";

export default function UploadWord() {
  const [wordFile, setWordFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [exams, setExams] = useState([]);
  const [error, setError] = useState(null);

  // -----------------------------
  // File selection
  // -----------------------------
  const handleFileChange = (e) => {
    setWordFile(e.target.files[0] || null);
    setSummary(null);
    setExams([]);
    setError(null);
  };

  // -----------------------------
  // Upload handler
  // -----------------------------
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!wordFile) {
      alert("Please select a Word document first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", wordFile);

    setUploading(true);
    setError(null);

    try {
      const res = await fetch(
        "https://web-production-481a5.up.railway.app/upload-word",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      // -----------------------------
      // FAIL-LOUD handling (422 etc.)
      // -----------------------------
      if (!res.ok) {
        setError(
          data?.detail?.message ||
            "The document format was not accepted. Please check and try again."
        );
        return;
      }

      setSummary(data.summary || null);
      setExams(data.exams || []);
      setWordFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Unexpected error while uploading the document.");
    } finally {
      setUploading(false);
    }
  };

  const skippedExams = exams.filter((e) => e.status !== "success");

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="upload-pdf-container">
      <h2>Upload Word Document (Thinking Skills/Mathematical Reasoning)</h2>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".doc,.docx"
          onChange={handleFileChange}
          disabled={uploading}
        />

        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Word File"}
        </button>

        {uploading && (
          <div className="upload-hint">
            ⏳ Please wait… validating and processing your document.
          </div>
        )}
      </form>

      {/* -----------------------------
          Loud format error
      ----------------------------- */}
      {error && (
        <div className="upload-error">
          ❌ <strong>Upload failed:</strong> {error}
        </div>
      )}

      {/* -----------------------------
          Summary
      ----------------------------- */}
      {summary && (
        <div className="upload-summary">
          📘 Exams: <strong>{summary.total_exams}</strong> &nbsp;|&nbsp;
          ✅ Saved: <strong>{summary.saved}</strong> &nbsp;|&nbsp;
          ⚠️ Skipped: <strong>{summary.skipped}</strong>
        </div>
      )}

      {/* -----------------------------
          WHY some exams were skipped
      ----------------------------- */}
      {skippedExams.length > 0 && (
        <div className="upload-failures">
          <h4>⚠️ Why some exams were skipped</h4>
          <ul>
            {skippedExams.map((e, idx) => (
              <li key={idx}>
                <strong>Exam {e.exam}:</strong>{" "}
                {e.error_code}
                {e.details ? ` – ${e.details}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* -----------------------------
          Detailed exam report
      ----------------------------- */}
      {exams.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h3>Exam Processing Report</h3>

          <table className="report-table">
            <thead>
              <tr>
                <th>Exam</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {exams.map((exam, idx) => (
                <tr key={idx}>
                  <td>Exam {exam.exam}</td>
                  <td style={{ textAlign: "center" }}>
                    {exam.status === "success" ? "✅" : "❌"}
                  </td>
                  <td>
                    {exam.status === "success"
                      ? `Saved as ${exam.question}`
                      : `${exam.error_code}${
                          exam.details ? `: ${exam.details}` : ""
                        }`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
