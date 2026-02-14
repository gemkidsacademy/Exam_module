import React, { useState, useMemo } from "react";
import "./UploadPDF.css";

export default function UploadWordNaplanNumeracy() {
  const [wordFile, setWordFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    const allowedExtensions = [".docx", ".txt"];

if (
  file &&
  !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
) {
  alert("Please upload a .docx or .txt file only.");
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
        "https://web-production-481a5.up.railway.app/upload-word-naplan",
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
    if (!result?.blocks) return [];
    return result.blocks;
  }, [result]);

  return (
    <div className="upload-pdf-container">
      {/* ---------- WAIT OVERLAY ---------- */}
      {uploading && (
        <div className="upload-overlay">
          <div className="upload-overlay-box">
            ⏳ Please wait
            <br />
            Processing NAPLAN Numeracy document…
          </div>
        </div>
      )}

      <h2>Upload NAPLAN Numeracy Document (.docx or .txt)</h2>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept="
  .docx,
  application/vnd.openxmlformats-officedocument.wordprocessingml.document,
  .txt,
  text/plain
"

          onChange={handleFileChange}
          disabled={uploading}
        />

        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading…" : "Upload Word File"}
        </button>
      </form>

      {uploading && (
        <div className="upload-wait-inline">
          ⏳ Please wait… processing your NAPLAN Numeracy document.
        </div>
      )}

      {wordFile && <p>Selected file: {wordFile.name}</p>}

      <p className="note">
        Upload a single Word document containing one or more NAPLAN Numeracy
        exams.
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
            <strong>Status:</strong> {result.status}
          </p>
          <p>
            <strong>Saved Questions:</strong> {result.summary?.saved ?? 0}
          </p>
          <p>
            <strong>Skipped (Partial):</strong> {result.summary?.skipped_partial ?? 0}
          </p>

          {blocks.length > 0 && (
            <>
              <h3>Block Processing Report</h3>

              <table className="upload-report">
                <thead>
                  <tr>
                    <th>Block</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>

                <tbody>
                {blocks.map((b) => (
                  <tr key={b.block}>
                    <td>{b.block}</td>
                    <td>
                      {b.status === "success" && "✅ Saved"}
                      {b.status === "failed" && "❌ Failed"}
                    </td>
                    <td>{b.details || "—"}</td>
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
