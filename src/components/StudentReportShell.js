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
        <select
          value={reportType}
          onChange={e => {
            setReportType(e.target.value);
            setStudentId("");
            setClassName("");
            setClassDay("");
          }}
        >
          <option value="student">Per Student Report</option>
          <option value="class">Per Class Report</option>
          <option value="cumulative">Cumulative Progress</option>
        </select>
      
        {/* ================= STUDENT FILTER ================= */}
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
      
        {/* ================= CLASS FILTERS ================= */}
        {reportType === "class" && (
          <>
            <select
              value={className}
              onChange={e => setClassName(e.target.value)}
            >
              <option value="">Select Class</option>
              <option value="Class A">Class A</option>
              <option value="Class B">Class B</option>
              <option value="Class C">Class C</option>
            </select>
      
            <select
              value={classDay}
              onChange={e => setClassDay(e.target.value)}
            >
              <option value="">Select Class Day</option>
              <option value="Monday">Monday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Friday">Friday</option>
            </select>
          </>
        )}
      
        <select value={exam} onChange={e => setExam(e.target.value)}>
          <option value="thinking_skills">Thinking Skills</option>
          <option value="reading">Reading</option>
          <option value="mathematics">Mathematics</option>
          <option value="writing">Writing</option>
        </select>
      
        <select value={date} onChange={e => setDate(e.target.value)}>
          <option value="2024-01-10">10 Jan 2024</option>
          <option value="2024-02-15">15 Feb 2024</option>
        </select>
      
        <button onClick={() => setShowPDF(true)}>Preview PDF</button>
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
      {/* 🚧 GATE: class name & day must be selected */}
      {reportType === "class" && (!className || !classDay) && (
        <div className="empty-state">
          <h3>Select class details to view the report</h3>
          <p>
            Please select both a class name and a class day to view the class
            performance report.
          </p>
        </div>
      )}
      
      {/* ✅ Class report only after class + day selected */}
      {reportType === "class" && className && classDay && (
        <ClassReportMock
          className={className}
          classDay={classDay}
          exam={exam}
          date={date}
        />
      )}

      {reportType === "cumulative" && (
        <CumulativeReportMock exam={exam} />
      )}


      {showPDF && <PDFPreviewMock onClose={() => setShowPDF(false)} />}
    </div>
  );
}
