import React, { useState } from "react";

export default function UploadImageFolder() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  // Handle folder selection
  const handleFolderSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Filter only images
    const imageFiles = selectedFiles.filter((f) =>
      f.type.startsWith("image/")
    );

    setFiles(imageFiles);
  };

  // Upload folder to backend
  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Please select a folder containing images.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file, file.webkitRelativePath || file.name);
    });

    setUploading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/upload-image-folder`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      alert(data.message || "Images uploaded successfully!");
      setFiles([]);

    } catch (err) {
      console.error(err);
      alert("Failed to upload image folder. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>Upload Exam Image Folder</h3>

      {/* Folder Input */}
      <input
        type="file"
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={handleFolderSelect}
      />

      <br />

      {/* Show selected file count */}
      <p style={{ marginTop: "10px", fontWeight: "bold" }}>
        {files.length} image(s) selected
      </p>

      {/* List of selected files */}
      {files.length > 0 && (
        <ul style={{ maxHeight: "200px", overflowY: "auto", padding: "5px" }}>
          {files.map((file, index) => (
            <li key={index}>{file.webkitRelativePath || file.name}</li>
          ))}
        </ul>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          padding: "10px 18px",
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginTop: "15px",
        }}
      >
        {uploading ? "Uploading..." : "Upload Folder"}
      </button>
    </div>
  );
}
