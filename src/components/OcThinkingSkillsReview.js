
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
        let url = `${API_BASE}/api/student/exam-review/oc-thinking-skills?student_id=${studentId}`;

        if (examAttemptId !== null && examAttemptId !== undefined) {
          url += `&exam_attempt_id=${examAttemptId}`;
        }
        
        console.log("🌐 REVIEW URL:", url);
        
        const response = await fetch(url);

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

  }, [studentId, examAttemptId, API_BASE]);

  return (
    <p className={styles.loading}>
      Loading OC review…
    </p>
  );
}
