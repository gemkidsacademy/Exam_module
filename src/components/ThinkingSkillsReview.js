import { useEffect } from "react";
import styles from "./ThinkingSkillsReview.module.css";

export default function ThinkingSkillsReview({
  studentId,
  examAttemptId,
  attempts = [],
  onAttemptChange,
  onLoaded,
  onExit
}) {
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!studentId || !examAttemptId) return;

    const loadReviewForAttempt = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/student/exam-review/thinking-skills?student_id=${studentId}&exam_attempt_id=${examAttemptId}`
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

    loadReviewForAttempt();
  }, [studentId, examAttemptId, API_BASE, onLoaded]);

  return (
    <div className={styles.reviewWrapper}>
      
      {/* 🔽 ATTEMPT DROPDOWN */}
      {attempts.length > 0 && (
        <select
          className={styles.attemptDropdown}
          value={examAttemptId}
          onChange={(e) =>
            onAttemptChange?.(Number(e.target.value))
          }
        >
          {attempts.map((a) => (
            <option
              key={a.exam_attempt_id}
              value={a.exam_attempt_id}
            >
              {new Date(a.completed_at).toLocaleString()}
            </option>
          ))}
        </select>
      )}

      {/* ⏳ LOADING */}
      <p className={styles.loading}>
        Loading review…
      </p>

      {/* 🔙 EXIT BUTTON (optional placement) */}
      {onExit && (
        <button
          className={styles.exitButton}
          onClick={onExit}
        >
          Back to Report
        </button>
      )}
    </div>
  );
}
