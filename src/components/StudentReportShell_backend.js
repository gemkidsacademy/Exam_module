import React, { useState, useEffect } from "react";
import StudentCurrentExamReport from "./StudentCurrentExamReport";
import ClassReportMock from "./ClassReportMock";
import CumulativeReportMock from "./CumulativeReportMock";
import PDFPreviewMock from "./PDFPreviewMock";
import "./Reports.css";

export default function StudentReportShell_backend() {
  const [reportType, setReportType] = useState("class");
  const [topic, setTopic] = useState("");
  const [availableExamDates, setAvailableExamDates] = useState([]);


  const [students, setStudents] = useState([]);


  const [studentId, setStudentId] = useState("");
  const [className, setClassName] = useState("");
  const [classDay, setClassDay] = useState("");

  const [exam, setExam] = useState("");
  const [date, setDate] = useState("2024-01-10");
  const [showPDF, setShowPDF] = useState(false);

  const [availableAttemptDates, setAvailableAttemptDates] = useState([]);
  const [selectedAttemptDates, setSelectedAttemptDates] = useState([]);
  const [pendingAttemptDate, setPendingAttemptDate] = useState("");

  const [shouldGenerate, setShouldGenerate] = useState(false);
  useEffect(() => {
  if (!exam) {
    setAvailableExamDates([]);
    return;
  }

  // PER STUDENT REPORT
  if (reportType === "student" && studentId) {
    fetch(
      `https://web-production-481a5.up.railway.app/api/exams/dates?exam=${exam}&student_id=${studentId}`
    )
      .then(res => res.json())
      .then(data => {
        setAvailableExamDates(data.dates || []);
        setDate("");
      });
    return;
  }

  // PER CLASS REPORT
  if (reportType === "class") {
    fetch(
      `https://web-production-481a5.up.railway.app/api/exams/dates?exam=${exam}`
    )
      .then(res => res.json())
      .then(data => {
        setAvailableExamDates(data.dates || []);
        setDate("");
      });
  }
}, [exam, reportType, studentId]);


  useEffect(() => {
      if (!studentId || reportType !== "cumulative") {
        setAvailableAttemptDates([]);
        return;
      }
    
      fetch(
        `https://web-production-481a5.up.railway.app/api/students/${studentId}/exam-attempts?exam=${exam}`
      )
        .then(res => {
          if (!res.ok) {
            throw new Error("Failed to fetch exam attempts");
          }
          return res.json();
        })
        .then(data => {
          setAvailableAttemptDates(data.attemptDates || []);
        })
        .catch(err => {
          console.error("Error loading attempt dates:", err);
          setAvailableAttemptDates([]);
        });
    }, [studentId, exam, reportType]);

  useEffect(() => {
      fetch("https://web-production-481a5.up.railway.app/api/admin/students")
        .then(res => {
          if (!res.ok) {
            throw new Error("Failed to fetch students");
          }
          return res.json();
        })
        .then(data => {
          const normalized = data.map(s => ({
            id: s.student_id,
            label: `${s.student_id} – ${s.name}`   // ✅ ID is now displayed
          }));
          setStudents(normalized);
        })
        .catch(err => {
          console.error("Error loading students:", err);
          setStudents([]);
        });
    }, []);



  

  return (
    <div>
      {/* ================= FILTER BAR ================= */}
      <div className="filters-bar">
  <div className="filters-left">
    {/* Report Type */}
    <div className="filter-group">
      <label>Report Type</label>
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
          setShouldGenerate(false);

        }}
      >
        <option value="student">Per Student Report</option>
        <option value="class">Per Class Report</option>
        <option value="cumulative">Cumulative Progress</option>
      </select>
    </div>

    {/* Student + Attempts */}

    {(reportType === "student" || reportType === "cumulative") && (
      <div className="filter-group wide">
        <label>Student</label>
        <select
            value={studentId}
            onChange={e => {
              const student = e.target.value;
              setStudentId(student);
              setPendingAttemptDate("");
              setSelectedAttemptDates([]);
              setShouldGenerate(false);
            }}
          >
            <option value="">Select student</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>


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
                {selectedAttemptDates.map(date => (
                  <span className="attempt-chip" key={date}>
                    {new Date(date).toLocaleDateString()}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedAttemptDates(prev =>
                          prev.filter(d => d !== date)
                        )
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )}

    {/* Class Context */}
    {reportType === "class" && (
      <div className="filter-group">
        <label>Class</label>
        <select
          value={className}
          onChange={e => {
            setClassName(e.target.value);
            setShouldGenerate(false);
          }}
        >
          <option value="">Select class</option>
          <option value="Class A">Class A</option>
          <option value="Class B">Class B</option>
          <option value="Class C">Class C</option>
        </select>

        <select
          value={classDay}
          onChange={e => {
            setClassDay(e.target.value);
            setShouldGenerate(false);
          }}
        >

          <option value="">Select day</option>
          <option value="Monday">Monday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Friday">Friday</option>
        </select>
      </div>
    )}

    {/* Exam + Topics + Actions */}
<div className="exam-topics-actions-row">
  <div className="exam-topics-group">
    <div className="field">
      <label>Exam: </label>
      <select value={exam} onChange={e => setExam(e.target.value)}>
        <option value="">Select exam</option>
        <option value="thinking_skills">Thinking Skills</option>
        <option value="reading">Reading</option>
        <option value="mathematics">Mathematics</option>
        <option value="writing">Writing</option>
        <option value="foundational">Foundational</option>
      </select>

    </div>

    {reportType === "cumulative" && (
      <div className="field">
        <label>Topics: </label>
        <select value={topic} onChange={e => setTopic(e.target.value)}>
          <option value="">Select topic</option>
          <option value="comprehension">Comprehension</option>
          <option value="logic">Logic</option>
          <option value="vocabulary">Vocabulary</option>
          <option value="problem_solving">Problem Solving</option>
        </select>
      </div>
    )}

    {reportType !== "cumulative" && (
      <div className="field">
        <label>Date</label>
        <select value={date} onChange={e => setDate(e.target.value)}>
          <option value="">Select date</option>
          {availableExamDates.map(d => (
            <option key={d} value={d}>
              {new Date(d).toLocaleDateString()}
            </option>
          ))}
        </select>

      </div>
    )}
  </div>

  <div className="actions-group">
  <button
    className="secondary-btn"
    disabled={
      (reportType === "student" && !studentId) ||
      (reportType === "class" && !exam)  ||
      (reportType === "cumulative" &&
        (!studentId || selectedAttemptDates.length === 0))
    }
    onClick={() => setShouldGenerate(true)}
  >
    Generate
  </button>

  {shouldGenerate && (
    <button
      className="primary-btn"
      onClick={() => setShowPDF(true)}
    >
      Preview PDF
    </button>
  )}
</div>

</div>

</div>
</div>


      {/* ================= REPORT CONTENT ================= */}


{shouldGenerate &&
  reportType === "student" &&
  studentId && (
    <StudentCurrentExamReport studentId={studentId} />
)}

{shouldGenerate &&
  reportType === "class" &&
  className &&
  classDay && (
    <ClassReportMock
      className={className}
      classDay={classDay}
      exam={exam}
      date={date}
    />
)}

{shouldGenerate &&
  reportType === "cumulative" &&
  studentId &&
  selectedAttemptDates.length > 0 && (
    <CumulativeReportMock
      studentId={studentId}
      exam={exam}
      attemptDates={selectedAttemptDates}
    />
)}
{/* ================= PDF PREVIEW ================= */}

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
