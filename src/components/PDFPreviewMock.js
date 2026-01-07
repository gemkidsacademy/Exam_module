import React from "react";
import "./Reports.css";

export default function PDFPreviewMock({ onClose }) {
  return (
    <div className="pdf-overlay">
      <div className="pdf-modal">

        <div className="pdf-header">
          <h3>PDF Preview – Student Report</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="pdf-page">
          <h2>AI Exam Report</h2>
          <p><strong>Student:</strong> Sample Student</p>
          <p><strong>Exam:</strong> Thinking Skills</p>
          <p><strong>Date:</strong> 15 Feb 2024</p>

          <hr />

          <h4>Overall Performance</h4>
          <p>
            The student achieved an overall score of <strong>68%</strong>,
            showing steady improvement compared to previous exams.
          </p>

          <h4>Topic Summary</h4>
          <ul>
            <li>Time Reasoning – Needs improvement</li>
            <li>Pattern Recognition – Improving</li>
          </ul>

          <h4>AI Recommendation</h4>
          <p>
            Focus on improving accuracy in Time Reasoning questions and
            maintaining consistency in Pattern Recognition.
          </p>
        </div>

        <div className="pdf-footer">
          <button className="primary">
            Download PDF (Mock)
          </button>
        </div>

      </div>
    </div>
  );
}
