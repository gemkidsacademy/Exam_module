import React, { useState } from "react";
import "./ThinkingSkillsUploadPanel.css";

import UploadWord from "./UploadWord";
import UploadWord2 from "./UploadWord2";

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

      {activeUpload === "standard" && <UploadWord />}
      {activeUpload === "image-options" && <UploadWord2 />}
    </div>
  );
}
