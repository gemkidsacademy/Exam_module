// PdfUploader.js
import React, { useState } from "react";
import "./PdfUploader.css"; // Make sure this contains the updated CSS

const PdfUploader = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pageRange, setPageRange] = useState("");
  const [className, setClassName] = useState("");
  const [term, setTerm] = useState("");
  const [chapter, setChapter] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!pdfFile || !pageRange || !className || !term || !chapter) {
      setMessage("⚠ Please fill all fields before uploading.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);
      formData.append("page_range", pageRange);
      formData.append("class", className);
      formData.append("term", term);
      formData.append("chapter", chapter);

      const response = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("✅ PDF pages uploaded successfully!");
        setPdfFile(null);
        setPageRange("");
        setClassName("");
        setTerm("");
        setChapter("");
      } else {
        setMessage("❌ Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("❌ An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="uploader-container">
      <div className="uploader-card">
        <h2 className="uploader-title">Upload PDF Pages</h2>

        {/* PDF File */}
        <label className="file-label">
          Select PDF file
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files[0])}
            className="file-input"
          />
        </label>
        {pdfFile && <p className="file-name">Selected: {pdfFile.name}</p>}

        {/* Page Range */}
        <label className="page-range-label">
          Enter Page Range (e.g., 1-5,7-10)
          <input
            type="text"
            placeholder="Page range"
            value={pageRange}
            onChange={(e) => setPageRange(e.target.value)}
            className="page-range-input"
          />
        </label>

        {/* Class */}
        <label className="class-label">
          Enter Class
          <input
            type="text"
            placeholder="Class name"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="class-input"
          />
        </label>

        {/* Term */}
        <label className="term-label">
          Enter Term
          <input
            type="text"
            placeholder="Term"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="term-input"
          />
        </label>

        {/* Chapter */}
        <label className="chapter-label">
          Enter Chapter
          <input
            type="text"
            placeholder="Chapter"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            className="chapter-input"
          />
        </label>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          className="upload-button"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {/* Message */}
        {message && <p className="upload-message">{message}</p>}
      </div>
    </div>
  );
};

export default PdfUploader;
