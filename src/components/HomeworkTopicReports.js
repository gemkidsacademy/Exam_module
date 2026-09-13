import React, { useEffect, useState } from "react";
import "./HomeworkTopicReports.css";
import StudentCurrentExamReport from "./StudentCurrentExamReport";

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
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [dateOptions, setDateOptions] = useState([]);
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
  if (!studentId || !centerCode) {
    setExamOptions([]);
    return;
  }

  setLoadingExams(true);

  fetch(
    `${process.env.REACT_APP_API_URL}/api/reports/homework/exams/available?student_id=${encodeURIComponent(studentId)}&center_code=${encodeURIComponent(centerCode)}`
  )
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to fetch homework exams");
      }
      return res.json();
    })
    .then(data => {
    console.log("Homework exams response:", data);

    const uniqueExams = [];
    const seenSubjects = new Set();

    (data.exams || []).forEach(exam => {
        const subject = exam.subject;

        if (!seenSubjects.has(subject)) {
        seenSubjects.add(subject);
        uniqueExams.push(exam);
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
}, [studentId, centerCode]);
    useEffect(() => {
    if (!studentId || !exam || !centerCode) {
      setHomeworkAttemptId("");
      return;
    }

    fetch(
      `${process.env.REACT_APP_API_URL}/api/reports/homework/attempt?student_id=${encodeURIComponent(studentId)}&homework_exam_id=${encodeURIComponent(exam)}&center_code=${encodeURIComponent(centerCode)}`
    )
      .then(res => {
        if (!res.ok) {
          throw new Error("No completed homework attempt found");
        }
        return res.json();
      })
      .then(data => {
        setHomeworkAttemptId(data.homework_attempt_id || "");
      })
      .catch(() => {
        setHomeworkAttemptId("");
      });
  }, [studentId, exam, centerCode]);

  useEffect(() => {
    if (!studentId || !exam || !centerCode) {
      setDateOptions([]);
      setSelectedDate("");
      return;
    }

    fetch(
      `${process.env.REACT_APP_API_URL}/api/reports/homework/dates?student_id=${encodeURIComponent(studentId)}&homework_exam_id=${encodeURIComponent(exam)}&center_code=${encodeURIComponent(centerCode)}`
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
      .catch(error => {
        console.error("Homework dates error:", error);
        setDateOptions([]);
      });
  }, [studentId, exam, centerCode]);

  const handleGenerate = async () => {
    if (!studentId || !exam || !selectedDate || !centerCode) {
      return;
    }

    setLoadingReport(true);
    setReportData(null);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/reports/homework/student?student_id=${encodeURIComponent(studentId)}&homework_exam_id=${encodeURIComponent(exam)}&homework_attempt_id=${encodeURIComponent(selectedDate)}&center_code=${encodeURIComponent(centerCode)}`
      );

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

        {reportType === "Per Class Report" && (
          <>
            <div className="homework-topic-report-field">
              <label>Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">Select class</option>
              </select>
            </div>

            <div className="homework-topic-report-field">
              <label>Class Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">Select year</option>
              </select>
            </div>
          </>
        )}

        <div className="homework-topic-report-field homework-topic-report-row-break">
          <label>Exam</label>
          <select
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            disabled={!studentId || loadingExams}
          >
            <option value="">
              {loadingExams ? "Loading exams..." : "Select exam"}
            </option>

            {examOptions.map(e => (
            <option key={e.id} value={e.id}>
                {e.label}
            </option>
            ))}
          </select>
        </div>

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

        <div className="homework-topic-report-actions">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={
              loadingReport ||
              (reportType === "Per Class Report"
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
              examOptions.find(item => String(item.id) === String(exam))?.subject ||
              reportData.exam,
          }}
          centerCode={centerCode}
        />
      )}
    </div>
  );
};

export default HomeworkTopicReports;