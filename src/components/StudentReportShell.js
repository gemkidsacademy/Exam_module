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

  const [availableAttemptDates, setAvailableAttemptDates] = useState([]);
  const [selectedAttemptDates, setSelectedAttemptDates] = useState([]);
  const [pendingAttemptDate, setPendingAttemptDate] = useState("");

  const MOCK_ATTEMPT_DATES = {
    S001: ["2024-01-05", "2024-01-20", "2024-02-10", "2024-03-01"],
    S002: ["2024-01-12", "2024-02-18"],
    S003: ["2024-03-03"]
  };

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
              setReportType(next);
              setStudentId("");
              setClassName("");
              setClassDay("");
              setAvailableAttemptDates([]);
              setPendingAttemptDate("");
              setSelectedAttemptDates([]);
            }}
          >
            <option value="student">Per Student Report</option>
            <option value="class">Per Class Report</option>
            <option value="cumulative">Cumulative Progress</option>
          </select>
        </div>

        {/* -------- Student Context -------- */}
        {(reportType === "student" || reportType === "cumulative") && (
          <div className="filter-group student-with-attempts">
            <select
              value={studentId}
              onChange={e => {
                const student = e.target.value;
                setStudentId(student);
                setPendingAttemptDate("");
                setSelectedAttemptDates([]);
                setAvailableAttemptDates(
                  student ? MOCK_ATTEMPT_DATES[student] || [] : []
                );
              }}
            >
              <option value="">Student</option>
              <option value="S001">Student S001</option>
              <option value="S002">Student S002</option>
              <option value="S003">Student S003</option>
            </select>

            {/* -------- Attempt Dates (Cumulative only) -------- */}
            {reportType === "cumulative" && (
              <div className="attempt-group">
                <div className="attempt-selector">
                  <select
                    value={pendingAttemptDate}
                    disabled={!studentId}
                    onChange={e => setPendingAttemptDate(e.target.value)}
                  >
                    <option value="">Select attempt date</option>
                    {availableAttemptDates.map(date => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={!pendingAttemptDate}
                    onClick={() => {
                      if (!selectedAttemptDates.includes(pendingAttemptDate)) {
                        setSelectedAttemptDates(prev => [
                          ...prev,
                          pendingAttemptDate
                        ]);
                      }
                      setPendingAttemptDate("");
                    }}
                  >
                    Add
                  </button>
                </div>

                {selectedAttemptDates.length > 0 && (
                  <div className="selected-attempts">
                    <p>Selected Attempts:</p>
                    <ul>
                      {selectedAttemptDates.map(date => (
                        <li key={date}>
                          {new Date(date).toLocaleDateString()}
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedAttemptDates(prev =>
                                prev.filter(d => d !== date)
                              )
                            }
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* -------- Class Context -------- */}
        {reportType === "class" && (
          <div className="filter-group">
            <select
              value={className}
              onChange={e => setClassName(e.target.value)}
            >
              <option value="">Class</option>
              <option value="Class A">Class A</option>
              <option value="Class B">Class B</option>
              <option value="Class C">Class C</option>
            </select>

            <select
              value={classDay}
              onChange={e => setClassDay(e.target.value)}
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
          <select value={exam} onChange={e => setExam(e.target.value)}>
            <option value="thinking_skills">Thinking Skills</option>
            <option value="reading">Reading</option>
            <option value="mathematics">Mathematics</option>
            <option value="writing">Writing</option>
            <option value="Foundational">Foundational</option>
          </select>

          {reportType !== "cumulative" && (
            <select value={date} onChange={e => setDate(e.target.value)}>
              <option value="2024-01-10">10 Jan 2024</option>
              <option value="2024-02-15">15 Feb 2024</option>
            </select>
          )}
        </div>

        {/* -------- Action -------- */}
        <div className="filter-action">
          <button
            disabled={
              (reportType === "student" && !studentId) ||
              (reportType === "class" && (!className || !classDay)) ||
              (reportType === "cumulative" &&
                (!studentId || selectedAttemptDates.length === 0))
            }
            onClick={() => setShowPDF(true)}
          >
            Preview PDF
          </button>
        </div>
      </div>

      {/* ================= REPORT CONTENT ================= */}

      {reportType === "student" && studentId && (
        <StudentCurrentExamReport studentId={studentId} />
      )}

      {reportType === "class" && className && classDay && (
        <ClassReportMock
          className={className}
          classDay={classDay}
          exam={exam}
          date={date}
        />
      )}

      {reportType === "cumulative" &&
        studentId &&
        selectedAttemptDates.length > 0 && (
          <CumulativeReportMock
            studentId={studentId}
            exam={exam}
            attemptDates={selectedAttemptDates}
          />
        )}

      {showPDF && (
        <PDFPreviewMock onClose={() => setShowPDF(false)}>
          {reportType === "student" && studentId && (
            <StudentCurrentExamReport studentId={studentId} />
          )}

          {reportType === "class" && className && classDay && (
            <ClassReportMock
              className={className}
              classDay={classDay}
              exam={exam}
              date={date}
            />
          )}

          {reportType === "cumulative" &&
            studentId &&
            selectedAttemptDates.length > 0 && (
              <CumulativeReportMock
                studentId={studentId}
                exam={exam}
                attemptDates={selectedAttemptDates}
              />
            )}
        </PDFPreviewMock>
      )}
    </div>
  );
}
