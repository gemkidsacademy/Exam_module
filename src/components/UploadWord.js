import React, { useState, useCallback } from "react";
import "./UploadPDF.css";

export default function UploadWord() {
  const [wordFile, setWordFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [expandedBlocks, setExpandedBlocks] = useState({});

  // -----------------------------
  // File selection
  // -----------------------------
  const handleFileChange = (e) => {
    setWordFile(e.target.files[0] || null);
    setBlocks([]);
    setSummary(null);
    setExpandedBlocks({});
  };

  // -----------------------------
  // Upload handler
  // -----------------------------
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!wordFile) {
      alert("Please select a Word document first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", wordFile);

    setUploading(true);

    try {
      const res = await fetch(
        "https://web-production-481a5.up.railway.app/upload-word",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error(`Upload failed (${res.status})`);
      }

      const data = await res.json();

      setSummary(data.summary || null);
      setBlocks(groupByBlock(data.blocks || []));
      setWordFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading Word document.");
    } finally {
      setUploading(false);
    }
  };

  // --------------------------------------------------
  // Group BACKEND EVENTS → Block → Questions + Block Errors
  // --------------------------------------------------
  const groupByBlock = useCallback((rows) => {
    const blockMap = {};

    rows.forEach((row) => {
      const b = row.block;
      if (!b) return;

      if (!blockMap[b]) {
        blockMap[b] = {
          block: b,
          questions: {},
          blockErrors: [],
        };
      }

      // -----------------------------
      // Block-level error (no question)
      // -----------------------------
      if (!row.question) {
        if (row.status !== "success") {
          blockMap[b].blockErrors.push(
            `${row.error_code || "ERROR"}: ${row.details || "Unknown issue"}`
          );
        }
        return;
      }

      // -----------------------------
      // Question-level handling
      // -----------------------------
      const q = row.question;

      if (!blockMap[b].questions[q]) {
        blockMap[b].questions[q] = {
          question: q,
          status: "success",
          errors: new Set(),
        };
      }

      if (row.status !== "success") {
        blockMap[b].questions[q].status = "failed";
        blockMap[b].questions[q].errors.add(
          `${row.error_code || "ERROR"}: ${row.details || "Unknown issue"}`
        );
      }
    });

    return Object.values(blockMap)
      .map((block) => ({
        block: block.block,
        hasError:
          block.blockErrors.length > 0 ||
          Object.values(block.questions).some((q) => q.status !== "success"),
        blockErrors: block.blockErrors,
        questions: Object.values(block.questions).map((q) => ({
          ...q,
          errors: Array.from(q.errors),
        })),
      }))
      .sort((a, b) => a.block - b.block);
  }, []);

  // -----------------------------
  // Toggle expand/collapse
  // -----------------------------
  const toggleBlock = (blockId) => {
    setExpandedBlocks((prev) => ({
      ...prev,
      [blockId]: !prev[blockId],
    }));
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="upload-pdf-container">
      <h2>Upload Word Document for Thinking Skills / Mathematical Reasoning</h2>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".doc,.docx"
          onChange={handleFileChange}
          disabled={uploading}
        />

        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Word File"}
        </button>

        {uploading && (
          <div className="upload-hint">
            ⏳ Please wait… processing your Word document.
          </div>
        )}
      </form>

      {summary && (
        <div className="upload-summary">
          📘 Total: <strong>{summary.total_questions}</strong> &nbsp;|&nbsp;
          ✅ Saved: <strong>{summary.saved}</strong> &nbsp;|&nbsp;
          ⚠️ Skipped: <strong>{summary.skipped}</strong>
        </div>
      )}

      {blocks.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h3>Block Processing Report</h3>

          <table className="report-table">
            <thead>
              <tr>
                <th>Block</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {blocks.map((block) => (
                <React.Fragment key={block.block}>
                  {/* Block row */}
                  <tr
                    style={{ cursor: "pointer", background: "#f9fafb" }}
                    onClick={() => toggleBlock(block.block)}
                  >
                    <td>
                      {expandedBlocks[block.block] ? "▼" : "▶"} Block{" "}
                      {block.block}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {block.hasError ? "⚠️ Needs attention" : "✅ OK"}
                    </td>
                    <td>
                      {block.hasError
                        ? "Click to view issues"
                        : "All questions saved"}
                    </td>
                  </tr>

                  {/* Block-level errors */}
                  {expandedBlocks[block.block] &&
                    block.blockErrors.map((err, i) => (
                      <tr key={`be-${i}`}>
                        <td colSpan="3" style={{ paddingLeft: "32px", color: "#b91c1c" }}>
                          ⚠️ {err}
                        </td>
                      </tr>
                    ))}

                  {/* Question rows */}
                  {expandedBlocks[block.block] &&
                    block.questions.map((q) => (
                      <tr key={q.question}>
                        <td style={{ paddingLeft: "32px" }}>{q.question}</td>
                        <td style={{ textAlign: "center" }}>
                          {q.status === "success" ? "✅" : "❌"}
                        </td>
                        <td>
                          {q.status === "success"
                            ? "Saved"
                            : q.errors.map((e, i) => (
                                <div key={i}>{e}</div>
                              ))}
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
