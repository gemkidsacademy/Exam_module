import { useEffect } from "react";
import styles from "./MathematicalReasoningReview.module.css";

export default function MathematicalReasoningReview({
  studentId,
  examAttemptId,
  onLoaded
}) {
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!studentId || !examAttemptId) {
      return;
    }

    const loadReview = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/student/exam-review/mathematical-reasoning?student_id=${studentId}&exam_attempt_id=${examAttemptId}`
        );

        if (!response.ok) {
          throw new Error(
            `Review fetch failed with status ${response.status}`
          );
        }

        const data = await response.json();

        const questions = Array.isArray(data.questions)
          ? data.questions
          : [];

        onLoaded?.(questions);
      } catch (error) {
        console.error(
          "Failed to load mathematical reasoning review",
          error
        );
        onLoaded?.([]);
      }
    };

    loadReview();
  }, [studentId, examAttemptId, API_BASE, onLoaded]);

  return (
    <p className={styles.loading}>
      Loading review…
    </p>
  );
}
