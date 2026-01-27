import React, { useState, useEffect } from "react";
import StudentCurrentExamReport from "./StudentCurrentExamReport";
import ClassReportMock from "./ClassReportMock";
import CumulativeReport from "./CumulativeReport";

import PDFPreviewMock from "./PDFPreviewMock";
import ClassCurrentExamReport from "./ClassCurrentExamReport";

import "./Reports.css";

export default function StudentReportShell_backend() {
  const [reportType, setReportType] = useState("class");
  const [topic, setTopic] = useState("");
  const [availableExamDates, setAvailableExamDates] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [selectedClassDay, setSelectedClassDay] = useState("");




  const [students, setStudents] = useState([]);
  const [dateWarning, setDateWarning] = useState("");



  const [studentId, setStudentId] = useState("");
  const [className, setClassName] = useState("");
 

  const [exam, setExam] = useState("");
  const [date, setDate] = useState("");
  const [showPDF, setShowPDF] = useState(false);

  const [availableAttemptDates, setAvailableAttemptDates] = useState([]);
  const [selectedAttemptDates, setSelectedAttemptDates] = useState([]);
  const [pendingAttemptDate, setPendingAttemptDate] = useState("");
  const [classes, setClasses] = useState([]);
  
  const [classReportData, setClassReportData] = useState(null);
  const [loadingClassReport, setLoadingClassReport] = useState(false);
  const [classReportError, setClassReportError] = useState(null);

  const [cumulativeReportData, setCumulativeReportData] = useState(null);
  const [loadingCumulative, setLoadingCumulative] = useState(false);
  const [cumulativeError, setCumulativeError] = useState(null);




  const [shouldGenerate, setShouldGenerate] = useState(false);
  useEffect(() => {
    if (
      !shouldGenerate ||
      reportType !== "cumulative" ||
      !studentId ||
      !exam ||
      !topic ||
      selectedAttemptDates.length === 0
    ) {
      return;
    }
  
    setLoadingCumulative(true);
    setCumulativeError(null);
    setCumulativeReportData(null);
  
    const params = new URLSearchParams();
    params.append("student_id", studentId);
    params.append("exam", exam);
    params.append("topic", topic);
    selectedAttemptDates.forEach(d =>
      params.append("attempt_dates[]", d)
    );
  
    fetch(
      `https://web-production-481a5.up.railway.app/api/reports/student/cumulative?${params.toString()}`
    )
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to load cumulative report");
        }
        return res.json();
      })
      .then(data => {
        setCumulativeReportData(data);
      })
      .catch(err => {
        console.error("Cumulative report load error:", err);
        setCumulativeError(err.message);
      })
      .finally(() => {
        setLoadingCumulative(false);
        setShouldGenerate(false);
      });
  }, [
    shouldGenerate,
    reportType,
    studentId,
    exam,
    topic,
    selectedAttemptDates
  ]);

  useEffect(() => {
  if (
    reportType === "class" &&
    classReportData?.reports?.length > 0 &&
    !selectedClassDay
  ) {
    setSelectedClassDay(classReportData.reports[0].class_day);
  }
}, [classReportData, reportType, selectedClassDay]);

  useEffect(() => {
  if (
    !shouldGenerate ||
    reportType !== "class" ||
    !className ||    
    !exam ||
    !date
  ) {
    return;
  }

  setLoadingClassReport(true);
  setClassReportError(null);
  setClassReportData(null);

  const url = `https://web-production-481a5.up.railway.app/api/reports/class?class_name=${encodeURIComponent(
  className
)}&exam=${exam}&date=${date}`;

  fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to load class report");
      }
      return res.json();
    })
    .then(data => {
      setClassReportData(data);
    })
    .catch(err => {
      console.error("Class report load error:", err);
      setClassReportError(err.message);
    })
    .finally(() => {
      setLoadingClassReport(false);
      setShouldGenerate(false);
    });
}, [shouldGenerate, reportType, className, exam, date]);


  

  useEffect(() => {
  // Only generate when explicitly requested
  if (
    !shouldGenerate ||
    reportType !== "student" ||
    !studentId ||
    !exam ||
    !date
  ) {
    return;
  }

  setLoadingReport(true);
  setReportError(null);

  // 🔑 Route writing and MCQ to correct endpoints
  const url =
    exam === "writing"
      ? `https://web-production-481a5.up.railway.app/api/reports/student/writing?student_id=${studentId}&date=${date}`
      : `https://web-production-481a5.up.railway.app/api/reports/student?student_id=${studentId}&exam=${exam}&date=${date}`;

  fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to load student report");
      }
      return res.json();
    })
    .then(data => {
      setReportData(data);
    })
    .catch(err => {
      console.error("Student report load error:", err);
      setReportError(err.message);
      setReportData(null);
    })
    .finally(() => {
      setLoadingReport(false);
      setShouldGenerate(false); // reset trigger
    });

}, [shouldGenerate, reportType, studentId, exam, date]);

  useEffect(() => {
  fetch("https://web-production-481a5.up.railway.app/api/classes")
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to fetch classes");
      }
      return res.json();
    })
    .then(data => {
      setClasses(data.classes || []);
    })
    .catch(err => {
      console.error("Error loading classes:", err);
      setClasses([]);
    });
}, []);

  
  
  useEffect(() => {
  if (!exam) {
    setAvailableExamDates([]);
    return;
  }

  
  // PER STUDENT REPORT
  if (reportType === "student" && studentId) {
    const url =
      exam === "writing"
        ? `https://web-production-481a5.up.railway.app/api/exams/writing/dates?student_id=${studentId}`
        : `https://web-production-481a5.up.railway.app/api/exams/dates?exam=${exam}&student_id=${studentId}`;
  
    fetch(url)
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
      console.log("CUMULATIVE ATTEMPT EFFECT FIRED", {
        reportType,
        studentId,
        exam
      });

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
          {classes.map(cls => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>


        
      </div>
    )}

    {/* Exam + Topics + Actions */} 
<div className="exam-topics-actions-row">
  {/* ================= EXAM / TOPICS / DATE ================= */}
  <div className="exam-topics-group">

    {/* 🔑 Exam + Date locked on one row */}
    <div className="exam-row">
      {/* Exam */}
      <div className="field">
        <label>Exam</label>
        <select
          value={exam}
          onChange={e => {
            setExam(e.target.value);
            setDate("");
            setDateWarning("");
          }}
        >
          <option value="">Select exam</option>
          <option value="thinking_skills">Thinking Skills</option>
          <option value="reading">Reading</option>
          <option value="mathematical_reasoning">
            Mathematical Reasoning
          </option>
          <option value="writing">Writing</option>
          <option value="foundational">Foundational</option>
        </select>
      </div>

      {/* Date (non-cumulative only) */}
      {reportType !== "cumulative" && (
        <div className="field">
          <label>Date</label>
          <select
            value={date}
            disabled={!exam}
            onChange={e => {
              setDate(e.target.value);
              setDateWarning("");
            }}
          >
            <option value="">Select date</option>
            {availableExamDates.map(d => (
              <option key={d} value={d}>
                {new Date(d).toLocaleDateString()}
              </option>
            ))}
          </select>

          {/* 🔒 Reserved space so layout never jumps */}
          <p className="error">{dateWarning || "\u00A0"}</p>
        </div>
      )}
    </div>

    {/* Topics (cumulative only) */}
    {reportType === "cumulative" && (
      <div className="field">
        <label>Topics</label>
        <select value={topic} onChange={e => setTopic(e.target.value)}>
          <option value="">Select topic</option>
          <option value="comprehension">Comprehension</option>
          <option value="logic">Logic</option>
          <option value="vocabulary">Vocabulary</option>
          <option value="problem_solving">Problem Solving</option>
        </select>
      </div>
    )}
  </div>

  {/* ================= ACTIONS ================= */}
  <div className="actions-group">
    <button
      className="secondary-btn"
      disabled={
        (reportType === "student" && !studentId) ||
        (reportType === "class" && !exam) ||
        (reportType === "cumulative" &&
          (!studentId || selectedAttemptDates.length === 0))
      }
      onClick={() => {
        if (reportType === "student" && !date) {
          setDateWarning("Please select a date before generating the report.");
          return;
        }

        setDateWarning("");
        setShouldGenerate(true);
      }}
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
</div> {/* end filters-left */}
</div>   {/* end filters-bar */}
  

      {/* ================= REPORT CONTENT ================= */}


{loadingReport && reportType === "student" && (
  <p>Loading report…</p>
)}

{reportError && reportType === "student" && (
  <p className="error">{reportError}</p>
)}


{reportData && reportType === "student" && (
  <StudentCurrentExamReport data={reportData} />
)}
{loadingCumulative && reportType === "cumulative" && (
  <p>Loading cumulative progress…</p>
)}

{cumulativeError && reportType === "cumulative" && (
  <p className="error">{cumulativeError}</p>
)}

{reportType === "class" &&
  classReportData?.reports?.length > 0 && (
    <div className="filter-group">
      <label>Class Day</label>
      <select
        value={selectedClassDay}
        onChange={e => setSelectedClassDay(e.target.value)}
      >
        {classReportData.reports.map(r => (
          <option key={r.class_day} value={r.class_day}>
            {r.class_day}
          </option>
        ))}
      </select>
    </div>
)}

{/* ===== CLASS REPORT ===== */}

{loadingClassReport && reportType === "class" && (
  <p>Loading class report…</p>
)}

{classReportError && reportType === "class" && (
  <p className="error">{classReportError}</p>
)}

{reportType === "class" &&
  classReportData?.reports
    ?.filter(r => r.class_day === selectedClassDay)
    .map(report => (
      <div key={report.class_day} className="class-day-section">
        <div className="class-day-label">
          {report.class_day}
        </div>

        <ClassCurrentExamReport
          data={{
            class_name: classReportData.class_name,
            exam: classReportData.exam,
            date: classReportData.date,
            ...report
          }}
        />
      </div>
))}

{reportType === "cumulative" && cumulativeReportData && (
  <CumulativeReport data={cumulativeReportData} />
)}
{/* ================= PDF PREVIEW ================= */}

{showPDF && (
  <PDFPreviewMock onClose={() => setShowPDF(false)}>
    {reportType === "student" && reportData && (
      <StudentCurrentExamReport data={reportData} />
    )}


    {reportType === "class" &&
      classReportData?.reports
        ?.filter(r => r.class_day === selectedClassDay)
        .map(report => (
          <ClassCurrentExamReport
            key={report.class_day}
            data={{
              class_name: classReportData.class_name,
              exam: classReportData.exam,
              date: classReportData.date,
              ...report
            }}
          />
    ))}



    {reportType === "cumulative" && cumulativeReportData && (
      <CumulativeReport data={cumulativeReportData} />
    )}

  </PDFPreviewMock>
)}

    </div>
  );
}




