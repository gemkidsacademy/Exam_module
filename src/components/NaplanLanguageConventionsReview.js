import { useEffect } from "react";
import styles from "./NaplanLanguageConventionsReview.module.css";

export default function NaplanLanguageConventionsReview({
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
          `${API_BASE}/api/student/exam-review/naplan-language-conventions?student_id=${studentId}`
        );

        if (!response.ok) {
          throw new Error(
            `NAPLAN language conventions review fetch failed with status ${response.status}`
          );
        }

        const data = await response.json();

        const questions = Array.isArray(data.questions)
          ? data.questions.map((q) => ({
              ...q,
              is_correct: Boolean(q.is_correct)
            }))
          : [];
        
        const studentAnswers =
          data.student_answers && typeof data.student_answers === "object"
            ? data.student_answers
            : {};
        
        console.log("LANGUAGE QUESTIONS:", questions);
        console.log("LANGUAGE STUDENT ANSWERS:", studentAnswers);
        
        const correctCount = questions.filter((q) => q.is_correct).length;
        console.log("REVIEW CORRECT COUNT:", correctCount);        
        onLoaded?.(questions, studentAnswers);
      } catch (error) {
        console.error(
          "Failed to load NAPLAN Language Conventions review",
          error
        );
        onLoaded?.([]);
      }
    };

    loadReview();
  }, [studentId, examAttemptId, API_BASE, onLoaded]);

  return (
    <p className={styles.loading}>
      Loading NAPLAN Language Conventions review…
    </p>
  );
}
