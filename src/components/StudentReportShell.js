import React, { useState } from "react";
import StudentCurrentExamReport from "./StudentCurrentExamReport";
import ClassReportMock from "./ClassReportMock";
import CumulativeReportMock from "./CumulativeReportMock";
import PDFPreviewMock from "./PDFPreviewMock";
import "./Reports.css";

export default function StudentReportShell() {
  const [reportType, setReportType] = useState("student");
  const [exam, setExam] = useState("Thinking Skills");
  const [date, setDate] = useState("2024-01-10");
  const [showPDF, setShowPDF] = useState(false);

  return (
    <div>

      {/* ================= FILTER BAR ================= */}
      <div className="filters-bar">
        <select value={reportType} onChange={e => setReportType(e.target.value)}>
          <option value="student">Per Student Report</option>
          <option value="class">Per Class Report</option>
          <option value="cumulative">Cumulative Progress</option>
        </select>

        <select value={exam} onChange={e => setExam(e.target.value)}>
          <option>Thinking Skills</option>
          <option>Reading</option>
          <option>Mathematics</option>
        </select>

        <select value={date} onChange={e => setDate(e.target.value)}>
          <option value="2024-01-10">10 Jan 2024</option>
          <option value="2024-02-15">15 Feb 2024</option>
        </select>

        <button onClick={() => setShowPDF(true)}>
          Preview PDF
        </button>
      </div>

      {/* ================= REPORT CONTENT ================= */}
      {reportType === "student" && <StudentCurrentExamReport />}
      {reportType === "class" && <ClassReportMock />}
      {reportType === "cumulative" && <CumulativeReportMock />}

      {showPDF && <PDFPreviewMock onClose={() => setShowPDF(false)} />}
    </div>
  );
}
