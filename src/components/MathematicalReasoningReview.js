import { useEffect } from "react";

export default function MathematicalReasoningReview({
  studentId,
  onLoaded
}) {
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    console.log("🧠 MathematicalReasoningReview MOUNTED");
  }, []);

  useEffect(() => {
    const loadReview = async () => {
      if (!studentId) {
        console.warn("⏳ studentId not ready yet");
        return;
      }

      try {
        console.log(
          "📥 Fetching mathematical reasoning review for:",
          studentId
        );

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

        console.log(
          "📊 Mathematical reasoning review loaded:",
          questions.length,
          "questions"
        );

        onLoaded?.(questions);
      } catch (err) {
        console.error(
          "❌ Failed to load mathematical reasoning review",
          err
        );
        onLoaded?.([]);
      }
    };

    loadReview();
  }, [studentId, API_BASE, onLoaded]);

  return <p className="loading">Loading review…</p>;
}
