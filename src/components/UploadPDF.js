import React, { useState } from "react";
import "./UploadPDF.css"; // create a CSS file for styling

export default function UploadPDF() {
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      alert("Please select a PDF file first.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    setUploading(true);

    try {
      const res = await fetch("https://your-backend-url.com/upload-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      alert(data.message || "PDF uploaded successfully!");
      setPdfFile(null); // reset the input
    } catch (err) {
      console.error(err);
      alert("Error uploading PDF.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-pdf-container">
      <h2>Upload PDF for Quiz Questions</h2>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
      </form>
      {pdfFile && <p>Selected file: {pdfFile.name}</p>}
      <p className="note">
        Upload a PDF file to populate quiz questions in the database.
      </p>
    </div>
  );
}
