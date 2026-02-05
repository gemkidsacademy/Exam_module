import React, { useState, useMemo } from "react";
import "./UploadPDF.css";

export default function UploadWordReadingUnified() {
  const [wordFile, setWordFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file && !file.name.endsWith(".docx")) {
      alert("Please upload a .docx Word file only.");
      e.target.value = null;
      return;
    }

    setWordFile(file);
    setResult(null);
    setError(null);
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
    setResult(null);
    setError(null);

    try {
      const res = await fetch(
        "https://web-production-481a5.up.railway.app/upload-word-reading-unified",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok && !data?.progress) {
        throw new Error(data.detail || "Upload failed");
      }

      setResult(data);

      if (data.status === "success") {
        setWordFile(null);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unexpected upload error");
    } finally {
      setUploading(false);
    }
  };

  /* -------------------------------
     NORMALISE PROGRESS PER BLOCK
  -------------------------------- */
  const blocks = useMemo(() => {
    if (!result?.progress) return [];

    const map = {};

    result.progress.forEach((p) => {
      if (!map[p.block]) {
        map[p.block] = {
          block: p.block,
          question_type: p.question_type || "—",
          status: p.status,
          reason: p.reason || null,
        };
      } else {
        map[p.block].status = p.status;
        if (p.reason) map[p.block].reason = p.reason;
      }
    });

    return Object.values(map).sort((a, b) => a.block - b.block);
  }, [result]);

  return (
    <div className="upload-pdf-container">
      {/* ---------- WAIT OVERLAY ---------- */}
      {uploading && (
        <div className="upload-overlay">
          <div className="upload-overlay-box">
            ⏳ Please wait
            <br />
            Processing Word document…
          </div>
        </div>
      )}

      <h2>Upload Reading Comprehension Word Document</h2>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          disabled={uploading}
        />

        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading…" : "Upload Word File"}
        </button>
      </form>
      {uploading && (
        <div className="upload-wait-inline">
          ⏳ Please wait… processing your Word document.
        </div>
      )}


      {wordFile && <p>Selected file: {wordFile.name}</p>}

      <p className="note">
        Upload a single Word document containing one or more Reading
        Comprehension exams (Comparative, Gapped Text, Main Idea, Literary).
      </p>

      {/* ---------- ERROR ---------- */}
      {error && (
        <div className="upload-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ---------- SUMMARY ---------- */}
      {result && (
        <div className="upload-result">
          <h3>Upload Summary</h3>

          <p>
            <strong>Status:</strong> {result.status}
          </p>
          <p>
            <strong>Upload ID:</strong> {result.upload_id}
          </p>
          <p>
            <strong>Total Blocks:</strong> {result.total_blocks}
          </p>
          <p>
            <strong>Saved Exams:</strong> {result.saved_exam_ids.length}
          </p>

          {blocks.length > 0 && (
            <>
              <h3>Block Processing Report</h3>

              <table className="upload-report">
                <thead>
                  <tr>
                    <th>Block</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {blocks.map((b) => (
                    <tr key={b.block}>
                      <td>{b.block}</td>
                      <td>{b.question_type}</td>
                      <td>
                        {b.status === "saved" && "✅ Saved"}
                        {b.status === "failed" && "❌ Failed"}
                        {b.status === "processing" && "⏳ Processing"}
                      </td>
                      <td>{b.reason || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}
