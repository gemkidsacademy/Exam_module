import React, { useState } from "react";
import StudentCurrentExamReport from "./StudentCurrentExamReport";
import ClassReportMock from "./ClassReportMock";
import CumulativeReportMock from "./CumulativeReportMock";
import PDFPreviewMock from "./PDFPreviewMock";
import "./Reports.css";

export default function StudentReportShell() {
  const [reportType, setReportType] = useState("student");
  const [studentId, setStudentId] = useState("");
  const [exam, setExam] = useState("Thinking Skills");
  const [date, setDate] = useState("2024-01-10");
  const [showPDF, setShowPDF] = useState(false);

  return (
    <div>

      {/* ================= FILTER BAR ================= */}
      <div className="filters-bar">
        <select
          value={reportType}
          onChange={e => {
            setReportType(e.target.value);
            setStudentId(""); // reset when switching reports
          }}
        >
          <option value="student">Per Student Report</option>
          <option value="class">Per Class Report</option>
          <option value="cumulative">Cumulative Progress</option>
        </select>

        {/* 👇 Student selector only for per-student */}
        {reportType === "student" && (
          <select
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
          >
            <option value="">Select Student</option>
            <option value="S001">Student S001</option>
            <option value="S002">Student S002</option>
            <option value="S003">Student S003</option>
          </select>
        )}

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

      {/* 🚧 GATE: student must be selected */}
      {reportType === "student" && !studentId && (
        <div className="empty-state">
          <h3>Select a student to view the report</h3>
          <p>
            Please choose a student ID from the dropdown above to view their
            exam report.
          </p>
        </div>
      )}

      {/* ✅ Student report only after student is selected */}
      {reportType === "student" && studentId && (
        <StudentCurrentExamReport studentId={studentId} />
      )}

      {/* Other reports don’t need student selection */}
      {reportType === "class" && <ClassReportMock />}
      {reportType === "cumulative" && <CumulativeReportMock />}

      {showPDF && <PDFPreviewMock onClose={() => setShowPDF(false)} />}
    </div>
  );
}
