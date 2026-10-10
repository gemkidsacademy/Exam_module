import { useEffect } from "react";

export default function NaplanNumeracyReview({
   studentId,
  examId,
  onLoaded, 
  mode
}) {
  
  const API_BASE = process.env.REACT_APP_API_URL;
  //const API_BASE = "http://127.0.0.1:8000";
  useEffect(() => {
    if (!studentId || !API_BASE || !examId) return;

    const abortController = new AbortController();

    const fetchNaplanNumeracyReviewData = async () => {
      try {
        const isHomeworkMode =
          mode === "homework" || mode === "report_homework";

        const reviewUrl = isHomeworkMode
          ? `${API_BASE}/api/student/exam-review/naplan-numeracy-homework?student_id=${studentId}&exam_id=${examId}`
          : `${API_BASE}/api/student/exam-review/naplan-numeracy?student_id=${studentId}&exam_id=${examId}`;

        console.log("📘 Loading review for examId:", examId);
        console.log("📘 Review mode:", mode);
        console.log("🌐 Request URL:", reviewUrl);
        
        const response = await fetch(reviewUrl, {
          signal: abortController.signal
        });

        if (!response.ok) {
          throw new Error(`Review fetch failed: ${response.status}`);
        }

        const data = await response.json();

        console.log("========== REVIEW API DIAGNOSTICS ==========");
        console.log("Review mode:", mode);
        console.log("Request URL:", reviewUrl);
        console.log("HTTP status:", response.status);
        console.log("Full API response:", data);

        const q7276 = Array.isArray(data.questions)
          ? data.questions.find((q) => String(q.id) === "7276")
          : undefined;

        console.log("Question 7276 from API:", q7276);
        console.log("Correct answer from API:", q7276?.correct_answer);
        console.log(
          "Question keys:",
          q7276 ? Object.keys(q7276) : "Question not found"
        );
        console.log("============================================");


        const safeQuestions = Array.isArray(data.questions)
          ? data.questions
          : [];

        const safeStudentAnswers =
          data.student_answers && typeof data.student_answers === "object"
            ? data.student_answers
            : {};

        console.log("✅ Review loaded successfully");
        console.log("📦 Questions:", safeQuestions);
        console.log("📝 Student Answers:", safeStudentAnswers);

        onLoaded?.(safeQuestions, safeStudentAnswers);

      }  catch (error) {
        if (error.name === "AbortError") {
          console.log(
            "⏹️ Review request aborted"
          );
          return;
        }

        console.error(
          "🔥 Review load failed:",
          error
        );

        onLoaded?.([], {});
      }
    };

    fetchNaplanNumeracyReviewData();

    return () => {
      abortController.abort();
    };

  }, [
    studentId,
    examId,
    API_BASE,
    mode
  ]);

  return null;
}