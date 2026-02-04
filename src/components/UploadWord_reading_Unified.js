import React, { useState } from "react";
import "./UploadPDF.css";

export default function UploadWordReadingUnified() {
  const [wordFile, setWordFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file && !file.name.endsWith(".docx")) {
      alert("Please upload a .docx Word file only.");
      e.target.value = null;
      return;
    }

    setWordFile(file);
    setResult(null);
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

    try {
      const res = await fetch(
        "https://web-production-481a5.up.railway.app/upload-word-reading-unified",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error uploading Word document. Please check the file format.");
    } finally {
      setUploading(false);
      setWordFile(null);
    }
  };

  return (
    <div className="upload-pdf-container">
      <h2>Upload Reading Comprehension Word Document</h2>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
        />

        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Word File"}
        </button>
      </form>

      {wordFile && <p>Selected file: {wordFile.name}</p>}

      <p className="note">
        Upload a single Word document containing one or more Reading
        Comprehension exams (Comparative, Gapped Text, Main Idea, Literary).
      </p>

      {result && (
        <div className="upload-result">
          <p><strong>Status:</strong> {result.status}</p>
          <p><strong>Upload ID:</strong> {result.upload_id}</p>
          <p><strong>Total Blocks:</strong> {result.total_blocks}</p>
          <p><strong>Saved Exams:</strong> {result.saved_exam_ids.length}</p>

          {result.failed_blocks?.length > 0 && (
            <>
              <p><strong>Failed Blocks:</strong></p>
              <ul>
                {result.failed_blocks.map((f, i) => (
                  <li key={i}>
                    Block {f.block}: {f.reason}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
