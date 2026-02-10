import React, { useState } from "react";
import "./UploadPDF.css";

export default function UploadWord() {
  const [wordFile, setWordFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [summary, setSummary] = useState(null);

  const handleFileChange = (e) => {
    setWordFile(e.target.files[0]);
    setBlocks([]);
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
      setSummary(data.summary || null);
      setBlocks(groupBlocks(data.blocks || []));
      setWordFile(null);
    } catch (err) {
      console.error(err);
      alert("Error uploading Word document.");
    } finally {
      setUploading(false);
    }
  };

  // --------------------------------------------------
  // GROUP + DEDUPLICATE BLOCK REPORT (KEY FIX)
  // --------------------------------------------------
  const groupBlocks = (rows) => {
    const map = {};

    rows.forEach((row) => {
      const id = row.block;

      if (!map[id]) {
        map[id] = {
          block: id,
          hasError: false,
          details: new Set(),
        };
      }

      if (row.status !== "success") {
        map[id].hasError = true;
      }

      if (row.details) {
        map[id].details.add(row.details);
      }
    });

    return Object.values(map).map((b) => ({
      block: b.block,
      status: b.hasError ? "partial" : "success",
      details: Array.from(b.details),
    }));
  };

  return (
    <div className="upload-pdf-container">
      <h2>Upload Word Document for Thinking Skills / Mathematical Reasoning</h2>

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
            ⏳ Please wait… processing your Word document.
          </div>
        )}
      </form>

      {summary && (
        <div className="upload-summary">
          ✅ Saved: <strong>{summary.saved}</strong> &nbsp;|&nbsp;
          ⚠️ Skipped: <strong>{summary.skipped}</strong>
        </div>
      )}

      {blocks.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h3>Block Processing Report</h3>

          <table className="report-table">
            <thead>
              <tr>
                <th>Block</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {blocks.map((row) => (
                <tr key={row.block}>
                  <td>{row.block}</td>
                  <td style={{ textAlign: "center" }}>
                    {row.status === "success" ? "✅" : "⚠️"}
                  </td>
                  <td>
                    {row.details.length === 0 ? (
                      "—"
                    ) : (
                      <ul style={{ margin: 0, paddingLeft: "18px" }}>
                        {row.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    )}
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
