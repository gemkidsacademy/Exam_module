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

  const [exam, setExam] = useState("thinking_skills");
  const [date, setDate] = useState("2024-01-10");
  const [showPDF, setShowPDF] = useState(false);

  return (
    <div>

      {/* ================= FILTER BAR ================= */}
      <div className="filters-bar">

        {/* -------- Report Type -------- */}
        <div className="filter-group">
          <select
            value={reportType}
            onChange={e => {
              const next = e.target.value;
              console.log("🔁 Report type changed:", next);

              setReportType(next);
              setStudentId("");
              setClassName("");
              setClassDay("");
            }}
          >
            <option value="student">Per Student Report</option>
            <option value="class">Per Class Report</option>
            <option value="cumulative">Cumulative Progress</option>
          </select>
        </div>

        {/* -------- Student Context -------- */}
        {(reportType === "student" || reportType === "cumulative") && (
          <div className="filter-group">
            <select
              value={studentId}
              onChange={e => {
                console.log("👤 Student selected:", e.target.value);
                setStudentId(e.target.value);
              }}
            >
              <option value="">Student</option>
              <option value="S001">Student S001</option>
              <option value="S002">Student S002</option>
              <option value="S003">Student S003</option>
            </select>
          </div>
        )}

        {/* -------- Class Context -------- */}
        {reportType === "class" && (
          <div className="filter-group">
            <select
              value={className}
              onChange={e => {
                console.log("🏫 Class selected:", e.target.value);
                setClassName(e.target.value);
              }}
            >
              <option value="">Class</option>
              <option value="Class A">Class A</option>
              <option value="Class B">Class B</option>
              <option value="Class C">Class C</option>
            </select>

            <select
              value={classDay}
              onChange={e => {
                console.log("📅 Class day selected:", e.target.value);
                setClassDay(e.target.value);
              }}
            >
              <option value="">Day</option>
              <option value="Monday">Monday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Friday">Friday</option>
            </select>
          </div>
        )}

        {/* -------- Exam Context -------- */}
        <div className="filter-group">
          <select
            value={exam}
            onChange={e => {
              console.log("📘 Exam selected:", e.target.value);
              setExam(e.target.value);
            }}
          >
            <option value="thinking_skills">Thinking Skills</option>
            <option value="reading">Reading</option>
            <option value="mathematics">Mathematics</option>
            <option value="writing">Writing</option>
            <option value="Foundational">Foundational</option>
            
          </select>

          {reportType !== "cumulative" && (
            <select
              value={date}
              onChange={e => {
                console.log("🕒 Date selected:", e.target.value);
                setDate(e.target.value);
              }}
            >
              <option value="2024-01-10">10 Jan 2024</option>
              <option value="2024-02-15">15 Feb 2024</option>
            </select>
          )}
        </div>

        {/* -------- Action -------- */}
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
          <p>Please select both a class name and a class day.</p>
        </div>
      )}

      {/* ✅ CLASS REPORT */}
      {reportType === "class" && className && classDay && (
        <>
          {console.log("🚀 Rendering ClassReportMock with:", {
            className,
            classDay,
            exam,
            date
          })}

          <ClassReportMock
            className={className}
            classDay={classDay}
            exam={exam}
            date={date}
          />
        </>
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
