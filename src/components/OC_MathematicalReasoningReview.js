import { useEffect } from "react";

export default function OC_MathematicalReasoningReview({
  studentId,
  onLoaded
}) {
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    console.log("🧠 OC_MathematicalReasoningReview MOUNTED");
  }, []);

  useEffect(() => {
    if (!studentId) return;

    const loadReview_OC_MR = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/student/exam-review/oc-mathematical-reasoning?student_id=${studentId}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch OC MR review");
        }

        const data = await res.json();

        // 🔍 FULL RAW RESPONSE
        console.log("📦 OC MR REVIEW RAW RESPONSE:", data);

        // 🔍 QUESTIONS ONLY
        console.log("📋 OC MR QUESTIONS ARRAY:", data.questions);

        // 🔍 FIRST QUESTION
        console.log("🧠 FIRST OC MR QUESTION:", data.questions?.[0]);

        onLoaded?.(data.questions || []);
      } catch (err) {
        console.error("❌ OC MR Review fetch error:", err);
        onLoaded?.([]);
      }
    };

    loadReview_OC_MR();
  }, [studentId, API_BASE, onLoaded]);

  return <p className="loading">Loading OC Mathematical Reasoning review…</p>;
}
