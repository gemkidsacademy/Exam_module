import { useEffect } from "react";

export default function MathematicalReasoningReview({
  studentId,
  examId,
  examDates,
  selectedExamId,
  onDateChange,
  onLoaded,
  onExit,
  mode   // ✅ RECEIVE THIS
}) {
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    console.log("🧠 MathematicalReasoningReview MOUNTED");
  }, []);

  useEffect(() => {
    console.log("🚀 REVIEW useEffect triggered", {
      studentId,
      examId,
      mode
    });

    if (!studentId || !examId) {
      console.log("⛔ Skipping fetch — missing data", {
        studentId,
        examId
      });
      return;
    }

    const loadReview = async () => {
      console.log("📡 Calling review API...");

      const endpoint =
        mode === "homework"
          ? "/api/student/homework-review/mathematical-reasoning"
          : "/api/student/exam-review/mathematical-reasoning";

      const res = await fetch(
        `${API_BASE}${endpoint}?student_id=${studentId}&exam_id=${examId}`
      );

      console.log("📥 Response received", res.status);

      const data = await res.json();

      console.log("📦 REVIEW DATA:", data);

      onLoaded?.(data.questions || []);
    };

    loadReview();
  }, [studentId, examId, mode, API_BASE, onLoaded]);

  return null;
}