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

    const abortController = new AbortController();

    const fetchNaplanNumeracyReviewData = async () => {
      try {
        const url = `${API_BASE}/api/student/exam-review/naplan-numeracy?student_id=${studentId}&exam_id=${examId}`;

        console.log("📘 Loading review for examId:", examId);
        console.log("🌐 Request URL:", url);

        const response = await fetch(url, {
          signal: abortController.signal
        });

        if (!response.ok) {
          throw new Error(`Review fetch failed: ${response.status}`);
        }

        const data = await response.json();

        const safeQuestions = Array.isArray(data.questions)
          ? data.questions
          : [];

        const safeStudentAnswers =
          data.student_answers && typeof data.student_answers === "object"
            ? data.student_answers
            : {};

        console.log("✅ Review loaded successfully");
        console.log("📦 Questions:", safeQuestions);
        console.log("📝 Student Answers:", safeStudentAnswers);

        onLoaded?.(safeQuestions, safeStudentAnswers);

      } catch (error) {
        if (error.name === "AbortError") {
          console.log("⏹️ Review request aborted");
          return;
        }

        console.error("🔥 Review load failed:", error);
        onLoaded?.([], {});
      }
    };

    fetchNaplanNumeracyReviewData();

    return () => {
      abortController.abort();
    };

  }, [studentId, examId, API_BASE, onLoaded]);

  return (
  <div
    style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#f6f7f9"
    }}
  >
    {/* 🔷 HEADER */}
    <div
      style={{
        padding: "16px 24px",
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      {/* Title */}
      <div style={{ fontWeight: 600 }}>
        NAPLAN Numeracy Review
      </div>

      {/* Dropdown */}
      <select
        value={selectedExamId || ""}
        onChange={(e) => {
          const newId = Number(e.target.value);
          console.log("📅 Switching exam:", newId);
          onExamChange?.(newId);
        }}
        style={{
          padding: "6px 10px",
          borderRadius: "6px",
          border: "1px solid #cbd5e1"
        }}
      >
        {examDates?.map((exam) => (
          <option key={exam.exam_id} value={exam.exam_id}>
            {new Date(exam.completed_at).toLocaleString()}
          </option>
        ))}
      </select>
    </div>

    {/* 🔄 LOADING */}
    <div
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <p style={{ color: "#475569" }}>
        Loading NAPLAN Numeracy review...
      </p>
    </div>
  </div>
);
}
