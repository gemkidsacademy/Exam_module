import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from "react";

import "./ExamPage.css";
import styles from "./ExamPageNaplan.module.css";

import NaplanLanguageConventionsReview from "./NaplanLanguageConventionsReview";
import NaplanLanguageConventionsReport from "./NaplanLanguageConventionsReport";

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function NaplanLanguageConventions({
  onExamStart,
  onExamFinish
}) {
  const studentId = sessionStorage.getItem("student_id");
  const API_BASE = process.env.REACT_APP_API_URL;
  const IMAGE_BASE =
    "https://storage.googleapis.com/exammoduleimages/";

  if (!API_BASE) {
    throw new Error("❌ REACT_APP_API_URL is not defined");
  }

  console.log("📘 NaplanLanguageConventions MOUNTED");

  const hasSubmittedRef = useRef(false);

  /**
   * mode:
   * - loading
   * - exam
   * - report
   * - review
   */
  const [mode, setMode] = useState("loading");
  const isReview = mode === "review";

  // ---------------- EXAM STATE ----------------
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);

  // ---------------- REPORT ----------------
  const [report, setReport] = useState(null);
  const [examAttemptId, setExamAttemptId] = useState(null);

  /* ============================================================
     LOAD REPORT
  ============================================================ */
  const loadReport = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/student/exam-report/naplan-language-conventions?student_id=${studentId}`
      );

      if (!res.ok) return;

      const data = await res.json();
      console.log("📊 NAPLAN language conventions report:", data);

      setReport(data);
      setExamAttemptId(data.exam_attempt_id);
      setMode("report");
    } catch (err) {
      console.error("❌ loadReport error:", err);
    }
  }, [API_BASE, studentId]);

  /* ============================================================
     START / RESUME EXAM
  ============================================================ */
  useEffect(() => {
    if (!studentId) return;
    if (mode === "report" || mode === "review") return;

    const startExam = async () => {
      const res = await fetch(
        `${API_BASE}/api/student/start-exam/naplan-language-conventions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_id: studentId })
        }
      );

      const data = await res.json();

      if (data.completed === true) {
        await loadReport();
        return;
      }

      setQuestions(data.questions || []);
      setTimeLeft(data.remaining_time);
      setMode("exam");
      onExamStart?.();
    };

    startExam();
  }, [studentId, API_BASE, loadReport, mode, onExamStart]);

  /* ============================================================
     FINISH EXAM
  ============================================================ */
  const finishExam = useCallback(
    async (reason = "submitted") => {
      if (hasSubmittedRef.current) return;
      hasSubmittedRef.current = true;

      try {
        await fetch(
          `${API_BASE}/api/student/finish-exam/naplan-language-conventions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              student_id: studentId,
              answers
            })
          }
        );

        await loadReport();
        onExamFinish?.();
      } catch (err) {
        console.error("❌ finishExam error:", err);
      }
    },
    [API_BASE, studentId, answers, loadReport, onExamFinish]
  );

  /* ============================================================
     TIMER
  ============================================================ */
  useEffect(() => {
    if (mode !== "exam" || timeLeft === null) return;

    if (timeLeft <= 0) {
      setShowConfirmFinish(false);
      finishExam("time_expired");
      return;
    }

    if (showConfirmFinish) return;

    const interval = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, mode, showConfirmFinish, finishExam]);

  /* ============================================================
     ANSWERS
  ============================================================ */
  const handleAnswer = (value) => {
    const qid = String(questions[currentIndex]?.q_id);
    if (!qid) return;

    setAnswers(prev => ({
      ...prev,
      [qid]: value
    }));
  };

  const goToQuestion = (idx) => {
    if (idx < 0 || idx >= questions.length) return;

    const qid = String(questions[idx].q_id);
    if (!isReview) {
      setVisited(prev => ({ ...prev, [qid]: true }));
    }

    setCurrentIndex(idx);
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  /* ============================================================
     RENDER GUARDS
  ============================================================ */
  if (mode === "loading") {
    return <p className="loading">Loading…</p>;
  }

  if (mode === "exam" && !questions.length) {
    return <p className="loading">Loading…</p>;
  }

  if (mode === "report") {
    return (
      <NaplanLanguageConventionsReport
        report={report}
        onViewExamDetails={() => {
          setQuestions([]);
          setCurrentIndex(0);
          setVisited({});
          setAnswers({});
          setMode("review");
        }}
      />
    );
  }

  if (mode === "review" && !questions.length) {
    return (
      <NaplanLanguageConventionsReview
        studentId={studentId}
        examAttemptId={examAttemptId}
        onLoaded={(qs) => {
          setQuestions(qs);
          setCurrentIndex(0);
          setVisited({});
          setAnswers({});
        }}
      />
    );
  }

  /* ============================================================
     EXAM UI
  ============================================================ */
  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const optionEntries = Object.entries(currentQ.options || {});

  return (
    <div className={styles.examShell}>
      <div className={styles.examContainer}>

        <div className={styles.examHeader}>
          {!isReview && (
            <div className="timer">⏳ {formatTime(timeLeft)}</div>
          )}
          <div className="counter">
            Question {currentIndex + 1} / {questions.length}
          </div>
        </div>

        {/* QUESTION */}
        <div className="question-card">
          <p className="question-text">
            {currentQ.question_text}
          </p>

          {/* OPTIONS */}
          {optionEntries.map(([key, value]) => {
            const studentAnswer = isReview
              ? currentQ.student_answer
              : answers[String(currentQ.q_id)];
            const correctAnswer = isReview
              ? currentQ.correct_answer
              : null;

            let optionClass = "option-btn";

            if (isReview) {
              if (key === correctAnswer) {
                optionClass += " correct";
              } else if (
                studentAnswer &&
                key === studentAnswer &&
                studentAnswer !== correctAnswer
              ) {
                optionClass += " incorrect";
              }
            } else if (studentAnswer === key) {
              optionClass += " selected";
            }

            return (
              <button
                key={key}
                className={optionClass + (isReview ? " review" : "")}
                onClick={() => !isReview && handleAnswer(key)}
              >
                <strong>{key})</strong> {value}
              </button>
            );
          })}
        </div>

        {/* NAVIGATION */}
        <div className="nav-buttons">
          <button
            className="nav-btn prev"
            disabled={currentIndex === 0}
            onClick={() => goToQuestion(currentIndex - 1)}
          >
            Previous
          </button>

          {currentIndex < questions.length - 1 && (
            <button
              className="nav-btn next"
              onClick={() => goToQuestion(currentIndex + 1)}
            >
              Next
            </button>
          )}

          {currentIndex === questions.length - 1 && !isReview && (
            <button
              className="nav-btn finish"
              onClick={() => setShowConfirmFinish(true)}
            >
              Finish Exam
            </button>
          )}
        </div>
      </div>

      {/* CONFIRM SUBMIT */}
      {showConfirmFinish && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h3>Finish Exam?</h3>
            <p>
              Are you sure you want to submit?
              <br />
              You won’t be able to change answers.
            </p>

            <div className="confirm-actions">
              <button
                className="btn cancel"
                onClick={() => setShowConfirmFinish(false)}
              >
                Cancel
              </button>
              <button
                className="btn confirm"
                onClick={() => {
                  setShowConfirmFinish(false);
                  finishExam("manual_submit");
                }}
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
