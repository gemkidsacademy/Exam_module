import React, { useState } from "react";
import "./bulk-upload.css";


const BulkUserUpload = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setError("");
    setFile(selectedFile);
  };

  const handleSubmit = async () => {
  if (!file) {
    setError("Please select a file first");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  setLoading(true);
  setError("");

  try {
    const response = await fetch(
      "https://web-production-481a5.up.railway.app/api/admin/bulk-users-exam-module",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Upload failed");
    }

    const result = await response.json();

    alert(
      `Upload completed.\nSuccess: ${result.success}\nFailed: ${result.failed}`
    );

    setFile(null);
    onClose();
  } catch (err) {
    setError(
      err.message || "Failed to upload users. Please check the file format."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bulk-upload-container">
      <div className="bulk-upload-title">Bulk User Upload</div>

      <div className="file-input-wrapper">
        <label className="custom-file-btn">
          Choose File
          <input
            type="file"
            accept=".csv,.docx"
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>

        <span className="file-name">
          {file ? file.name : "No file chosen"}
        </span>
      </div>

      {error && (
        <p style={{ marginTop: 8, color: "#dc2626", fontSize: 13 }}>
          {error}
        </p>
      )}

      <div className="bulk-upload-actions">
        <button
          className="btn-upload"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        <button
          className="btn-cancel"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BulkUserUpload;
