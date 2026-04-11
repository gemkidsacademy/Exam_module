import { useEffect } from "react";

export default function OC_MathematicalReasoningReview({
  studentId,
  attemptId,
  onLoaded,
  mode   // ✅ receive parent mode
}) {
  const API_BASE = process.env.REACT_APP_API_URL;

  // 🔍 Debug
  useEffect(() => {
    console.log("🧠 OC_MR Review state:", { studentId, attemptId, mode });
  }, [studentId, attemptId, mode]);

  useEffect(() => {
    if (!studentId || !attemptId) return;

    const loadReviewOCMR = async () => {
      try {
        const endpoint =
          mode === "homework"
            ? "/api/student/homework-review/oc-mathematical-reasoning"
            : "/api/student/exam-review/oc-mathematical-reasoning";

        const url = `${API_BASE}${endpoint}?student_id=${studentId}&attempt_id=${attemptId}`;

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Failed to fetch OC MR ${mode} review`);
        }

        const data = await res.json();

        console.log(`📦 OC MR ${mode} REVIEW RESPONSE:`, data);

        onLoaded?.(data.questions || []);

      } catch (err) {
        console.error(`❌ OC MR ${mode} Review fetch error:`, err);
        onLoaded?.([]);
      }
    };

    loadReviewOCMR();

  }, [studentId, attemptId, API_BASE, mode]);

  // 🔥 No UI here
  return null;
}