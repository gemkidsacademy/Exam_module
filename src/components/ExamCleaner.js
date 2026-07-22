import React, { useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

const ExamCleaner = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [cleanedText, setCleanedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setCleanedText("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a Word document.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE}/exam/clean-word-document`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to clean document.");
      }

      const data = await response.json();

      setCleanedText(data.cleaned_text);
    } catch (err) {
      console.error(err);
      alert("Unable to clean document.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!cleanedText) return;

    await navigator.clipboard.writeText(cleanedText);

    alert("Copied to clipboard.");
  };

  const downloadText = () => {
    if (!cleanedText) return;

    const blob = new Blob([cleanedText], {
      type: "text/plain;charset=utf-8",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "cleaned_exam.txt";

    link.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "30px",
      }}
    >
      <h2>📄 Exam Cleaner</h2>

      <p>
        Upload a Word document. The system will automatically clean the exam
        format.
      </p>

      <input
        type="file"
        accept=".docx"
        onChange={handleFileChange}
      />

      <br />
      <br />

      <button
        className="dashboard-button"
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? "Cleaning..." : "Clean Document"}
      </button>

      {cleanedText && (
        <>
          <h3 style={{ marginTop: "40px" }}>
            Cleaned Exam Text
          </h3>

          <textarea
            value={cleanedText}
            readOnly
            style={{
              width: "100%",
              height: "450px",
              padding: "10px",
              fontFamily: "monospace",
              fontSize: "14px",
            }}
          />

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              className="dashboard-button"
              onClick={copyToClipboard}
            >
              Copy to Clipboard
            </button>

            <button
              className="dashboard-button"
              onClick={downloadText}
            >
              Download TXT
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExamCleaner;