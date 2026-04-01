import { useEffect } from "react";

export default function OC_MathematicalReasoningReview({
  studentId,
  attemptId,
  onLoaded
}) {
  const API_BASE = process.env.REACT_APP_API_URL;

  // 🔍 Debug (updates when attempt changes)
  useEffect(() => {
    console.log("🧠 OC_MR Review state:", { studentId, attemptId });
  }, [studentId, attemptId]);

  useEffect(() => {
    if (!studentId || !attemptId) return;

    const loadReviewOCMR = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/student/exam-review/oc-mathematical-reasoning?student_id=${studentId}&attempt_id=${attemptId}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch OC MR review");
        }

        const data = await res.json();

        console.log("📦 OC MR REVIEW RESPONSE:", data);

        onLoaded?.(data.questions || []);
      } catch (err) {
        console.error("❌ OC MR Review fetch error:", err);
        onLoaded?.([]);
      }
    };

    loadReviewOCMR();
}, [studentId, attemptId, API_BASE]);

  // 🔥 No UI here anymore
  return null;
}
