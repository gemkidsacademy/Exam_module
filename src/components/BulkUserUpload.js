import React, { useState } from "react";

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
      const response = await fetch("/api/admin/bulk-users", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      alert(
        `Upload completed.\nSuccess: ${result.success}\nFailed: ${result.failed}`
      );

      setFile(null);
      onClose();
    } catch (err) {
      setError("Failed to upload users. Please check the file format.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>Bulk User Upload</h2>

      <input
        type="file"
        accept=".docx,.csv"
        onChange={handleFileChange}
      />

      {file && (
        <p style={{ marginTop: 8 }}>
          Selected file: <strong>{file.name}</strong>
        </p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginTop: 16 }}>
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>

        <button onClick={onClose} style={{ marginLeft: 8 }}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BulkUserUpload;
