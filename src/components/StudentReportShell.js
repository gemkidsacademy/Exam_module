import React, { useState } from "react";
import StudentCurrentExamReport from "./StudentCurrentExamReport";
import ClassReportMock from "./ClassReportMock";
import CumulativeReportMock from "./CumulativeReportMock";
import PDFPreviewMock from "./PDFPreviewMock";
import "./Reports.css";

export default function StudentReportShell() {
  const [reportType, setReportType] = useState("student");
  const [studentId, setStudentId] = useState("");
  const [className, setClassName] = useState("");
  const [classDay, setClassDay] = useState("");

  const [exam, setExam] = useState("Thinking Skills");
  const [date, setDate] = useState("2024-01-10");
  const [showPDF, setShowPDF] = useState(false);

  return (
    <div>

      {/* ================= FILTER BAR ================= */}
      <div className="filters-bar">

  {/* Report Type */}
  <div className="filter-group">
    <select value={reportType} onChange={...}>
      <option value="student">Per Student Report</option>
      <option value="class">Per Class Report</option>
      <option value="cumulative">Cumulative Progress</option>
    </select>
  </div>

  {/* Class Context */}
  {reportType === "class" && (
    <div className="filter-group">
      <select value={className} onChange={...}>
        <option value="">Class</option>
        <option value="Class A">Class A</option>
        <option value="Class B">Class B</option>
      </select>

      <select value={classDay} onChange={...}>
        <option value="">Day</option>
        <option value="Monday">Monday</option>
        <option value="Wednesday">Wednesday</option>
      </select>
    </div>
  )}

  {/* Exam Context */}
  <div className="filter-group">
    <select value={exam} onChange={...}>
      <option value="thinking_skills">Thinking Skills</option>
      <option value="reading">Reading</option>
    </select>

    {reportType !== "cumulative" && (
      <select value={date} onChange={...}>
        <option value="2024-01-10">10 Jan 2024</option>
        <option value="2024-02-15">15 Feb 2024</option>
      </select>
    )}
  </div>

  {/* Action */}
  <div className="filter-action">
    <button onClick={() => setShowPDF(true)}>
      Preview PDF
    </button>
  </div>

</div>

      {/* ================= REPORT CONTENT ================= */}

      {/* 🚧 STUDENT GATE */}
      {reportType === "student" && !studentId && (
        <div className="empty-state">
          <h3>Select a student to view the report</h3>
          <p>Please choose a student ID from the dropdown above.</p>
        </div>
      )}

      {/* ✅ STUDENT REPORT */}
      {reportType === "student" && studentId && (
        <StudentCurrentExamReport studentId={studentId} />
      )}

      {/* 🚧 CLASS GATE */}
      {reportType === "class" && (!className || !classDay) && (
        <div className="empty-state">
          <h3>Select class details to view the report</h3>
          <p>Please select both a class name and class day.</p>
        </div>
      )}

      {/* ✅ CLASS REPORT */}
      {reportType === "class" && className && classDay && (
        <ClassReportMock
          className={className}
          classDay={classDay}
          exam={exam}
          date={date}
        />
      )}

      {/* 🚧 CUMULATIVE GATE */}
      {reportType === "cumulative" && !studentId && (
        <div className="empty-state">
          <h3>Select a student to view cumulative progress</h3>
          <p>
            Please choose a student ID to view progress across multiple exam
            attempts.
          </p>
        </div>
      )}

      {/* ✅ CUMULATIVE REPORT */}
      {reportType === "cumulative" && studentId && (
        <CumulativeReportMock
          studentId={studentId}
          exam={exam}
        />
      )}

      {showPDF && <PDFPreviewMock onClose={() => setShowPDF(false)} />}

    </div>
  );
}
