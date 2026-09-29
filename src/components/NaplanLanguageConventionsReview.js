import { useEffect } from "react";
import styles from "./NaplanLanguageConventionsReview.module.css";

export default function NaplanLanguageConventionsReview({
  studentId,
  examId,
  onLoaded,
  mode
}) {
  const API_BASE = process.env.REACT_APP_API_URL;
  //const API_BASE = "http://127.0.0.1:8000";

  useEffect(() => {
    console.log("studentId:", studentId);
    console.log("examId:", examId);
    console.log("mode:", mode);
    if (
      !studentId ||
      !API_BASE ||
      examId == null
    ) {
      return;
    }

    const loadReview = async () => {
      try {
        const reviewUrl =
          mode?.includes("homework")
            ? `${API_BASE}/api/student/exam-review/naplan-language-conventions-homework?student_id=${studentId}&exam_id=${examId}`
            : `${API_BASE}/api/student/exam-review/naplan-language-conventions?student_id=${studentId}&exam_id=${examId}`;

        const response = await fetch(
          reviewUrl
        );

        if (!response.ok) {
          throw new Error(
            `NAPLAN language conventions review fetch failed with status ${response.status}`
          );
        }


        const data = await response.json();

        const rawQ15 = data.questions?.[14];

        console.log("========== RAW QUESTION 15 ==========");
        console.log("EXAM ID:", examId);
        console.log("STUDENT ID:", studentId);
        console.log("QUESTION ID:", rawQ15?.id);
        console.log("QUESTION TYPE:", rawQ15?.question_type);
        console.log("QUESTION TEXT:", rawQ15?.question_text);
        console.log("CORRECT ANSWER:", rawQ15?.correct_answer);
        console.log(
          "STUDENT ANSWER:",
          data.student_answers?.[String(rawQ15?.id)]
        );
        console.log("IS CORRECT:", rawQ15?.is_correct);
        console.log(
          "IS CORRECT TYPE:",
          typeof rawQ15?.is_correct
        );
        console.log("=====================================");

        const questions =
          Array.isArray(
            data.questions
          )
            ? data.questions.map(
                (q) => ({
                  ...q,
                  is_correct:
                    Boolean(
                      q.is_correct
                    )
                })
              )
            : [];

        const studentAnswers =
          data.student_answers &&
          typeof data.student_answers ===
            "object"
            ? data.student_answers
            : {};

        console.log(
          "LANGUAGE QUESTIONS:",
          questions
        );

        console.log(
          "LANGUAGE STUDENT ANSWERS:",
          studentAnswers
        );

        const correctCount =
          questions.filter(
            (q) => q.is_correct
          ).length;

        console.log(
          "REVIEW CORRECT COUNT:",
          correctCount
        );

        onLoaded?.(
          questions,
          studentAnswers
        );

      } catch (error) {
        console.error(
          "Failed to load NAPLAN Language Conventions review",
          error
        );

        onLoaded?.([], {});
      }
    };

    loadReview();

  }, [
    studentId,
    examId,
    API_BASE,
    onLoaded,
    mode
  ]);

  return (
    <p className={styles.loading}>
      Loading NAPLAN Language Conventions review…
    </p>
  );
}