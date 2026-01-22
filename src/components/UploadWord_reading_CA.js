import React, { useState } from "react";
import "./UploadPDF.css";

export default function UploadWordReadingCA() {
  const [wordFile, setWordFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setWordFile(e.target.files[0]);
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

    try {
      const res = await fetch(
        "https://web-production-481a5.up.railway.app/upload-word-reading-comparative-ai",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();

      const { total_exams_saved, total_exams_failed } = data.summary;

      if (total_exams_failed > 0) {
        alert(
          `${total_exams_saved} exams added successfully. ` +
          `${total_exams_failed} exam(s) were not added due to validation errors.`
        );
      } else {
        alert(`${total_exams_saved} exams added successfully.`);
      }

      setWordFile(null);
      setError(null);
    } catch (err) {
      console.error(err);
      alert("Error uploading Word document.");
      setError("Error uploading Word document.");
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
        />

        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Word File"}
        </button>
      </form>

      {wordFile && <p>Selected file: {wordFile.name}</p>}

      <p className="note">
        Upload a Comparative Analysis Word document to populate quiz questions in the database.
      </p>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
