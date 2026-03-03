import { useEffect } from "react";
import styles from "./NaplanNumeracyReview.module.css";

export default function NaplanNumeracyReview({
  studentId,
  onLoaded
}) {
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!studentId || !API_BASE) {
      return;
    }

    const loadNaplanNumeracyReview = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/student/exam-review/naplan-numeracy?student_id=${studentId}`
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

        const studentAnswers =
          typeof data.student_answers === "object" &&
          data.student_answers !== null
            ? data.student_answers
            : {};

        onLoaded?.(questions, studentAnswers);

      } catch (error) {
        console.error(
          "Failed to load NAPLAN Numeracy review:",
          error
        );

        onLoaded?.([], {});
      }
    };

    loadNaplanNumeracyReview();

  }, [studentId, API_BASE, onLoaded]);

  return (
    <div className={styles.reviewLoadingContainer}>
      <p className={styles.loadingText}>
        Loading NAPLAN Numeracy review…
      </p>
    </div>
  );
}
