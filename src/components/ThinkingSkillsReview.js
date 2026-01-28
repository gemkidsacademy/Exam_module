import { useEffect, useState } from "react";

export default function ThinkingSkillsReview({ studentId, examAttemptId }) {
  const API_BASE = process.env.REACT_APP_API_URL;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log("🧩 ThinkingSkillsReview MOUNTED");


  useEffect(() => {
  console.log("🧪 Review effect check", {
    studentId,
    examAttemptId,
    API_BASE
  });

  if (!studentId || !examAttemptId) {
    console.log("⛔ Review blocked – missing params");
    return;
  }

  console.log("🚀 Review endpoint WILL be called");

  const loadReview = async () => {
    const res = await fetch(
      `${API_BASE}/api/student/exam-review/thinking-skills` +
      `?student_id=${studentId}&exam_attempt_id=${examAttemptId}`
    );
    const data = await res.json();
    console.log("📘 Review response:", data);
    setQuestions(data.questions || []);
    setLoading(false);
  };

  loadReview();
}, [studentId, examAttemptId]);

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
