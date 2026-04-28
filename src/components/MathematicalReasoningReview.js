import { useEffect } from "react";

export default function MathematicalReasoningReview({
  studentId,
  examId,
  examDates,
  selectedExamId,
  onDateChange,
  onLoaded,
  onExit,
  mode,        // UI state (exam/report/review)
  variant      // 👈 NEW (actual | homework)
}) {
  const API_BASE = process.env.REACT_APP_API_URL;
  //const API_BASE = "http://127.0.0.1:8000";


  useEffect(() => {
    console.log("🧠 MathematicalReasoningReview MOUNTED");
  }, []);

  useEffect(() => {
    console.log("🚀 REVIEW useEffect triggered", {
      studentId,
      examId,
      mode,
      variant
    });

    if (!studentId || !examId) {
      console.log("⛔ Skipping fetch — missing data", {
        studentId,
        examId
      });
      return;
    }

    const loadReviewForMR = async () => {
      try {
        console.log("📡 Calling review API...");

        const endpoint =
          variant === "homework"
            ? "/api/student/homework-review/mathematical-reasoning"
            : "/api/student/exam-review/mathematical-reasoning";

        console.log("🌐 Endpoint:", endpoint);

        const res = await fetch(
          `${API_BASE}${endpoint}?student_id=${studentId}&exam_id=${examId}`
        );

        console.log("📥 Response received", res.status);

        if (!res.ok) {
          throw new Error(`Review fetch failed: ${res.status}`);
        }

        const data = await res.json();

        console.log("📦 REVIEW DATA:", data);

        onLoaded?.(data.questions || []);

      } catch (err) {
        console.error("❌ Failed to load MR review", err);
        onLoaded?.([]);
      }
    };

    loadReviewForMR();

  }, [studentId, examId, variant, API_BASE, onLoaded]);

  return null;
}