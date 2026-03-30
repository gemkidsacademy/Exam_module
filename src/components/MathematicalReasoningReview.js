import { useEffect } from "react";

export default function MathematicalReasoningReview({
  studentId,
  examId,
  examDates,
  selectedExamId,
  onDateChange,
  onLoaded,
  onExit
}) {
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    console.log("🧠 MathematicalReasoningReview MOUNTED");
  }, []);

  useEffect(() => {
  console.log("🚀 REVIEW useEffect triggered", {
    studentId,
    examId
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

    const res = await fetch(
      `${API_BASE}/api/student/exam-review/mathematical-reasoning?student_id=${studentId}&exam_id=${examId}`
    );

    console.log("📥 Response received", res.status);

    const data = await res.json();

    console.log("📦 REVIEW DATA:", data);

    onLoaded?.(data.questions || []);
  };

  loadReview();
}, [studentId, examId, API_BASE, onLoaded]);
  
  
  return <p className="loading">Loading review…</p>;
}
