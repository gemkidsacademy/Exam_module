import React, { useState } from "react";
import "./ThinkingSkillsUploadPanel.css";

import UploadWord_TS_Standard from "./UploadWord_TS_Standard";
import UploadWord_TS_ImageOptions from "./UploadWord_TS_ImageOptions";

export default function ThinkingSkillsUploadPanel() {
  const [activeUpload, setActiveUpload] = useState(null);

  return (
    <div className="thinking-skills-upload-panel">
      <h2>Upload Thinking Skills Questions</h2>

      {!activeUpload && (
        <>
          <button
            className="upload-btn standard"
            onClick={() => setActiveUpload("standard")}
          >
            Upload Standard Questions (Text Options)
          </button>

          <button
            className="upload-btn image-options"
            onClick={() => setActiveUpload("image-options")}
          >
            Upload Image-Based Questions (Image Options)
          </button>
        </>
      )}

      {activeUpload === "standard" && <UploadWord_TS_Standard />}
      {activeUpload === "image-options" && <UploadWord_TS_ImageOptions />}
    </div>
  );
}
