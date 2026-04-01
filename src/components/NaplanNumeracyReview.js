import { useEffect } from "react";

export default function NaplanNumeracyReview({
  studentId,
  examId,
  examDates,
  selectedExamId,
  onExamChange,
  onLoaded
}) {
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!studentId || !API_BASE || !examId) return;

    const loadReviewData = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/student/exam-review/naplan-numeracy?student_id=${studentId}&exam_id=${examId}`
        );

        if (!response.ok) {
          throw new Error(`Review fetch failed: ${response.status}`);
        }

        const data = await response.json();

        const questions = Array.isArray(data.questions)
          ? data.questions
          : [];

        const studentAnswers =
          data.student_answers && typeof data.student_answers === "object"
            ? data.student_answers
            : {};

        console.log("QUESTIONS:", questions);
        console.log("STUDENT ANSWERS:", studentAnswers);

        onLoaded?.(questions, studentAnswers);

      } catch (error) {
        console.error("Review load failed:", error);
        onLoaded?.([], {});
      }
    };

    loadReviewData();
  }, [studentId, examId, API_BASE, onLoaded]);

  return (
    <div
      style={{
        height: "100vh",
        overflowY: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
        boxSizing: "border-box",
        background: "#f6f7f9"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px"
        }}
      >
        {/* HEADER */}
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          {examDates?.length > 0 && (
            <select
              className="exam-dropdown"
              value={selectedExamId || ""}
              onChange={(e) => onExamChange(Number(e.target.value))}
            >
              {examDates.map((d) => (
                <option key={d.exam_id} value={d.exam_id}>
                  {new Date(d.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          )}
        </div>

        <p
          style={{
            fontSize: "16px",
            color: "#475569",
            textAlign: "center"
          }}
        >
          Loading NAPLAN Numeracy review…
        </p>
      </div>
    </div>
  );
}
