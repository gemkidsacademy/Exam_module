import React, { useState } from "react";
import "./ReadingUploadPanel.css";
import UploadWord_reading_GT from "./UploadWord_reading_GT";
import UploadWord_reading_CA from "./UploadWord_reading_CA";//handles 4 extracts
import UploadWord_reading_MI_Type2 from "./UploadWord_reading_MI_Type2";


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
            className="upload-btn main-idea"
            onClick={() => setActiveUpload("main-idea-type-2")}
          >
            Upload Main Idea & Summary Questions (Type 2)
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
      {activeUpload === "main-idea-type-2" && <UploadWord_reading_MI_Type2 />}
      
    </div>
  );
}
