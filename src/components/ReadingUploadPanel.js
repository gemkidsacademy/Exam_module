import React, { useState } from "react";
import "./ReadingUploadPanel.css";
import UploadWord_reading_GT from "./UploadWord_reading_GT";

export default function ReadingUploadPanel() {
  const [showGappedUpload, setShowGappedUpload] = useState(false);

  return (
    <div className="reading-upload-panel">
      <h2>Upload Reading Question Sets</h2>

      {!showGappedUpload && (
        <>
          <button
            className="upload-btn gapped"
            onClick={() => setShowGappedUpload(true)}
          >
            Upload Gapped Text Questions
          </button>

          <button className="upload-btn main-idea">
            Upload Main Idea & Summary Questions
          </button>

          <button className="upload-btn comparative">
            Upload Comparative Analysis Questions
          </button>
        </>
      )}

      {showGappedUpload && <UploadWord_reading_GT />}
    </div>
  );
}
