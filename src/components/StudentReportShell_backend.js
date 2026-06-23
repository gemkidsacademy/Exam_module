  import React, { useState, useEffect } from "react";
  import StudentCurrentExamReport from "./StudentCurrentExamReport";
  import ClassReportMock from "./ClassReportMock";
  import CumulativeReport from "./CumulativeReport";
  
  import PDFPreviewMock from "./PDFPreviewMock";
  import ClassCurrentExamReport from "./ClassCurrentExamReport";
  import CumulativeReport_new from "./CumulativeReport_new";
         
  import "./Reports.css";
  
  export default function StudentReportShell_backend({
  centerCode
}) {
    const [reportType, setReportType] = useState("class");
    const [topic, setTopic] = useState("");
    const [availableExamDates, setAvailableExamDates] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [loadingReport, setLoadingReport] = useState(false);
    const [reportError, setReportError] = useState(null);
    const [selectedClassDay, setSelectedClassDay] = useState("");
    const [availableClassDates, setAvailableClassDates] = useState([]);
    const [examOptions, setExamOptions] = useState([]);
    const [loadingExams, setLoadingExams] = useState(false);
    const API_BASE = process.env.REACT_APP_API_URL;
    


    if (!API_BASE) {
      throw new Error("❌ REACT_APP_API_URL is not defined");
    }
    
    console.log("🧪 API_BASE (vercel):", API_BASE);


  
  
  
  
    const [students, setStudents] = useState([]);
    const [dateWarning, setDateWarning] = useState("");
  
  
  
    const [studentId, setStudentId] = useState("");
    const [className, setClassName] = useState("");
    const [classYear, setClassYear] = useState("");
    const [availableYears, setAvailableYears] = useState([]);

   
  
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
  
    const [availableTopics, setAvailableTopics] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [topicsError, setTopicsError] = useState(null);
    
  
  
  
  
  
    const [shouldGenerate, setShouldGenerate] = useState(false);
    useEffect(() => {
  // Only run for class report
  if (reportType !== "class" || !className) {
    return;
  }

  console.log("📡 Fetching exams for class/category:", className);

  setLoadingExams(true);

  fetch(`${API_BASE}/api/exams/by-category?category=${encodeURIComponent(className)}`)
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to fetch exams for class/category");
      }
      return res.json();
    })
    .then(data => {
      console.log("✅ Class exams received:", data.exams);
      setExamOptions(data.exams || []);
    })
    .catch(err => {
      console.error("❌ Class exam fetch error:", err);
      setExamOptions([]);
    })
    .finally(() => {
      setLoadingExams(false);
    });

}, [className, reportType]);
useEffect(() => {
  console.log("YEARS EFFECT FIRED", {
    reportType,
    className,
    centerCode
  });

  if (reportType !== "class" || !className) {
    console.log("ABORTED");
    return;
  }

  console.log("FETCHING YEARS");

  fetch(
    `${API_BASE}/api/classes/years?` +
    `category=${encodeURIComponent(className)}` +
    `&center_code=${encodeURIComponent(centerCode)}`
  )
    .then(res => {
      console.log("STATUS", res.status);
      return res.json();
    })
    .then(data => {
      console.log("YEARS RECEIVED", data);
      setAvailableYears(data.years || []);
    })
    .catch(err => {
      console.error(err);
    });

}, [className, reportType]);    
    useEffect(() => {
  // Guard conditions
      if (!date || !studentId) return;
    
      const fetchClassNameForStudent = async () => {
        try {
          console.log("📡 Fetching class for:", studentId, "on date:", date);
    
          const res = await fetch(
            `${API_BASE}/api/students/class?student_id=${studentId}`
          );
    
          if (!res.ok) {
            throw new Error("Failed to fetch class name");
          }
    
          const data = await res.json();
    
          console.log("✅ Class received:", data.class_name);
    
          setClassName(data.class_name);  // 🔥 update state
    
        } catch (err) {
          console.error("❌ Error fetching class:", err);
          setClassName("");
        }
      };
    
      fetchClassNameForStudent();
    
    }, [date, studentId]);
    useEffect(() => {
      if (!studentId) {
        setExamOptions([]);
        return;
      }
    
      setLoadingExams(true);
    
      fetch(`${API_BASE}/api/exams/available?student_id=${studentId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error("Failed to fetch exams");
          }
          return res.json();
        })
        .then(data => {
          setExamOptions(data.exams || []);
        })
        .catch(err => {
          console.error("Exam fetch error:", err);
          setExamOptions([]);
        })
        .finally(() => {
          setLoadingExams(false);
        });
    
    }, [studentId]);

    useEffect(() => {
  console.log("🟢 STUDENT EXAM DATES EFFECT", {
    reportType,
    studentId,
    exam
  });

  if (
    reportType !== "student" ||
    !studentId ||
    !exam
  ) {
    setAvailableExamDates([]);
    return;
  }

  const examKey = exam?.toLowerCase().trim();
  
  const isNaplanExam = examKey?.startsWith("naplan");
  const isOCExam = examKey?.startsWith("oc");
  
  let url = "";
  
  if (isNaplanExam) {
    url = `${API_BASE}/api/exams/dates/naplan?exam=${examKey}&student_id=${studentId}`;
  } else if (isOCExam) {
    url = `${API_BASE}/api/exams/dates/oc?exam=${examKey}&student_id=${studentId}`;
  } else {
    url = `${API_BASE}/api/exams/dates?exam=${examKey}&student_id=${studentId}`;
  }
  
  console.log("🚀 FINAL URL (student):", url);
  
  fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to fetch student exam dates");
      }
      return res.json();
    })
    .then(data => {
      console.log("📅 Dates received:", data.dates);
      setAvailableExamDates(data.dates || []);
    })
    .catch(err => {
      console.error("Student exam dates error:", err);
      setAvailableExamDates([]);
    });

}, [studentId, exam, reportType]);

    useEffect(() => {
  console.log("🏫 CLASS SESSION DATES EFFECT FIRED", {
    reportType,
    className,
    exam
  });

  if (
    reportType !== "class" ||
    !className ||
    !classYear ||
    !exam ||
    !centerCode
  ) {
    setAvailableClassDates([]);
    return;
  }

  fetch(
    `${API_BASE}/api/classes/${encodeURIComponent(
      className
    )}/exam-dates?` +
    `exam=${encodeURIComponent(exam)}` +
    `&student_year=${encodeURIComponent(classYear)}` +
    `&center_code=${encodeURIComponent(centerCode)}`
  )
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to fetch class dates");
      }
      return res.json();
    })
    .then(data => {
      console.log("CLASS DATES RECEIVED:", data);
      console.log("CLASS DATES ARRAY:", data.dates);

      setAvailableClassDates(data.dates || []);
    })
    .catch(err => {
      console.error("Error loading class dates:", err);
      setAvailableClassDates([]);
    });
}, [
  reportType,
  className,
  classYear,
  centerCode,
  exam
]);

    useEffect(() => {
  console.log("🟡 CUMULATIVE EFFECT CHECK", {
    shouldGenerate,
    reportType,
    studentId,
    exam,
    topic,
    selectedAttemptDates
  });

  // =======================
  // Guard conditions
  // =======================

  if (!shouldGenerate) {
    console.log("⛔ Aborted: shouldGenerate is false");
    return;
  }

  if (reportType !== "cumulative") {
    console.log("⛔ Aborted: reportType is not cumulative");
    setShouldGenerate(false);
    return;
  }

  if (!studentId || !exam || !topic) {
    console.log("⛔ Aborted: missing required params", {
      studentId,
      exam,
      topic
    });
    setShouldGenerate(false);
    return;
  }

  if (selectedAttemptDates.length === 0) {
    console.log("⛔ Aborted: no attempt dates selected");
    setShouldGenerate(false);
    return;
  }

  // =======================
  // Build request
  // =======================

  console.log("🚀 Preparing cumulative report request", {
    studentId,
    exam,
    topicSentToBackend: topic,
    attemptDates: selectedAttemptDates,
    topicType: typeof topic,
    topicLength: topic.length
  });

  setLoadingCumulative(true);
  setCumulativeError(null);
  setCumulativeReportData(null);

  const params = new URLSearchParams();
  params.append("student_id", studentId);
  params.append("exam", exam);
  params.append("topic", topic);

  selectedAttemptDates.forEach(date =>
    params.append("attempt_dates", date)
  );

  const requestUrl = `${API_BASE}/api/reports/student/cumulative?${params.toString()}`;

  console.log("🌐 FINAL CUMULATIVE REQUEST URL:", requestUrl);

  // =======================
  // Fetch
  // =======================

  fetch(requestUrl)
    .then(async res => {
      const data = await res.json();

      if (!res.ok && res.status === 400) {
        console.warn("⚠️ No data for cumulative report", data);
        setCumulativeError("No data found to generate the required report.");
        return null;
      }

      if (!res.ok) {
        throw new Error(data.detail || "Failed to load cumulative report");
      }

      return data;
    })
    .then(data => {
      if (!data) return;

      console.log("✅ CUMULATIVE REPORT RECEIVED", data);
      setCumulativeReportData(data);
    })
    .catch(err => {
      console.error("❌ Cumulative report error:", err);
      setCumulativeError(err.message);
    })
    .finally(() => {
      setLoadingCumulative(false);
      setShouldGenerate(false); // 🔒 reset trigger
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
    !shouldGenerate ||
    reportType !== "class" ||
    !className ||
    !classYear ||
    !exam ||
    !date
  ) {
    return;
  }

  setLoadingClassReport(true);
  setClassReportError(null);
  setClassReportData(null);
  console.log("selectedClassDay =", selectedClassDay);

  const endpoint = "/api/reports/class";

  const url =
    `${API_BASE}${endpoint}` +
    `?class_name=${encodeURIComponent(className)}` +
    `&class_year=${encodeURIComponent(classYear)}` +
    `&center_code=${encodeURIComponent(centerCode)}` +
    `&exam=${encodeURIComponent(exam)}` +
    `&date=${encodeURIComponent(date)}`;

  console.log("CLASS REPORT URL:", url);
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

}, [
  shouldGenerate,
  reportType,
  className,
  classYear,
  centerCode,
  exam,
  date,
  selectedClassDay
]);
  
  
    
  
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
    const examKey = exam?.toLowerCase().trim();

    const url =
      examKey === "writing"
        ? `${API_BASE}/api/reports/student/writing?student_id=${studentId}&date=${date}&class_name=${className}`
        : `${API_BASE}/api/reports/student?student_id=${studentId}&exam=${examKey}&date=${date}&class_name=${className}`; 
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
    fetch(`${API_BASE}/api/classes`)
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
      console.log("🟦 TOPICS EFFECT CHECK", {
        reportType,
        exam
      });
    
      // Only relevant for cumulative reports
      if (reportType !== "cumulative") {
        console.log("⛔ Skipping topics fetch (not cumulative)");
        return;
      }
    
      if (!exam) {
        console.log("⛔ Skipping topics fetch (no exam)");
        setAvailableTopics([]);
        return;
      }
    
      console.log("📘 FETCHING TOPICS FOR EXAM:", exam);
    
      setLoadingTopics(true);
      setTopicsError(null);
    
      fetch(
        `${API_BASE}/api/exams/${exam}/topics`
      )
        .then(res => {
          if (!res.ok) {
            throw new Error("Failed to load topics");
          }
          return res.json();
        })
        .then(data => {
          console.log("✅ TOPICS RECEIVED", data.topics);
          setAvailableTopics(data.topics || []);
          // ⚠️ DO NOT reset topic here
        })
        .catch(err => {
          console.error("❌ Topics load error:", err);
          setAvailableTopics([]);
          setTopicsError(err.message);
        })
        .finally(() => {
          setLoadingTopics(false);
        });
    }, [exam, reportType]);

  
    useEffect(() => {
      console.log("CUMULATIVE SESSION DATES EFFECT FIRED", {
        reportType,
        studentId,
        exam
      });
    
      if (
        (reportType !== "cumulative" && reportType !== "topic") ||
        !studentId ||
        !exam
      ) {
        setAvailableAttemptDates([]);
        return;
      }
    
      const examKey = exam?.toLowerCase().trim();

      const isNaplanExam = examKey?.startsWith("naplan");
      const isOCExam = examKey?.startsWith("oc");
      
      let url = "";
      
      if (isNaplanExam) {
        url = `${API_BASE}/api/exams/dates/naplan?exam=${examKey}&student_id=${studentId}`;
      } else if (isOCExam) {
        url = `${API_BASE}/api/exams/dates/oc?exam=${examKey}&student_id=${studentId}`;
      } else {
        url = `${API_BASE}/api/exams/dates?exam=${examKey}&student_id=${studentId}`;
      }
      
      console.log("🚀 FINAL URL (student):", url); 
      fetch(url)
        .then(res => {
          if (!res.ok) {
            throw new Error("Failed to fetch exam dates");
          }
          return res.json();
        })
        .then(data => {
          setAvailableAttemptDates(data.dates || []);
        })
        .catch(err => {
          console.error("Error loading cumulative session dates:", err);
          setAvailableAttemptDates([]);
        });
    }, [studentId, exam, reportType]);
  
    useEffect(() => {

  if (!centerCode) {
    setStudents([]);
    return;
  }

  console.log(
    "📡 Fetching students for center:",
    centerCode
  );

  fetch(
    `${API_BASE}/students/by-center/${encodeURIComponent(centerCode)}`
  )
    .then(res => {

      if (!res.ok) {
        throw new Error("Failed to fetch students");
      }

      return res.json();
    })

    .then(data => {

      console.log(
        "✅ Students received:",
        data
      );

      const normalized = (
        data.students || []
      ).map(student => ({

        id: student.student_id,

        label: `${student.student_id} – ${student.name}`

      }));

      setStudents(normalized);
    })

    .catch(err => {

      console.error(
        "❌ Error loading students:",
        err
      );

      setStudents([]);
    });

}, [centerCode]);
  
    
  
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
            setCumulativeReportData(null);
          
            if (next !== "cumulative") {
              setAvailableTopics([]);
              setTopic("");
            }
          
            setShouldGenerate(false);
          }}
  
        >
          <option value="student">Per Student Report</option>
          <option value="class">Per Class Report</option>
          <option value="cumulative">Cumulative Progress</option>
          <option value="topic">Cumulative Progress (new)</option>
        </select>
      </div>
  
      {/* Student + Attempts */}
  
      {(reportType === "student" || reportType === "cumulative" || reportType === "topic") && (
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
  
  
          {(reportType === "cumulative" || reportType === "topic") && (
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
  <>
    <div className="filter-group">
      <label>Class</label>

      <select
        value={className}
        onChange={e => {
          const selectedClass = e.target.value;

          setClassName(selectedClass);

          setClassYear("");
          setExam("");
          setDate("");

          setAvailableYears([]);
          setAvailableClassDates([]);
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

    <div className="filter-group">
      <label>Class Year</label>

      <select
        value={classYear}
        onChange={e => setClassYear(e.target.value)}
        disabled={!className}
      >
        <option value="">Select year</option>

        {availableYears.map(year => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  </>
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
                const selectedExam = e.target.value;   // ✅ define it first

                console.log("Selected exam:", selectedExam);
                
                setExam(e.target.value);
                setDate("");
                setDateWarning("");
              }}
              disabled={
                loadingExams ||
                (reportType === "student" && !studentId) ||
                (reportType === "class" && !className)
              }
            >
              <option value="">
                {loadingExams ? "Loading exams..." : "Select exam"}
              </option>
            
              {examOptions.map(e => (
                <option key={e.key} value={e.key}>
                  {e.label}
                </option>
              ))}
            </select>
        </div>
  
        {/* Date (non-cumulative only) */}
        {reportType !== "cumulative" && reportType !== "topic" && (
  <div className="field">
    <label>Date</label>
    <select
      value={date}
      disabled={
        !exam ||
        (reportType === "class"
          ? availableClassDates.length === 0
          : availableExamDates.length === 0)
      }

      onChange={e => {
        setDate(e.target.value);
        setDateWarning("");
      }}
    >
      <option value="">Select date</option>

      {(reportType === "class"
        ? availableClassDates
        : availableExamDates
      ).map(d => (
        <option key={d} value={d}>
          {new Date(d).toLocaleString("en-AU", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </option>
      ))}
    </select>

    <p className="error">{dateWarning || "\u00A0"}</p>
  </div>
)}

      </div>
  
      {/* Topics (cumulative only) */}
      {reportType === "cumulative" && (
        <div className="field">
          <label>Topics</label>
      
          <select
            value={topic}
            disabled={loadingTopics || availableTopics.length === 0}
            onChange={e => {
              const selected = e.target.value;
              console.log("🟣 TOPIC SELECTED (UI):", selected);
              setTopic(selected);
            }}
          >

            <option value="">
              {loadingTopics ? "Loading topics..." : "Select topic"}
            </option>
      
            {availableTopics.map(t => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
      
          {topicsError && (
            <p className="error">{topicsError}</p>
          )}
        </div>
      )}
  
    </div>
  
    {/* ================= ACTIONS ================= */}
    <div className="actions-group">
      {reportType !== "topic" && (
        <button
          className="secondary-btn"
          disabled={
            (reportType === "student" && !studentId) ||
            (reportType === "class" &&
              (
                !className ||
                !classYear ||
                !exam ||
                !date
              )) ||
            (reportType === "cumulative" &&
              (!studentId || selectedAttemptDates.length === 0))
          }
          onClick={() => {
      
            if (reportType === "cumulative") {

                if (!topic) {
                  return;
                }

                setShouldGenerate(true);
                return;
              }
      
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
      )}
  
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
    <StudentCurrentExamReport
      data={reportData}
      centerCode={centerCode}
    />
  )}
  {loadingCumulative && !cumulativeError && (reportType === "cumulative" || reportType === "topic") && (
    <p>Loading cumulative progress…</p>
  )}
  {cumulativeError && reportType === "cumulative" && (
    <div className="info-message">
      {cumulativeError}
    </div>
  )}
  
    
  {reportType === "class" &&
    classReportData?.reports?.length > 0 && (
      <div className="filter-group">
        <label>Class Day</label>
        <select
          value={selectedClassDay || ""}
          onChange={e => setSelectedClassDay(e.target.value)}
        >
          <option value="">
            All Class Days
          </option>

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
    classReportData?.reports &&
    (
      selectedClassDay
        ? classReportData.reports.filter(
            r => r.class_day === selectedClassDay
          )
        : [classReportData.combined_report]
    ).map(report => (
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
  {reportType === "topic" && (
    <CumulativeReport_new
    studentId={studentId}
    exam={exam}
    topic={topic}
    attemptDates={selectedAttemptDates}
    topics={availableTopics}
    API_BASE={API_BASE}
  />
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
  
  
  
  