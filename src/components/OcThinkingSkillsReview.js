import { useEffect } from "react";
import styles from "./ThinkingSkillsReview.module.css";

export default function OcThinkingSkillsReview({
  studentId,
  examAttemptId,
  parentMode,
  onLoaded
}) {
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!studentId) {
      console.log("⚠️ No studentId provided for review");
      return;
    }

    const loadReviewQuestions = async () => {
      try {
        console.log("🚀 Loading OC Thinking Skills review");

        const endpoint =
          parentMode === "homework"
            ? "/api/student/homework-review/oc-thinking-skills"
            : "/api/student/exam-review/oc-thinking-skills";

        let url = `${API_BASE}${endpoint}?student_id=${studentId}`;

        if (
          examAttemptId !== null &&
          examAttemptId !== undefined &&
          examAttemptId !== ""
        ) {
          url += `&exam_attempt_id=${examAttemptId}`;
        }

        console.log("🌐 REVIEW URL:", url);

        const response = await fetch(url);

        console.log("📡 RESPONSE STATUS:", response.status);

        if (!response.ok) {
          throw new Error(
            `Review fetch failed with status ${response.status}`
          );
        }

        const data = await response.json();

        console.log("===== OC REVIEW API RAW RESPONSE =====");
        console.log(data);

        const questions =
          Array.isArray(data.questions)
            ? data.questions
            : Array.isArray(data.review_questions)
            ? data.review_questions
            : [];

        console.log("📚 QUESTIONS RECEIVED:", questions.length);

        questions.forEach((questionItem, index) => {
          console.log(`🧠 QUESTION ${index + 1}`, {
            q_id: questionItem.q_id,
            options: questionItem.options,
            choices: questionItem.choices,
            answer_options: questionItem.answer_options,
            student_answer: questionItem.student_answer,
            correct_answer: questionItem.correct_answer
          });
        });

        console.log("✅ Sending questions to parent component");

        onLoaded?.(questions);

        console.log("=====================================");

      } catch (error) {
        console.error(
          "❌ Failed to load OC Thinking Skills review:",
          error
        );

        onLoaded?.([]);
      }
    };

    loadReviewQuestions();

  }, [
    studentId,
    examAttemptId,
    API_BASE,
    parentMode,
    onLoaded
  ]);

  return (
    <p className={styles.loading}>
      Loading OC review...
    </p>
  );
}