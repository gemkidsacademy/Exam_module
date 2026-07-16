import { useEffect, useState, useRef } from "react";
import PrintRoot from "./PrintRoot";
import ReportContent from "./ReportContent";
import { useReactToPrint } from "react-to-print";
import "./SelectiveReadinessOverall.css";

const BACKEND_URL = process.env.REACT_APP_API_URL;

export default function OCReadinessOverall({ centerCode }) {

  /* =====================================
    State
  ===================================== */

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const [overall, setOverall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Used later for PDF (not yet)
  const [showPreview, setShowPreview] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSendEmail = async () => {
  if (!selectedStudent || !selectedDate || !printRef.current) return;

  setSendingEmail(true);

  try {
    // install first:
    // npm install html2pdf.js

    const html2pdf = (await import("html2pdf.js")).default;

    const element = printRef.current;

    const pdfBlob = await html2pdf()
      .from(element)
      .set({
        margin: 8,
        filename: "OC_Report.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait"
        }
      })
      .outputPdf("blob");

    const formData = new FormData();

    formData.append("student_id", selectedStudent);
    formData.append("exam_date", selectedDate);
    const pdfFile = new File(
      [pdfBlob],
      `OC_Report_${selectedStudent}.pdf`,
      { type: "application/pdf" }
    );

    formData.append("file", pdfFile);

    const res = await fetch(
      `${BACKEND_URL}/api/admin/send-oc-report-email`,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to send email");
      return;
    }

    alert("Email sent successfully ✅");
  } catch (error) {
  console.error("SEND EMAIL ERROR:", error);
  alert(error?.message || "Failed to generate/send PDF");
} finally {
    setSendingEmail(false);
  }
};

  const printRef = useRef(null);

  // Placeholder (used later)
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "OC_Readiness_Report",
  });

  /* =====================================
    Constants
  ===================================== */

  const MAX_SCORES = {
    reading: 100,
    mathematical_reasoning: 100,
    thinking_skills: 100,
    writing: 25,
  };

  const SUBJECT_LABELS = {
    reading: "Reading",
    mathematical_reasoning: "Mathematical Reasoning",
    thinking_skills: "Thinking Skills",
    writing: "Writing",
  };

  /* =====================================
    Helpers
  ===================================== */

  const normalizeScore = (subject, value) => {
    const max = MAX_SCORES[subject];

    const actualValue =
      typeof value === "object" && value !== null
        ? value.percent
        : value;

    if (actualValue == null) return 0;

    return Math.round((actualValue / max) * 100);
  };

  /* =====================================
    Derived data
  ===================================== */

  const subjectChartData =
    overall && overall.components
      ? Object.entries(overall.components).map(([k, v]) => ({
          subject: SUBJECT_LABELS[k],
          score: normalizeScore(k, v),
        }))
      : [];

  let balanceIndex = null;
  let strengths = [];
  let improvements = [];

  if (overall && overall.components) {

    const normalizedScores = Object.entries(
      overall.components
    ).map(([k, v]) => normalizeScore(k, v));

    const rawBalance =
      100 -
      (
        Math.max(...normalizedScores) -
        Math.min(...normalizedScores)
      );

    balanceIndex = Math.max(
      15,
      Math.round(rawBalance)
    );

    Object.entries(overall.components).forEach(
      ([k, v]) => {

        const pct = normalizeScore(k, v);

        if (pct >= 90)
          strengths.push(SUBJECT_LABELS[k]);
        else
          improvements.push(SUBJECT_LABELS[k]);

      }
    );
  }

  /* =====================================
    Load Students
  ===================================== */

  useEffect(() => {

    fetch(
      `${BACKEND_URL}/api/admin/oc-students?center_code=${centerCode}`
    )
      .then(res => res.json())
      .then(data =>
        setStudents(
          Array.isArray(data)
            ? data
            : []
        )
      )
      .catch(err => {

        console.error(err);

        setStudents([]);

      });

  }, [centerCode]);

  /* =====================================
    Load Report Dates
  ===================================== */

  useEffect(() => {

    if (!selectedStudent) return;

    setLoading(true);

    fetch(
      `${BACKEND_URL}/api/admin/students/${selectedStudent}/oc-report-dates`
    )
      .then(res => res.json())
      .then(data => {

        setAvailableDates(
          Array.isArray(data)
            ? data
            : []
        );

        setSelectedDate("");
        setOverall(null);

      })
      .finally(() => setLoading(false));

  }, [selectedStudent]);

  /* =====================================
    Generate Report
  ===================================== */

  const generateReport = async () => {

    if (!selectedStudent || !selectedDate)
      return;

    setLoading(true);

    setOverall(null);

    setError(null);

    try {

      const res = await fetch(

        `${BACKEND_URL}/api/admin/students/${selectedStudent}/overall-oc-report?exam_date=${selectedDate}`,

        {
          method: "POST"
        }

      );

      const data = await res.json();

      if (!res.ok) {

        setError(data);

        return;

      }

      setOverall(data);

    }

    catch {

      setError({

        message:
          "Unable to contact server."

      });

    }

    finally {

      setLoading(false);

    }

  };

  /* =====================================
    Subject Card
  ===================================== */

  function SubjectFocusCard({

    subjectKey,
    label,
    rawScore

  }) {

    const percent =
      normalizeScore(
        subjectKey,
        rawScore
      );

    const obtained =
      rawScore?.obtained ?? null;

    const total =
      rawScore?.total ?? null;

    const isWarning =
      subjectKey === "writing" &&
      percent < 95;

    let displayText = "";

    if (
      obtained !== null &&
      total !== null
    ) {

      displayText =
        `${obtained} / ${total} (${percent}%)`;

    }

    else {

      displayText =
        `${percent}%`;

    }

    return (

      <div
        className={`subject-focus ${
          isWarning
            ? "warning"
            : ""
        }`}
      >

        <h4>

          {label} Performance

        </h4>

        <div className="progress-bar">

          <div
            className="progress-fill"
            style={{
              width: `${percent}%`,
              background: isWarning
                ? "linear-gradient(90deg,#f59e0b,#f97316)"
                : "#2563eb"
            }}
          />

        </div>

        <p>

          {label} Score:

          {" "}

          {displayText}

        </p>

      </div>

    );

  }

  /* =====================================
    UI
  ===================================== */

  return (

    <div className="overall-readiness-container">

      <h2 className="overall-title">

        Overall OC Readiness

      </h2>

      <div className="selector-row">

        <label>

          Student

        </label>

        <select

          value={selectedStudent}

          onChange={(e) =>
            setSelectedStudent(
              e.target.value
            )
          }

        >

          <option value="">

            Select student

          </option>

          {students.map(student => (

            <option

              key={student.student_id}

              value={student.student_id}

            >

              {student.student_id}

            </option>

          ))}

        </select>

      </div>

      {availableDates.length > 0 && (

        <div className="selector-row">

          <label>

            Exam Date

          </label>

          <select

            value={selectedDate}

            onChange={(e) =>
              setSelectedDate(
                e.target.value
              )
            }

          >

            <option value="">

              Select Date

            </option>

            {availableDates.map(date => (

              <option

                key={date}

                value={date}

              >

                {date}

              </option>

            ))}

          </select>

        </div>

      )}

      {selectedStudent && selectedDate && (

        <div className="action-row">

          <button
            className="generate-button"
            disabled={loading}
            onClick={generateReport}
          >
            {loading
              ? "Generating..."
              : "Generate OC Readiness"}
          </button>

          {overall && (
            <>
              <button
                className="generate-button secondary"
                onClick={() => setShowPreview(true)}
              >
                Preview PDF
              </button>

              <button
                className="generate-button secondary"
                onClick={handleSendEmail}
                disabled={sendingEmail}
              >
                {sendingEmail
                  ? "Sending..."
                  : "Send Email"}
              </button>
            </>
          )}

        </div>

      )}

      {error && (

        <div className="error-box">

          <pre>

            {JSON.stringify(
              error,
              null,
              2
            )}

          </pre>

        </div>

      )}

      {overall && !error && (

        <div className="overall-summary">

          <ReportContent

            overall={overall}

            balanceIndex={balanceIndex}

            strengths={strengths}

            improvements={improvements}

            subjectChartData={subjectChartData}

            SUBJECT_LABELS={SUBJECT_LABELS}

            SubjectFocusCard={SubjectFocusCard}

          />

        </div>

      )}
      {showPreview && overall && (
        <div className="pdf-modal-overlay">
          <div className="pdf-modal">

            <div className="pdf-toolbar">

              <button onClick={handlePrint}>
                Save / Print PDF
              </button>

              <button onClick={() => setShowPreview(false)}>
                Close
              </button>

            </div>

            <div className="pdf-preview-body">

              <PrintRoot
                  reportType="oc"
                  overall={overall}
                  balanceIndex={balanceIndex}
                  strengths={strengths}
                  improvements={improvements}
                  subjectChartData={subjectChartData}
                  SUBJECT_LABELS={SUBJECT_LABELS}
              />

            </div>

          </div>
        </div>
      )}
      <div className="print-only">

        <PrintRoot
          ref={printRef}
          reportType="oc"
          overall={overall}
          balanceIndex={balanceIndex}
          strengths={strengths}
          improvements={improvements}
          subjectChartData={subjectChartData}
          SUBJECT_LABELS={SUBJECT_LABELS}
        />

      </div>

    </div>

  );

}