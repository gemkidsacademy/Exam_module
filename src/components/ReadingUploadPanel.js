import React, { useState } from "react";
import "./ReadingUploadPanel.css";
import UploadWord_reading_GT from "./UploadWord_reading_GT";
import UploadWord_reading_CA from "./UploadWord_reading_CA";
import UploadWord_reading_MI from "./UploadWord_reading_MI";


export default function ReadingUploadPanel() {
  const [activeUpload, setActiveUpload] = useState(null);

  return (
    <div className="reading-upload-panel">
      <h2>Upload Reading Question Sets</h2>

      {!activeUpload && (
        <>
          <button
            className="upload-btn gapped"
            onClick={() => setActiveUpload("gapped")}
          >
            Upload Gapped Text Questions
          </button>

          <button
            className="upload-btn main-idea"
            onClick={() => setActiveUpload("main-idea")}
          >
            Upload Main Idea & Summary Questions
          </button>

          <button
            className="upload-btn comparative"
            onClick={() => setActiveUpload("comparative")}
          >
            Upload Comparative Analysis Questions
          </button>
        </>
      )}

      {activeUpload === "gapped" && <UploadWord_reading_GT />}
      {activeUpload === "comparative" && <UploadWord_reading_CA />}
      {activeUpload === "main-idea" && <UploadWord_reading_MI />}
    </div>
  );
}
