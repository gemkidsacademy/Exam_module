import React, { useState } from "react";
import "./UploadPDF.css"; // You can rename this if you want

export default function UploadWord() {
  const [wordFile, setWordFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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
      const res = await fetch("https://web-production-481a5.up.railway.app/upload-word", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      alert(data.message || "Word document uploaded successfully!");
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
  );
}
