import { useEffect } from "react";

export default function MathematicalReasoningReview({
  studentId,
  onLoaded,
  onExit
}) {
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    console.log("🧠 MathematicalReasoningReview MOUNTED");
  }, []);

  useEffect(() => {
  if (!studentId) return;

  const loadReview = async () => {
    const res = await fetch(
      `${API_BASE}/api/student/exam-review/mathematical-reasoning?student_id=${studentId}`
    );

    const data = await res.json();

    // 🔍 FULL RAW RESPONSE
    console.log("📦 REVIEW RAW RESPONSE:", data);

    // 🔍 QUESTIONS ONLY
    console.log("📋 REVIEW QUESTIONS ARRAY:", data.questions);

    // 🔍 FIRST QUESTION (most important)
    console.log("🧠 FIRST REVIEW QUESTION:", data.questions?.[0]);

    onLoaded?.(data.questions || []);
  };

  loadReview();
}, [studentId, API_BASE, onLoaded]);

  return <p className="loading">Loading review…</p>;
}
