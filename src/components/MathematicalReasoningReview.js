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
  if (!studentId || !examId) return;

  const loadReview = async () => {
    const res = await fetch(
      `${API_BASE}/api/student/exam-review/mathematical-reasoning?student_id=${studentId}&exam_id=${examId}`
    );

    const data = await res.json();

    // 🔍 KEEP YOUR DEBUGGING (very useful)
    console.log("📦 REVIEW RAW RESPONSE:", data);
    console.log("📋 QUESTIONS:", data.questions);
    console.log("🧠 FIRST QUESTION:", data.questions?.[0]);

    // 🔥 NEW DEBUG (important)
    console.log("🎯 CURRENT examId:", examId);

    onLoaded?.(data.questions || []);
  };

  loadReview();

}, [studentId, examId, API_BASE, onLoaded]);
  
  return <p className="loading">Loading review…</p>;
}
