import React, { useState } from "react";
import StudentReportMock from "./StudentReportMock";
import ClassReportMock from "./ClassReportMock";
import CumulativeReportMock from "./CumulativeReportMock";
import "./Reports.css";

export default function ReportShell() {
  const [student, setStudent] = useState("S001");
  const [exam, setExam] = useState("Thinking Skills");
  const [reportType, setReportType] = useState("student");

  const [shouldGenerate, setShouldGenerate] = useState(false);
  const [showPDF, setShowPDF] = useState(false);

  return (
    <div className="report-shell">
      {/* ================= FILTER BAR ================= */}
      <div className="filters-bar">
        <div className="filters-left">
          <div className="filter-group">
            <label>Student</label>
            <select
              value={student}
              onChange={e => {
                setStudent(e.target.value);
                setShouldGenerate(false);
              }}
            >
              <option value="S001">Student S001</option>
              <option value="S002">Student S002</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Exam</label>
            <select
              value={exam}
              onChange={e => {
                setExam(e.target.value);
                setShouldGenerate(false);
              }}
            >
              <option>Thinking Skills</option>
              <option>Reading</option>
              <option>Mathematics</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Report Type</label>
            <select
              value={reportType}
              onChange={e => {
                setReportType(e.target.value);
                setShouldGenerate(false);
              }}
            >
              <option value="student">Per Student Report</option>
              <option value="class">Per Class Report</option>
              <option value="cumulative">Cumulative Progress</option>
            </select>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="filters-right">
          <button
            className="secondary-btn"
            onClick={() => setShouldGenerate(true)}
          >
            Generate
          </button>

          <button
            className="primary-btn"
            disabled={!shouldGenerate}
            onClick={() => setShowPDF(true)}
          >
            Preview PDF
          </button>
        </div>
      </div>

      {/* ================= REPORT BODY ================= */}
      {shouldGenerate && (
        <>
          {reportType === "student" && (
            <StudentReportMock student={student} exam={exam} />
          )}

          {reportType === "class" && (
            <ClassReportMock exam={exam} />
          )}

          {reportType === "cumulative" && (
            <CumulativeReportMock student={student} exam={exam} />
          )}
        </>
      )}

      {/* ================= PDF PREVIEW ================= */}
      {showPDF && (
        <div className="pdf-overlay">
          <div className="pdf-modal">
            <button onClick={() => setShowPDF(false)}>Close</button>
            {reportType === "student" && <StudentReportMock />}
            {reportType === "class" && <ClassReportMock />}
            {reportType === "cumulative" && <CumulativeReportMock />}
          </div>
        </div>
      )}
    </div>
  );
}
