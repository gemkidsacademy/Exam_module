
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
    console.log(
      "========== OC THINKING SKILLS REVIEW DEBUG =========="
    );

    console.log("👤 studentId:", studentId);
    console.log("📝 examAttemptId:", examAttemptId);
    console.log("🔍 parentMode:", parentMode);
    console.log("🔍 parentMode type:", typeof parentMode);
    console.log("🌐 API_BASE:", API_BASE);

    if (!studentId) {
      console.log("⚠️ No studentId provided. Request cancelled.");
      return;
    }

    const loadReviewQuestions = async () => {
      try {
        console.log("🚀 Starting OC Thinking Skills review request");

        // Determine which review endpoint to use.
        const isHomework =
          parentMode === "homework" ||
          parentMode === "report_homework";

        console.log("🏠 Is homework mode:", isHomework);

        const endpoint = isHomework
          ? "/api/student/homework-review/oc-thinking-skills"
          : "/api/student/exam-review/oc-thinking-skills";

        console.log("🎯 Selected endpoint:", endpoint);

        // Construct the request URL.
        const params = new URLSearchParams({
          student_id: studentId
        });

        if (
          examAttemptId !== null &&
          examAttemptId !== undefined &&
          examAttemptId !== ""
        ) {
          params.append("exam_attempt_id", examAttemptId);
        }

        const url = `${API_BASE}${endpoint}?${params.toString()}`;

        console.log("🌐 FINAL REVIEW URL:", url);
        console.log("📤 Sending review API request...");

        const response = await fetch(url);

        console.log("📡 RESPONSE STATUS:", response.status);
        console.log("📡 RESPONSE URL:", response.url);

        if (!response.ok) {
          const errorBody = await response.text();

          console.error("❌ REVIEW API ERROR:", {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            responseBody: errorBody,
            parentMode,
            isHomework,
            selectedEndpoint: endpoint
          });

          throw new Error(
            `Review fetch failed with status ${response.status}`
          );
        }

        const data = await response.json();

        console.log("===== OC REVIEW API RAW RESPONSE =====");
        console.log(data);

        const questions = Array.isArray(data.questions)
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
      } finally {
        console.log(
          "========== END REVIEW DEBUG =========="
        );
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
