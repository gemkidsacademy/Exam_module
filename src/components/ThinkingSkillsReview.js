import { useEffect, useState } from "react";

export default function ThinkingSkillsReview({ studentId, examAttemptId }) {
  const API_BASE = process.env.REACT_APP_API_URL;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log("🧩 ThinkingSkillsReview MOUNTED");
  useEffect(() => {
  if (questions.length) {
    console.log("🧪 Review UI question snapshot:", questions[0]);
  }
}, [questions]);


  useEffect(() => {
  console.log("🧪 Review effect triggered", { studentId, API_BASE });

  if (!studentId) {
    console.log("⛔ Review blocked – missing studentId");
    return;
  }

  console.log("🚀 Calling exam-review endpoint (student-only)");

  const loadReview = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/student/exam-review/thinking-skills?student_id=${studentId}`
      );

      const data = await res.json();
      console.log("📘 Review response received:", data);

      setQuestions(data.questions || []);
    } catch (err) {
      console.error("❌ Failed to load exam review:", err);
    } finally {
      setLoading(false);
    }
  };

  loadReview();
}, [studentId, API_BASE]);

  if (loading) return <p>Loading review…</p>;

  return (
    <div>
      <h2>Exam Review</h2>
      {questions.map(q => (
        <div key={q.q_id}>
          <pre>{JSON.stringify(q, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}
