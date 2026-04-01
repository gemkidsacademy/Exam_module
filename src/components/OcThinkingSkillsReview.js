
import { useEffect } from "react";
import styles from "./ThinkingSkillsReview.module.css";

export default function OcThinkingSkillsReview({
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
          `${API_BASE}/api/student/exam-review/oc-thinking-skills?student_id=${studentId}`
        );

        if (!response.ok) {
          throw new Error(`Review fetch failed with status ${response.status}`);
        }

        const data = await response.json();

        console.log("===== OC REVIEW API RAW RESPONSE =====");
        console.log(data);

        const questions = Array.isArray(data.questions)
          ? data.questions
          : [];

        questions.forEach((q, i) => {
          console.log(`OC REVIEW QUESTION ${i + 1}`, {
            q_id: q.q_id,
            options: q.options,
            choices: q.choices,
            answer_options: q.answer_options
          });
        });

        console.log("===================================");

        onLoaded?.(questions);

      } catch (error) {
        console.error("Failed to load OC thinking skills review", error);
        onLoaded?.([]);
      }
    };

    loadReview();

  }, [studentId, examAttemptId, API_BASE, onLoaded]);

  return (
    <p className={styles.loading}>
      Loading OC review…
    </p>
  );
}
