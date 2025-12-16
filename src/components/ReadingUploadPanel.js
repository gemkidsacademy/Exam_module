import React, { useRef } from "react";
import "./ReadingUploadPanel.css";

export default function ReadingUploadPanel() {
  const fileInputRef = useRef(null);
  const currentTypeRef = useRef(null);

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  const handleClick = (type) => {
    currentTypeRef.current = type;
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("question_type", currentTypeRef.current);

    try {
      const res = await fetch(`${BACKEND_URL}/upload-word-reading`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Upload failed");
        return;
      }

      alert("Upload successful!");
      console.log("Upload response:", data);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Server error during upload");
    } finally {
      e.target.value = ""; // reset input
    }
  };

  return (
    <div className="reading-upload-panel">
      <h2>Upload Reading Question Sets</h2>

      <button
        className="upload-btn gapped"
        onClick={() => handleClick("gapped_text")}
      >
        Upload Gapped Text Questions
      </button>

      <button
        className="upload-btn main-idea"
        onClick={() => handleClick("main_idea")}
      >
        Upload Main Idea & Summary Questions
      </button>

      <button
        className="upload-btn comparative"
        onClick={() => handleClick("comparative_analysis")}
      >
        Upload Comparative Analysis Questions
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}
