import { useEffect } from "react";

export default function MathematicalReasoningReview({
  studentId,
  onLoaded
}) {
  const API_BASE = process.env.REACT_APP_API_URL;
  if (!API_BASE) {
    throw new Error("❌ REACT_APP_API_URL is not defined");
  }

   useEffect(() => {
    console.log("🧠 MathematicalReasoningReview MOUNTED");
  }, []);
  useEffect(() => {
    if (!studentId) return;

    const loadReview = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/student/exam-review/mathematical-reasoning?student_id=${studentId}`
        );

        if (!response.ok) {
          throw new Error(`Review fetch failed: ${response.status}`);
        }

        const data = await response.json();

        const questions = Array.isArray(data.questions)
          ? data.questions
          : [];

        onLoaded?.(questions);
      } catch (err) {
        console.error("Failed to load mathematical reasoning review", err);
        onLoaded?.([]);
      }
    };

    loadReview();
  }, [studentId, API_BASE, onLoaded]);

  return <p className="loading">Loading review…</p>;
}
