import React, { useState } from "react";
import StudentReportMock from "./StudentReportMock";
import ClassReportMock from "./ClassReportMock";
import CumulativeReportMock from "./CumulativeReportMock";
import "./Reports.css";

export default function ReportShell() {
  const [student, setStudent] = useState("S001");
  const [exam, setExam] = useState("Thinking Skills");
  const [reportType, setReportType] = useState("student");

  return (
    <div className="report-shell">

      {/* ================= TOP CONTROLS ================= */}
      <div className="filters-bar">
        <select value={student} onChange={e => setStudent(e.target.value)}>
          <option value="S001">Student S001</option>
          <option value="S002">Student S002</option>
        </select>

        <select value={exam} onChange={e => setExam(e.target.value)}>
          <option>Thinking Skills</option>
          <option>Reading</option>
          <option>Mathematics</option>
        </select>

        <select value={reportType} onChange={e => setReportType(e.target.value)}>
          <option value="student">Per Student Report</option>
          <option value="class">Per Class Report</option>
          <option value="cumulative">Cumulative Progress</option>
        </select>
      </div>

      {/* ================= REPORT BODY ================= */}
      {reportType === "student" && <StudentReportMock />}
      {reportType === "class" && <ClassReportMock />}
      {reportType === "cumulative" && <CumulativeReportMock />}

    </div>
  );
}
