import React, { useState } from "react";
import "./UploadImageFolder.css";

export default function UploadImageFolder() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [imagesFromBucket, setImagesFromBucket] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  const handleFolderSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const imageFiles = selectedFiles.filter((f) =>
      f.type.startsWith("image/")
    );
    setFiles(imageFiles);
  };

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
      if (!res.ok) throw new Error(data.detail || "Upload failed");

      alert(data.message || "Images uploaded successfully!");
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert("Failed to upload image folder.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ NEW: Fetch images from bucket
  const handleViewImages = async () => {
    setLoadingImages(true);
    try {
      const res = await fetch(`${BACKEND_URL}/list-images`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Failed to fetch images");

      setImagesFromBucket(data.images || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load images.");
    } finally {
      setLoadingImages(false);
    }
  };

  return (
    <div className="upload-folder-container">
      <h3>Upload Exam Image Folder</h3>

      {/* Folder input */}
      <input
        className="folder-input"
        type="file"
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={handleFolderSelect}
      />

      {/* File count */}
      <div className="file-count">
        {files.length} image(s) selected
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="file-list">
          {files.map((file, index) => (
            <li key={index}>
              {file.webkitRelativePath || file.name}
            </li>
          ))}
        </ul>
      )}

      {/* Upload button */}
      <button
        className="upload-btn"
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload Folder"}
      </button>

      <hr />

      {/* ✅ VIEW IMAGES */}
      <button
        className="upload-btn secondary"
        onClick={handleViewImages}
        disabled={loadingImages}
      >
        {loadingImages ? "Loading..." : "View Images"}
      </button>

      {/* ✅ Render images from backend */}
      {imagesFromBucket.length > 0 && (
        <div className="image-list">
          <h4>Images in Bucket</h4>
          <ul>
            {imagesFromBucket.map((img, idx) => (
              <li key={idx} className="image-item">
                <span>{img.image_name}</span>

                {/* Optional thumbnail preview */}
                <img
                  src={img.url}
                  alt={img.image_name}
                  style={{ width: "120px", display: "block", marginTop: "5px" }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
