import React, { useState } from "react";
import "./UploadPDF.css";

export default function UploadWordNaplanReading() {
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
        "https://web-production-481a5.up.railway.app/upload-word-naplan-reading",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      // 🔥 HARD FAILURE (422)
      if (!res.ok) {
        if (data?.detail?.error) {
          throw new Error(
            `${data.detail.error}\n` +
              (data.detail.skipped || [])
                .map((s) => `Exam ${s[0]}: ${s[1]}`)
                .join("\n")
          );
        }
        throw new Error("Upload failed");
      }

      setResult(data);

      if (data.saved > 0) {
        setWordFile(null);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unexpected upload error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-pdf-container">
      {/* ---------- WAIT OVERLAY ---------- */}
      {uploading && (
        <div className="upload-overlay">
          <div className="upload-overlay-box">
            ⏳ Please wait
            <br />
            Processing NAPLAN Reading document…
          </div>
        </div>
      )}

      <h2>Upload NAPLAN Reading Word Document</h2>

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

      {wordFile && <p>Selected file: {wordFile.name}</p>}

      <p className="note">
        Upload a Word document containing one or more NAPLAN Reading exams.
      </p>

      {/* ---------- ERROR ---------- */}
      {error && (
        <div className="upload-error">
          <strong>Error:</strong>
          <pre style={{ whiteSpace: "pre-wrap" }}>{error}</pre>
        </div>
      )}

      {/* ---------- RESULT ---------- */}
      {result && (
        <div className="upload-result">
          <h3>Upload Summary</h3>

          <p>
            <strong>Status:</strong> {result.status}
          </p>
          <p>
            <strong>Saved Exams:</strong> {result.saved}
          </p>
          <p>
            <strong>Skipped Exams:</strong> {result.skipped.length}
          </p>

          {result.skipped.length > 0 && (
            <>
              <h4>Skipped Details</h4>
              <table className="upload-report">
                <thead>
                  <tr>
                    <th>Exam</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {result.skipped.map(([exam, reason]) => (
                    <tr key={`${exam}-${reason}`}>
                      <td>{exam}</td>
                      <td>{reason}</td>
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
