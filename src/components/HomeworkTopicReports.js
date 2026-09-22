import React, { useEffect, useState } from "react";
import "./HomeworkTopicReports.css";
import StudentCurrentExamReport from "./StudentCurrentExamReport";
import CumulativeReport from "./CumulativeReport";

const HomeworkTopicReports = ({ centerCode }) => {
  const [reportType, setReportType] = useState("");
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [exam, setExam] = useState("");
  const [examOptions, setExamOptions] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [homeworkAttemptId, setHomeworkAttemptId] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [classOptions, setClassOptions] = useState([]);
  const [classYearOptions, setClassYearOptions] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [dateOptions, setDateOptions] = useState([]);
  const [cumulativeOptions, setCumulativeOptions] = useState([]);
  const [selectedCumulativeAttempts, setSelectedCumulativeAttempts] = useState([]);
  const [selectedCumulativeTopic, setSelectedCumulativeTopic] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    if (!centerCode) {
      setStudents([]);
      return;
    }

    fetch(
      `${process.env.REACT_APP_API_URL}/students/by-center/${encodeURIComponent(centerCode)}`
    )
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to fetch students");
        }
        return res.json();
      })
      .then(data => {
        const normalized = (data.students || []).map(student => ({
          id: student.student_id,
          label: `${student.student_id} – ${student.name}`
        }));

        setStudents(normalized);
      })
      .catch(() => {
        setStudents([]);
      });
  }, [centerCode]);

  useEffect(() => {
    if (!centerCode) {
      setClassOptions([]);
      return;
    }

    fetch(
      `${process.env.REACT_APP_API_URL}/parent-teacher-interview/classes?center_code=${encodeURIComponent(centerCode)}`
    )
      .then(res => res.json())
      .then(data => {
        setClassOptions(data.classes || []);
      })
      .catch(error => {
        setClassOptions([]);
        console.error(error);
      });
  }, [centerCode]);

  useEffect(() => {
    if (!centerCode || !selectedClass) {
      setClassYearOptions([]);
      return;
    }

    fetch(
      `${process.env.REACT_APP_API_URL}/parent-teacher-interview/class-years?center_code=${encodeURIComponent(centerCode)}&class_name=${encodeURIComponent(selectedClass)}`
    )
      .then(res => res.json())
      .then(data => {
        setClassYearOptions(data.class_years || []);
      })
      .catch(error => {
        setClassYearOptions([]);
        console.error(error);
      });
  }, [centerCode, selectedClass]);

  useEffect(() => {
    const isPerStudent = reportType === "Per Student Report";
    const isPerClass = reportType === "Per Class Report";
    const isCumulative = reportType === "Cumulative Progress";

    if (!centerCode) {
      setExamOptions([]);
      return;
    }

    if ((isPerStudent || isCumulative) && !studentId) {
      setExamOptions([]);
      return;
    }

    if (isPerClass && (!selectedClass || !selectedYear)) {
      setExamOptions([]);
      return;
    }

    if (!isPerStudent && !isPerClass && !isCumulative) {
      setExamOptions([]);
      return;
    }

    setLoadingExams(true);

    let url;

    if (isPerClass) {
      url =
        `${process.env.REACT_APP_API_URL}/api/reports/homework/class/exams` +
        `?center_code=${encodeURIComponent(centerCode)}` +
        `&class_name=${encodeURIComponent(selectedClass)}` +
        `&class_year=${encodeURIComponent(selectedYear)}`;
    } else {
      url =
        `${process.env.REACT_APP_API_URL}/api/reports/homework/exams/available` +
        `?student_id=${encodeURIComponent(studentId)}` +
        `&center_code=${encodeURIComponent(centerCode)}`;
    }

    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to fetch homework exams");
        }
        return res.json();
      })
      .then(data => {
        console.log("Homework exams response:", data);
        console.log(
          "Thinking Skills exam options:",
          (data.exams || []).filter(
            item => item.subject === "thinking_skills"
          )
        );

        const uniqueExams = [];
        const seenSubjects = new Set();

        (data.exams || []).forEach(item => {
          const subject = item.subject;

          if (!seenSubjects.has(subject)) {
            seenSubjects.add(subject);
            uniqueExams.push(item);
          }
        });

        setExamOptions(uniqueExams);
      })
      .catch(error => {
        console.error("Homework exams error:", error);
        setExamOptions([]);
      })
      .finally(() => {
        setLoadingExams(false);
      });
  }, [
    reportType,
    studentId,
    centerCode,
    selectedClass,
    selectedYear
  ]);
    const selectedExamOption = examOptions.find(
      item => `${item.subject}:${item.id}` === String(exam)
    );

    const selectedExamId = selectedExamOption?.id || "";

    const selectedExamSubject = selectedExamOption?.subject || "";
    

    useEffect(() => {
    if (
      reportType !== "Cumulative Progress" ||
      !studentId ||
      !centerCode
    ) {
      console.log("⚠️ CLEARING CUMULATIVE OPTIONS");
      console.log("reportType:", reportType);
      console.log("studentId:", studentId);
      console.log("centerCode:", centerCode);
      console.log(
        "reportType === Cumulative Progress:",
        reportType === "Cumulative Progress"
      );
      console.log("studentId exists:", !!studentId);
      console.log("centerCode exists:", !!centerCode);

      setCumulativeOptions([]);
      return;
    }

    fetch(
      `${process.env.REACT_APP_API_URL}/api/reports/homework/cumulative/options` +
      `?student_id=${encodeURIComponent(studentId)}` +
      `&center_code=${encodeURIComponent(centerCode)}`
    )
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to fetch cumulative options");
        }
        return res.json();
      })
      .then(data => {
        console.log("CUMULATIVE OPTIONS RESPONSE:", data);

        const exams = data.exams || [];

        console.log(
          "📥 SETTING CUMULATIVE OPTIONS:",
          exams
        );

        console.log(
          "📥 SETTING CUMULATIVE OPTIONS LENGTH:",
          exams.length
        );

        setCumulativeOptions(exams);
      })
      .catch(error => {
        console.error("Cumulative options error:", error);
        setCumulativeOptions([]);
      });
  }, [
    reportType,
    studentId,
    centerCode,
  ]);
    useEffect(() => {
      console.log(
        "🔄 cumulativeOptions STATE UPDATED:",
        cumulativeOptions
      );

      console.log(
        "🔄 cumulativeOptions LENGTH:",
        cumulativeOptions.length
      );

      const languageConventions = cumulativeOptions.find(
        item => item.key === "naplan_language_conventions"
      );

      console.log(
        "🔄 NAPLAN LANGUAGE CONVENTIONS FROM STATE:",
        languageConventions
      );
    }, [cumulativeOptions]);
    const selectedCumulativeExam = cumulativeOptions.find((item) => {
      console.log("🔎 CUMULATIVE EXAM MAPPING");
      console.log("Selected exam option:", selectedExamOption);
      console.log("Selected exam subject:", selectedExamSubject);
      console.log("Current cumulative option:", item);

      if (selectedExamOption?.class_name === "oc") {
        console.log("➡️ OC mapping");

        if (selectedExamSubject === "thinking_skills") {
          console.log(
            "Thinking Skills match:",
            item.key === "oc_thinking_skills"
          );
          return item.key === "oc_thinking_skills";
        }

        if (selectedExamSubject === "mathematical_reasoning") {
          console.log(
            "Mathematical Reasoning match:",
            item.key === "oc_mathematical_reasoning"
          );
          return item.key === "oc_mathematical_reasoning";
        }

        if (selectedExamSubject === "reading_comprehension") {
          console.log(
            "Reading match:",
            item.key === "oc_reading"
          );
          return item.key === "oc_reading";
        }
      }

      // NAPLAN mapping
      if (
        selectedExamOption?.class_name &&
        selectedExamOption.class_name.toLowerCase() === "naplan"
      ) {
        console.log("➡️ NAPLAN mapping");
        console.log("NAPLAN subject:", selectedExamSubject);
        console.log("Current item key:", item.key);

        if (selectedExamSubject?.toLowerCase() === "numeracy") {
          console.log(
            "Numeracy match:",
            item.key === "naplan_numeracy"
          );

          return item.key === "naplan_numeracy";
        }

        if (
          selectedExamSubject?.toLowerCase() === "language conventions"
        ) {
          console.log(
            "Language Conventions match:",
            item.key === "naplan_language_conventions"
          );

          return item.key === "naplan_language_conventions";
        }
        if (
          selectedExamSubject?.toLowerCase() === "reading"
        ) {
          return item.key === "naplan_reading";
        }
        if (
          selectedExamSubject?.toLowerCase() === "writing"
        ) {
          return item.key === "naplan_writing";
        }
      }

      console.log(
        "➡️ Default mapping:",
        item.key,
        "===",
        selectedExamSubject,
        "=",
        item.key === selectedExamSubject
      );

      return item.key === selectedExamSubject;
    });

    console.log(
      "✅ FINAL selectedCumulativeExam:",
      selectedCumulativeExam
    );

    console.log(
      "✅ FINAL selectedCumulativeExam topics:",
      selectedCumulativeExam?.topics
    );
    const cumulativeTopics =
      selectedCumulativeExam?.topics || [];

    const selectedCumulativeTopicOption = cumulativeTopics.find(
      topic => topic.key === selectedCumulativeTopic
    );

    const cumulativeTopicAttempts =
      selectedCumulativeTopicOption?.attempts || [];
    
    console.log("CUMULATIVE EXAM DEBUG:", {
      exam,
      selectedExamOption,
      selectedExamSubject,
      cumulativeOptions,
      selectedCumulativeExam,
      cumulativeTopics,
      cumulativeTopicAttempts,
    });

    useEffect(() => {
      if (
        reportType === "Cumulative Progress" ||
        !studentId ||
        !exam ||
        !centerCode
      ) {
        setDateOptions([]);
        return;
      }

      fetch(
        `${process.env.REACT_APP_API_URL}/api/reports/homework/dates?student_id=${encodeURIComponent(studentId)}&homework_exam_id=${encodeURIComponent(selectedExamId)}&center_code=${encodeURIComponent(centerCode)}&subject=${encodeURIComponent(selectedExamSubject)}`
      )
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to fetch homework dates");
        }
        return res.json();
      })
      .then(data => {
        setDateOptions(data.dates || []);
      })
      .catch(() => {
        setDateOptions([]);
      });
  }, [studentId, exam, centerCode, reportType]);

  useEffect(() => {
    if (!exam || !centerCode) {
      setDateOptions([]);
      setSelectedDate("");
      return;
    }

    // ---------------------------------------------
    // Per Class Report
    // ---------------------------------------------
    if (
      reportType === "Per Class Report" &&
      (!selectedClass || !selectedYear)
    ) {
      setDateOptions([]);
      setSelectedDate("");
      return;
    }

    // ---------------------------------------------
    // Per Student Report
    // ---------------------------------------------
    if (reportType === "Per Student Report" && !studentId) {
      setDateOptions([]);
      setSelectedDate("");
      return;
    }

    if (reportType === "Cumulative Progress" && !studentId) {
      setDateOptions([]);
      setSelectedDate("");
      return;
    }

    let url;

    if (reportType === "Per Class Report") {
      url =
        `${process.env.REACT_APP_API_URL}/api/reports/homework/class/dates` +
        `?center_code=${encodeURIComponent(centerCode)}` +
        `&class_name=${encodeURIComponent(selectedClass)}` +
        `&class_year=${encodeURIComponent(selectedYear)}` +
        `&homework_exam_id=${encodeURIComponent(selectedExamId)}` +
        `&subject=${encodeURIComponent(selectedExamSubject)}`;
    } else {
      url =
        `${process.env.REACT_APP_API_URL}/api/reports/homework/dates` +
        `?student_id=${encodeURIComponent(studentId)}` +
        `&homework_exam_id=${encodeURIComponent(selectedExamId)}` +
        `&center_code=${encodeURIComponent(centerCode)}` +
        `&subject=${encodeURIComponent(selectedExamSubject)}`;
    }

    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to fetch homework dates");
        }
        return res.json();
      })
      .then(data => {
        if (reportType === "Cumulative Progress") {
          console.log("Cumulative homework dates:", data);
        }
        setDateOptions(data.dates || []);
      })
      .catch(error => {
        console.error("Homework dates error:", error);
        setDateOptions([]);
      });
  }, [
    reportType,
    studentId,
    centerCode,
    exam,
    selectedExamId,
    selectedExamSubject,
    selectedClass,
    selectedYear,
  ]);

