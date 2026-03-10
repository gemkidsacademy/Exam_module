import { useEffect } from "react";
import styles from "./NaplanNumeracyReview.module.css";

export default function NaplanNumeracyReview({
  studentId,
  onLoaded
}) {
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!studentId || !API_BASE) return;

    const loadReview = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/student/exam-review/naplan-numeracy?student_id=${studentId}`
        );

        if (!response.ok) {
          throw new Error(`Review fetch failed: ${response.status}`);
        }

        const data = await response.json();

        const questions = Array.isArray(data.questions)
          ? data.questions
          : [];

        const studentAnswers =
          data.student_answers && typeof data.student_answers === "object"
            ? data.student_answers
            : {};

        console.log("QUESTIONS:", questions);
        console.log("STUDENT ANSWERS:", studentAnswers);

        onLoaded?.(questions, studentAnswers);

      } catch (error) {
        console.error("Review load failed:", error);
        onLoaded?.([], {});
      }
    };

    loadReview();

  }, [studentId, API_BASE, onLoaded]);

  return (
    <div className={styles.reviewContainer}>
      <p className={styles.loading}>
        Loading NAPLAN Numeracy review…
      </p>
    </div>
  );
}
