import React, { useState } from "react";
import "./UploadPDF.css";

export default function UploadWord() {
  const [wordFile, setWordFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [blockReport, setBlockReport] = useState([]);
  const [summary, setSummary] = useState(null);

  const handleFileChange = (e) => {
    setWordFile(e.target.files[0]);
    setBlockReport([]);
    setSummary(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!wordFile) {
      alert("Please select a Word document first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", wordFile);

    setUploading(true);

    try {
      const res = await fetch(
        "https://web-production-481a5.up.railway.app/upload-word",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      setBlockReport(data.blocks || []);
      setSummary(data.summary || null);
      setWordFile(null);
    } catch (err) {
      console.error(err);
      alert("Error uploading Word document.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-pdf-container">
      <h2>Upload Word Document for Quiz Questions</h2>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          disabled={uploading}
        />

        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Word File"}
        </button>

        {uploading && (
          <div
            style={{
              marginTop: "14px",
              padding: "10px",
              textAlign: "center",
              fontSize: "14px",
              fontWeight: 500,
              background: "#f3f4f6",
              borderRadius: "6px",
              color: "#374151",
            }}
          >
            ⏳ Please wait… processing your Word document.
          </div>
        )}
      </form>

      {summary && (
        <div style={{ marginTop: "16px", fontSize: "14px" }}>
          ✅ Saved: <strong>{summary.saved}</strong> &nbsp;|&nbsp;
          ⚠️ Skipped: <strong>{summary.skipped_partial}</strong>
        </div>
      )}

      {blockReport.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h3>Block Processing Report</h3>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Block</th>
                <th>Type</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {blockReport.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.block}</td>
                  <td>{row.type}</td>
                  <td style={{ textAlign: "center" }}>
                    {row.status === "success" && "✅"}
                    {row.status === "failed" && "❌"}
                    {row.status === "partial" && "⚠️"}
                  </td>
                  <td>{row.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="note">
        Upload a Word document to populate quiz questions in the database.
      </p>
    </div>
  );
}