const handleAddCumulativeAttempt = () => {
  if (!selectedDate) {
    return;
  }

  const selectedAttempt = cumulativeTopicAttempts.find(
    attempt => String(attempt.date) === String(selectedDate)
  );

  if (!selectedAttempt) {
    return;
  }

  const alreadySelected = selectedCumulativeAttempts.some(
    item =>
      String(item.homework_attempt_id) ===
      String(selectedAttempt.homework_attempt_id)
  );

  if (alreadySelected) {
    return;
  }

  setSelectedCumulativeAttempts(currentAttempts => [
    ...currentAttempts,
    {
      homework_attempt_id: selectedAttempt.homework_attempt_id,
      date: selectedAttempt.date,
    },
  ]);

  setSelectedDate("");
};

const handleGenerate = async () => {
  if (!centerCode || !exam || !studentId) {
    return;
  }

  if (reportType === "Cumulative Progress") {
    if (
      !selectedExamSubject ||
      !selectedCumulativeTopic ||
      selectedCumulativeAttempts.length === 0
    ) {
      return;
    }

    setLoadingReport(true);
    setReportData(null);

    try {
      const params = new URLSearchParams();

      params.append("student_id", studentId);
      params.append("subject", selectedExamSubject);
      params.append("topic", selectedCumulativeTopic);
      params.append("center_code", centerCode);

      selectedCumulativeAttempts.forEach(attempt => {
        params.append(
          "homework_attempt_ids",
          String(attempt.homework_attempt_id)
        );
      });

      const url =
        `${process.env.REACT_APP_API_URL}/api/reports/homework/cumulative` +
        `?${params.toString()}`;

      console.log("Cumulative homework report request:", {
        student_id: studentId,
        subject: selectedExamSubject,
        topic: selectedCumulativeTopic,
        homework_attempt_ids: selectedCumulativeAttempts.map(
          attempt => attempt.homework_attempt_id
        ),
        center_code: centerCode,
      });

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to generate cumulative homework report");
      }

      const data = await response.json();

      console.log("Cumulative homework report response:", data);

      setReportData(data);
    } catch (error) {
      console.error("Cumulative homework report error:", error);
      setReportData(null);
    } finally {
      setLoadingReport(false);
    }

    return;
  }

  if (!exam || !selectedDate || !centerCode) {
    return;
  }

  if (reportType === "Per Student Report" && !studentId) {
    return;
  }

  if (
    reportType === "Per Class Report" &&
    (!selectedClass || !selectedYear)
  ) {
    return;
  }

  console.log("Generate values:", {
    reportType,
    exam,
    selectedExamId,
    selectedExamSubject,
    selectedDate,
    selectedClass,
    selectedYear,
    centerCode,
    homeworkAttemptId,
  });

  setLoadingReport(true);
  setReportData(null);

  try {
    let url;

    if (reportType === "Per Class Report") {
      url =
        `${process.env.REACT_APP_API_URL}/api/reports/homework/class` +
        `?center_code=${encodeURIComponent(centerCode)}` +
        `&class_name=${encodeURIComponent(selectedClass)}` +
        `&class_year=${encodeURIComponent(selectedYear)}` +
        `&homework_exam_id=${encodeURIComponent(selectedExamId)}` +
        `&date=${encodeURIComponent(selectedDate)}` +
        `&subject=${encodeURIComponent(selectedExamSubject)}`;
    } else {
      url =
        `${process.env.REACT_APP_API_URL}/api/reports/homework/student` +
        `?student_id=${encodeURIComponent(studentId)}` +
        `&homework_exam_id=${encodeURIComponent(selectedExamId)}` +
        `&homework_attempt_id=${encodeURIComponent(selectedDate)}` +
        `&center_code=${encodeURIComponent(centerCode)}` +
        `&subject=${encodeURIComponent(selectedExamSubject)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to generate homework report");
    }

    const data = await response.json();

    console.log("Homework report response:", data);
    setReportData(data);
  } catch (error) {
    console.error("Homework report error:", error);
    setReportData(null);
  } finally {
    setLoadingReport(false);
  }
};
  return (
    <div className="homework-topic-report">
      <div className="homework-topic-report-filters">

        <div className="homework-topic-report-field">
          <label>Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="">Select report type</option>
            <option value="Per Student Report">Per Student Report</option>
            <option value="Per Class Report">Per Class Report</option>
            <option value="Cumulative Progress">Cumulative Progress</option>
            <option value="Cumulative Progress (new)">Cumulative Progress (new)</option>
          </select>
        </div>

        {reportType === "Per Student Report" && (
          <div className="homework-topic-report-field">
            <label>Student</label>
            <select
              value={studentId}
              onChange={(e) => {  
                setStudentId(e.target.value);  
                setExam("");  
                setHomeworkAttemptId(""); 
              }}
            >
              <option value="">Select student</option>
              {students.map(student => ( 
                <option key={student.id} value={student.id}> 
                  {student.label} 
                </option> 
              ))}
            </select>
          </div>
        )}

        {reportType === "Cumulative Progress" && (
          <div className="homework-topic-report-cumulative-student">
            <div className="homework-topic-report-field">
              <label>Student</label>
              <select
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  setExam("");
                  setHomeworkAttemptId("");
                }}
              >
                <option value="">Select student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="homework-topic-report-attempt-selector">
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                disabled={!cumulativeTopicAttempts.length}
              >
                <option value="">Select date</option>

                {cumulativeTopicAttempts.map(attempt => (
                  <option
                    key={attempt.homework_attempt_id}
                    value={attempt.date}
                  >
                    {new Date(attempt.date).toLocaleDateString()}
                  </option>
                ))}
              </select>

              <button type="button" onClick={handleAddCumulativeAttempt}>
                Add
              </button>
            </div>

            {selectedCumulativeAttempts.length > 0 && (
              <div className="homework-topic-report-selected-attempts">
                <div className="homework-topic-report-selected-attempts-heading">
                  Selected Attempts
                </div>
                <div className="homework-topic-report-selected-attempts-list">
                  {selectedCumulativeAttempts.map(attempt => (
                    <div
                      className="homework-topic-report-attempt-chip"
                      key={attempt.homework_attempt_id}
                    >
                      <span>{new Date(attempt.date).toLocaleDateString()}</span>
                      <button
                        type="button"
                        className="homework-topic-report-attempt-chip-remove"
                        aria-label={`Remove ${new Date(attempt.date).toLocaleDateString()}`}
                        onClick={() => {
                          setSelectedCumulativeAttempts(currentAttempts =>
                            currentAttempts.filter(
                              currentAttempt =>
                                String(currentAttempt.homework_attempt_id) !==
                                String(attempt.homework_attempt_id)
                            )
                          );
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {reportType === "Per Class Report" && ( 
          <>
            <div className="homework-topic-report-field"> 
              <label>Class</label> 
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)} 
              > 
                <option value="">Select class</option> 
                {classOptions.map(classItem => (
                  <option key={classItem.id} value={classItem.class_name}>
                    {classItem.class_name}
                  </option>
                ))}
              </select> 
            </div> 

            <div className="homework-topic-report-field"> 
              <label>Class Year</label> 
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)} 
              > 
                <option value="">Select year</option> 
                {classYearOptions.map(yearItem => (
                  <option key={yearItem.id} value={yearItem.year_name}>
                    {yearItem.year_name}
                  </option>
                ))}
              </select> 
            </div> 
          </>
        )}

       

        <div className="homework-topic-report-field homework-topic-report-row-break">
          <label>Exam</label>
          <select
            value={exam}
            onChange={(e) => {
              console.log("Selected exam value:", e.target.value);
              setExam(e.target.value);
            }}
            disabled={
              loadingExams ||
              (reportType === "Per Student Report" && !studentId) ||
              (reportType === "Cumulative Progress" && !studentId) ||
              (reportType === "Per Class Report" && (!selectedClass || !selectedYear))
            }
          >
            <option value="">
              {loadingExams ? "Loading exams..." : "Select exam"}
            </option>

            {examOptions.map(e => (
      <option key={`${e.subject}-${e.id}`} value={`${e.subject}:${e.id}`}>
                {e.label}
            </option>
            ))}
          </select>
        </div>

        {reportType === "Cumulative Progress" ? (
          <div className="homework-topic-report-field homework-topic-report-cumulative-topics">
            <label>Topics</label>
            <select
              value={selectedCumulativeTopic}
              onChange={(e) => {
                setSelectedCumulativeTopic(e.target.value);
                setSelectedDate("");
              }}
              disabled={!cumulativeTopics.length}
            >
              <option value="">Select topic</option>
              {cumulativeTopics.map(topic => (
                <option key={topic.key} value={topic.key}>
                  {topic.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="homework-topic-report-field">
            <label>Date</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="">Select date</option>

              {dateOptions.map(item => (
                <option
                  key={item.homework_attempt_id}
                  value={item.homework_attempt_id}
                >
                  {new Date(item.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="homework-topic-report-actions">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={
              loadingReport ||
              (reportType === "Cumulative Progress"
                ? !studentId ||
                  !exam ||
                  !selectedCumulativeTopic ||
                  selectedCumulativeAttempts.length === 0
                : reportType === "Per Class Report"
                  ? !selectedClass || !selectedYear || !exam || !selectedDate
                  : !studentId || !exam || !selectedDate)
            }
          >
            {loadingReport ? "Generating..." : "Generate"}
          </button>
        </div>

      </div>

      {reportData && reportType === "Per Student Report" && (
        <StudentCurrentExamReport
          data={{
            ...reportData,
            exam:
              selectedExamSubject || reportData.exam,
          }}
          centerCode={centerCode}
        />
      )}
      {reportData && reportType === "Cumulative Progress" && (
        <CumulativeReport data={reportData} />
      )}
      {reportData && reportType === "Per Class Report" && (
  <div
    style={{
      marginTop: "30px",
      background: "#f8fafc",
      borderRadius: "12px",
      padding: "24px",
      border: "1px solid #e2e8f0",
    }}
  >
    {/* Report Header */}
    <div
      style={{
        background: "#ffffff",
        borderRadius: "10px",
        padding: "22px 24px",
        border: "1px solid #e2e8f0",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: 700,
              color: "#1e293b",
            }}
          >
            {reportData.class_name} — {reportData.class_year}
          </h2>

          <p
            style={{
              margin: "8px 0 0",
              fontSize: "14px",
              color: "#64748b",
            }}
          >
            Homework Class Performance Report
          </p>
        </div>

        <div
          style={{
            textAlign: "right",
            fontSize: "14px",
            color: "#475569",
          }}
        >
          <div>
            <strong>Subject:</strong>{" "}
            {selectedExamSubject || reportData.subject}
          </div>

          <div style={{ marginTop: "5px" }}>
            <strong>Date:</strong> {reportData.date}
          </div>
        </div>
      </div>
    </div>

    {/* Summary Cards */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "16px",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "18px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            color: "#64748b",
            marginBottom: "7px",
          }}
        >
          Class Students
        </div>

        <div
          style={{
            fontSize: "25px",
            fontWeight: 700,
            color: "#1e293b",
          }}
        >
          {reportData.students_total}
        </div>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "18px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            color: "#64748b",
            marginBottom: "7px",
          }}
        >
          Completed
        </div>

        <div
          style={{
            fontSize: "25px",
            fontWeight: 700,
            color: "#1e293b",
          }}
        >
          {reportData.students_completed}
        </div>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "18px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            color: "#64748b",
            marginBottom: "7px",
          }}
        >
          Average Score
        </div>

        <div
          style={{
            fontSize: "25px",
            fontWeight: 700,
            color: "#2563eb",
          }}
        >
          {reportData.average_score}%
        </div>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "18px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            color: "#64748b",
            marginBottom: "7px",
          }}
        >
          Highest Score
        </div>

        <div
          style={{
            fontSize: "25px",
            fontWeight: 700,
            color: "#16a34a",
          }}
        >
          {reportData.highest_score}%
        </div>
      </div>
    </div>

    {/* Student Results */}
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "17px",
            fontWeight: 700,
            color: "#1e293b",
          }}
        >
          Student Results
        </h3>

        <p
          style={{
            margin: "5px 0 0",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          Performance of students who completed this homework exam
        </p>
      </div>

      <div style={{ overflowX: "auto" }}>
        {(selectedExamSubject || reportData.subject) === "writing" ? (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "900px",
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th
                  style={{
                    padding: "13px 16px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  Student
                </th>

                <th
                  style={{
                    padding: "13px 16px",
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  Writing Score
                </th>

                <th
                  style={{
                    padding: "13px 16px",
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  Score %
                </th>

                <th
                  style={{
                    padding: "13px 16px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  Readiness Band
                </th>
              </tr>
            </thead>

            <tbody>
              {(reportData.students || []).map((student) => (
                <tr
                  key={student.student_id}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#1e293b",
                    }}
                  >
                    <div>{student.student_name}</div>

                    <div
                      style={{
                        marginTop: "3px",
                        fontSize: "12px",
                        fontWeight: 400,
                        color: "#94a3b8",
                      }}
                    >
                      {student.student_code}
                    </div>
                  </td>

                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    {student.writing_score} / 25
                  </td>

                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#2563eb",
                    }}
                  >
                    {student.score}%
                  </td>

                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#475569",
                    }}
                  >
                    {student.result || "Pending"}
                  </td>
                </tr>
              ))}

              {(!reportData.students || reportData.students.length === 0) && (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      padding: "30px",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "14px",
                    }}
                  >
                    No students completed this homework exam on this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "850px",
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th
                  style={{
                    padding: "13px 16px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  Student
                </th>

                <th
                  style={{
                    padding: "13px 16px",
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  Attempted
                </th>

                <th
                  style={{
                    padding: "13px 16px",
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  Correct
                </th>

                <th
                  style={{
                    padding: "13px 16px",
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  Incorrect
                </th>

                <th
                  style={{
                    padding: "13px 16px",
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  Not Attempted
                </th>

                <th
                  style={{
                    padding: "13px 16px",
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  Accuracy
                </th>

                <th
                  style={{
                    padding: "13px 16px",
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  Score
                </th>
              </tr>
            </thead>

            <tbody>
              {(reportData.students || []).map((student) => (
                <tr
                  key={student.student_id}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#1e293b",
                    }}
                  >
                    <div>{student.student_name}</div>

                    <div
                      style={{
                        marginTop: "3px",
                        fontSize: "12px",
                        fontWeight: 400,
                        color: "#94a3b8",
                      }}
                    >
                      {student.student_code}
                    </div>
                  </td>

                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                      fontSize: "14px",
                      color: "#475569",
                    }}
                  >
                    {student.attempted}
                  </td>

                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#16a34a",
                    }}
                  >
                    {student.correct}
                  </td>

                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#dc2626",
                    }}
                  >
                    {student.incorrect}
                  </td>

                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                      fontSize: "14px",
                      color: "#64748b",
                    }}
                  >
                    {student.not_attempted}
                  </td>

                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#2563eb",
                    }}
                  >
                    {student.accuracy}%
                  </td>

                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    {student.score}%
                  </td>
                </tr>
              ))}

              {(!reportData.students || reportData.students.length === 0) && (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      padding: "30px",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "14px",
                    }}
                  >
                    No students completed this homework exam on this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default HomeworkTopicReports;