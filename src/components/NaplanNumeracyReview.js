import { useEffect } from "react";

export default function NaplanNumeracyReview({
  studentId,
  examId,
  examDates,
  selectedExamId,
  onExamChange,
  onLoaded,
  mode
}) {
  const API_BASE = process.env.REACT_APP_API_URL;
  //const API_BASE = "http://127.0.0.1:8000";
  useEffect(() => {
    if (!studentId || !API_BASE || !examId) return;

    const abortController = new AbortController();

    const fetchNaplanNumeracyReviewData = async () => {
      try {
        const reviewUrl =
          mode === "homework"
            ? `${API_BASE}/api/student/exam-review/naplan-numeracy-homework?student_id=${studentId}&exam_id=${examId}`
            : `${API_BASE}/api/student/exam-review/naplan-numeracy?student_id=${studentId}&exam_id=${examId}`;

        console.log("📘 Loading review for examId:", examId);
        console.log("🌐 Request URL:", reviewUrl);

        const response = await fetch(reviewUrl, {
          signal: abortController.signal
        });

        if (!response.ok) {
          throw new Error(
            `Review fetch failed: ${response.status}`
          );
        }

        const data = await response.json();

        const safeQuestions = Array.isArray(
          data.questions
        )
          ? data.questions
          : [];

        const safeStudentAnswers =
          data.student_answers &&
          typeof data.student_answers === "object"
            ? data.student_answers
            : {};

        console.log("✅ Review loaded successfully");
        console.log("📦 Questions:", safeQuestions);
        console.log(
          "📝 Student Answers:",
          safeStudentAnswers
        );

        onLoaded?.(
          safeQuestions,
          safeStudentAnswers
        );

      } catch (error) {
        if (error.name === "AbortError") {
          console.log(
            "⏹️ Review request aborted"
          );
          return;
        }

        console.error(
          "🔥 Review load failed:",
          error
        );

        onLoaded?.([], {});
      }
    };

    fetchNaplanNumeracyReviewData();

    return () => {
      abortController.abort();
    };

  }, [
    studentId,
    examId,
    API_BASE,
    onLoaded,
    mode
  ]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f6f7f9"
      }}
    >
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