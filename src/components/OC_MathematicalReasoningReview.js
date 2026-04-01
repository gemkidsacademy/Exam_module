import { useEffect } from "react";

export default function OC_MathematicalReasoningReview({
  studentId,
  attemptId,
  attempts,
  onChangeAttempt,
  reviewQuestions,   // ✅ ADD THIS
  onLoaded
}) {
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    console.log("🧠 OC_MR Review mounted", { studentId, attemptId });
  }, []);

  useEffect(() => {
    if (!studentId || !attemptId) return;

    const loadReview_OC_MR = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/student/exam-review/oc-mathematical-reasoning?student_id=${studentId}&attempt_id=${attemptId}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch OC MR review");
        }

        const data = await res.json();

        console.log("📦 OC MR REVIEW RAW RESPONSE:", data);

        onLoaded?.(data.questions || []);
      } catch (err) {
        console.error("❌ OC MR Review fetch error:", err);
        onLoaded?.([]);
      }
    };

    loadReview_OC_MR();
  }, [studentId, attemptId, API_BASE, onLoaded]);

  return (
  <div style={{ padding: "16px" }}>

    {/* ✅ DROPDOWN */}
    <div style={{ marginBottom: "16px" }}>
      <select
        value={attemptId || ""}
        onChange={(e) => onChangeAttempt(Number(e.target.value))}
        style={{
          padding: "8px 12px",
          borderRadius: "6px",
          border: "1px solid #ccc"
        }}
      >
        {attempts?.map((a) => (
          <option key={a.attempt_id} value={a.attempt_id}>
            {new Date(a.completed_at).toLocaleString()}
          </option>
        ))}
      </select>
    </div>

    {/* ✅ CONDITIONAL CONTENT */}
    {!reviewQuestions || reviewQuestions.length === 0 ? (
      <p className="loading">Loading OC Mathematical Reasoning review…</p>
    ) : (
      <div>
        <h3>Review Loaded: {reviewQuestions.length} questions</h3>

        {/* TEMP DEBUG */}
        <pre style={{ fontSize: "12px" }}>
          {JSON.stringify(reviewQuestions[0], null, 2)}
        </pre>
      </div>
    )}

  </div>
);
}
