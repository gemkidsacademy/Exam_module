import { useEffect } from "react";
import styles from "./NaplanNumeracyReview.module.css";

export default function NaplanNumeracyReview({
  studentId,
  examAttemptId,
  onLoaded
}) {
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!studentId) {
      return;
    }

    const loadReview = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/student/exam-review/naplan-numeracy?student_id=${studentId}`
        );

        if (!response.ok) {
          throw new Error(
            `NAPLAN numeracy review fetch failed with status ${response.status}`
          );
        }

        const data = await response.json();

        const questions = Array.isArray(data.questions)
          ? data.questions
          : [];

        onLoaded?.(questions);
      } catch (error) {
        console.error(
          "Failed to load NAPLAN numeracy review",
          error
        );
        onLoaded?.([]);
      }
    };

    loadReview();
  }, [studentId, examAttemptId, API_BASE, onLoaded]);

  return (
    <p className={styles.loading}>
      Loading NAPLAN Numeracy review…
    </p>
  );
}
