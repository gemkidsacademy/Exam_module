// PDFPreviewMock.jsx
import React, { useRef } from "react";
import "./PDFPreview.css";

export default function PDFPreviewMock({ children, onClose }) {
  const pdfRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pdf-overlay">
      <div className="pdf-modal">
        <div className="pdf-header">
          <h3>PDF Preview</h3>
          <div>
            <button onClick={handlePrint}>Print / Save PDF</button>
            <button onClick={onClose}>Close</button>
          </div>
        </div>

        <div className="pdf-content" ref={pdfRef}>
          {children}
        </div>
      </div>
    </div>
  );
}
