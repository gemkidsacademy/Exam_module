import { useEffect } from "react";
import styles from "./ThinkingSkillsReview.module.css";

export default function ThinkingSkillsReview({
  mode,
  variant,   // 👈 NEW (actual | homework)
  studentId,
  examAttemptId,
  onLoaded,
  onExit
}) {
  const API_BASE = process.env.REACT_APP_API_URL;
  //const API_BASE = "http://127.0.0.1:8000";

  useEffect(() => {
    console.log("🧠 Review received examAttemptId:", examAttemptId);
    console.log("🧠 Review variant:", variant);
  }, [examAttemptId, variant]);

  useEffect(() => {
    if (!studentId || !examAttemptId) return;

    const loadReviewForAttemptThinkingSkills = async () => {
      try {
        const reviewEndpoint =
          variant === "homework"
            ? "/api/student/homework-review/thinking-skills"
            : "/api/student/exam-review/thinking-skills";

        console.log("🔍 REVIEW MODE:", mode);
        console.log("📦 REVIEW VARIANT:", variant);
        console.log("🌐 REVIEW ENDPOINT:", reviewEndpoint);

        const response = await fetch(
          `${API_BASE}${reviewEndpoint}?student_id=${studentId}&exam_attempt_id=${examAttemptId}`
        );

        if (!response.ok) {
          throw new Error(
            `Review fetch failed with status ${response.status}`
          );
        }

        const data = await response.json();

        console.log("===== REVIEW API (ATTEMPT-BASED) =====");
        console.log("Attempt ID:", examAttemptId);
        console.log(data);

        const questions = Array.isArray(data.questions)
          ? data.questions
          : [];

        questions.forEach((q, i) => {
          console.log(`REVIEW QUESTION ${i + 1}`, {
            q_id: q.q_id,
            student_answer: q.student_answer,
            correct_answer: q.correct_answer
          });
        });

        console.log("======================================");

        onLoaded?.(questions);

      } catch (error) {
        console.error("Failed to load thinking skills review", error);
        onLoaded?.([]);
      }
    };

    loadReviewForAttemptThinkingSkills();

  }, [studentId, examAttemptId, API_BASE, onLoaded, mode, variant]);

  return (
    <div className={styles.reviewWrapper}>
      <p className={styles.loading}>
        Loading review…
      </p>
    </div>
  );
}