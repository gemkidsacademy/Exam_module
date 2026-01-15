import React, { useState } from "react";
import "./UploadPDF.css"; // You can rename this if you want

export default function UploadWord_reading_CA() {
  const [wordFile, setWordFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);


  const handleFileChange = (e) => {
    setWordFile(e.target.files[0]);
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
      const res = await fetch("https://web-production-481a5.up.railway.app/upload-word-reading-comparative-ai", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setResult(data);
      setError(null);
      setWordFile(null);
    } catch (err) {
      console.error(err);
      setError("Error uploading Word document.");
      setResult(null);
    } finally {
      setUploading(false);
    }
  };

  return (
  <>
    <div className="upload-pdf-container">
      <h2>Upload Word Document for Quiz Questions</h2>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
        />

        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Word File"}
        </button>
      </form>

      {wordFile && <p>Selected file: {wordFile.name}</p>}

      <p className="note">
        Upload a Word document to populate quiz questions in the database.
      </p>
    </div>

    {result && (
      <div className={`upload-result ${result.status}`}>
        <p><strong>{result.message}</strong></p>

        <p>
          🎉 Total saved exams:{" "}
          <strong>{result.summary.total_exams_saved}</strong>
        </p>

        {result.status === "partial_success" && (
          <p className="warning">
            ⚠️ Some exam blocks were skipped due to validation errors.
          </p>
        )}

        {result.saved_exam_ids?.length > 0 && (
          <p>
            Saved Exam IDs: {result.saved_exam_ids.join(", ")}
          </p>
        )}
      </div>
    )}

    {error && (
      <div className="upload-error">
        ❌ {error}
      </div>
    )}
  </>
);

}
