import { useEffect } from "react";

export default function ThinkingSkillsReview({
  studentId,
  examAttemptId,
  onLoaded
}) {
  const API_BASE = process.env.REACT_APP_API_URL;

  console.log("🧩 ThinkingSkillsReview MOUNTED (loader)");

  useEffect(() => {
    console.log("🧪 Review effect triggered", { studentId, examAttemptId });

    if (!studentId) {
      console.log("⛔ Review blocked – missing studentId");
      return;
    }

    const loadReview = async () => {
      try {
        console.log("🚀 Calling exam-review endpoint");

        const res = await fetch(
          `${API_BASE}/api/student/exam-review/thinking-skills?student_id=${studentId}`
        );

        if (!res.ok) {
          throw new Error(`Review fetch failed: ${res.status}`);
        }

        const data = await res.json();
        console.log("📘 Review response received:", data);
         console.log("🧪 Review payload shape check:", {
          sample: data.questions?.[0]
        });
        // 🔑 Hand data back to parent
        onLoaded?.(data.questions || []);

      } catch (err) {
        console.error("❌ Failed to load exam review:", err);
      }
    };

    loadReview();
  }, [studentId, examAttemptId, API_BASE, onLoaded]);

  // ⛔ No UI here — parent renders everything
  return <p className="loading">Loading review…</p>;
}
