import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from "react";
import "./NaplanNumeracyExam.css";

//import "./ExamPage.css";
import styles from "./ExamPageThinkingSkills.module.css";

import NaplanNumeracyReview from "./NaplanNumeracyReview";
import NaplanNumeracyReport from "./NaplanNumeracyReport";

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function NaplanNumeracy({
  onExamStart,
  onExamFinish
}) {
  const studentId = sessionStorage.getItem("student_id");
  const API_BASE = process.env.REACT_APP_API_URL;
  const TYPE_2_MAX_SELECTIONS = 2;

  if (!API_BASE) {
    throw new Error("❌ REACT_APP_API_URL is not defined");
  }

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
  const normalizeCorrectAnswer = (correctAnswer, questionType) => {
    if (correctAnswer == null) return null;

    if (typeof correctAnswer === "object" && correctAnswer.value !== undefined) {
      correctAnswer = correctAnswer.value;
    }

    if (questionType === 2) {
      if (Array.isArray(correctAnswer)) return correctAnswer;

      if (typeof correctAnswer === "string") {
        try {
          return JSON.parse(correctAnswer.replace(/'/g, '"'));
        } catch {
          return [];
        }
      }

      return [];
    }

    return String(correctAnswer);
  };

  const normalizeStudentAnswer = (answer, questionType) => {
    if (answer == null) return null;

    // TYPE 2 — MCQ MULTI
    if (questionType === 2) {
      if (Array.isArray(answer)) {
        return [...answer].sort(); // order-independent
      }

      if (typeof answer === "string") {
        try {
          return JSON.parse(answer.replace(/'/g, '"')).sort();
        } catch {
          return [];
        }
      }

      return [];
    }

    // All single-answer types (1, 3, 4, 5, 6, 7)
    return String(answer).trim();
  };


  // ---------------- REPORT ----------------
  const [report, setReport] = useState(null);
  const [examAttemptId, setExamAttemptId] = useState(null);

  /* ============================================================
     LOAD REPORT
  ============================================================ */
  const loadReport = useCallback(async () => {
    const res = await fetch(
      `${API_BASE}/api/student/exam-report/naplan-numeracy?student_id=${studentId}`
    );

    if (!res.ok) return;

    const data = await res.json();
    setReport(data);
    setExamAttemptId(data.exam_attempt_id);
    setMode("report");
  }, [API_BASE, studentId]);
  

  /* ============================================================
     START / RESUME EXAM
  ============================================================ */
  useEffect(() => {
    if (!studentId) return;
  
    // ✅ HARD STOP: never restart exam after submit
    if (hasSubmittedRef.current) return;
  
    // 🚦 Do not start exam in these modes
    if (mode === "report" || mode === "review" || mode === "submitting") {
      return;
    }
  
    const startExam = async () => {
      const res = await fetch(
        `${API_BASE}/api/student/start-exam/naplan-numeracy`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_id: studentId })
        }
      );
    
      const data = await res.json();
    
      // 🔍 DEBUG: print full exam payload
      console.log("📘 START-EXAM RESPONSE:", data);
      console.log("📘 QUESTIONS:", data.questions);
    
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
  const finishExam = useCallback(async () => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
  
    // ✅ Blank screen immediately
    setMode("submitting");
  
    try {
      await fetch(
        `${API_BASE}/api/student/finish-exam/naplan-numeracy`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_id: studentId, answers })
        }
      );
  
      await loadReport();
      onExamFinish?.();
    } catch (err) {
      console.error("Finish exam failed", err);
    }
  }, [API_BASE, studentId, answers, loadReport, onExamFinish]);
  /* ============================================================
     TIMER
  ============================================================ */
  useEffect(() => {
    if (mode !== "exam" || timeLeft === null) return;

    if (timeLeft <= 0) {
      setShowConfirmFinish(false);
      finishExam();
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
    const qid = String(questions[currentIndex]?.id);
    if (!qid) return;
  
    setAnswers(prev => ({ ...prev, [qid]: value }));
    setVisited(prev => ({ ...prev, [qid]: true }));
  };
  const handleAnswerForQuestion = (questionId, value) => {
    const qid = String(questionId);
    if (!qid) return;
  
    setAnswers(prev => ({ ...prev, [qid]: value }));
    setVisited(prev => ({ ...prev, [qid]: true }));
  };

  const goToQuestion = (idx) => {
    if (idx < 0 || idx >= questions.length) return;

    const qid = String(questions[idx].id);
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
  
  if (mode === "submitting") {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <h3>Submitting your exam…</h3>
          <p>Please wait. Do not refresh.</p>
          <div className="spinner" />
        </div>
      </div>
    );
  }
  
  if (mode === "exam" && !questions.length) {
    return <p className="loading">Loading…</p>;
  }
  
  
  
  if (mode === "review" && !questions.length) {
    return (
      <NaplanNumeracyReview
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
  const currentQ =
  mode === "report" ? null : questions[currentIndex];


  const hasImageMultiSelect =
    currentQ.question_blocks?.some(
      (b) =>
        b.type === "image-multi-select" &&
        Array.isArray(b.options) &&
        b.options.some(opt => opt.image && opt.image.trim() !== "")
    );

  const isCorrect =
    mode === "review"
      ? (() => {
          const correct = normalizeCorrectAnswer(
            currentQ.correct_answer,
            currentQ.question_type
          );

          const student = normalizeStudentAnswer(
            answers[String(currentQ.id)],
            currentQ.question_type
          );

          // TYPE 2 — MCQ MULTI
          if (currentQ.question_type === 2) {
            return (
              Array.isArray(student) &&
              Array.isArray(correct) &&
              student.length === correct.length &&
              student.every(v => correct.includes(v))
            );
          }

          return student === correct;
        })()
      : null;


  const normalizedCorrectAnswer = normalizeCorrectAnswer(
    currentQ.correct_answer,
    currentQ.question_type
  );

  return (
  <div className={`exam-shell ${styles.examShell}`}>
    <div className={`exam-container ${styles.examContainer}`}>

      {mode === "report" ? (
        <div className="naplan-report-scroll">
          <NaplanNumeracyReport
            report={report}
            onViewExamDetails={() => {
              setQuestions([]);
              setCurrentIndex(0);
              setVisited({});
              setAnswers({});
              setMode("review");
            }}
          />
        </div>
      ) : (
        <div className="exam-content">

          {/* HEADER */}
          <div className={styles.examHeader}>
            {!isReview && (
              <div className="timer">⏳ {formatTime(timeLeft)}</div>
            )}
            <div className="counter">
              Question {currentIndex + 1} / {questions.length}
            </div>
          </div>

          {/* QUESTION INDEX */}
          <div className={styles.indexRow}>
            {questions.map((q, i) => {
              let cls = styles.indexCircle;
              const qid = String(q.id);

              if (
                answers[qid] !== undefined &&
                (typeof answers[qid] !== "object" || answers[qid].length > 0)
              ) {
                cls += ` ${styles.indexAnswered}`;
              } else if (visited[qid]) {
                cls += ` ${styles.indexVisited}`;
              } else {
                cls += ` ${styles.indexNotVisited}`;
              }

              return (
                <div
                  key={q.id}
                  className={cls}
                  onClick={() => goToQuestion(i)}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>

          {/* QUESTION CARD */}
          <div className="question-card">
            <div className="question-content-centered">

              {/* FALLBACK QUESTION TEXT */}
              {!currentQ.question_blocks?.some(b => b.type === "text") &&
                currentQ.question_text && (
                  <p className="question-text">
                    {currentQ.question_text}
                  </p>
                )}

              {currentQ.question_blocks?.map((block, idx) => {
                if (block.type === "text") {
                  return (
                    <p key={idx} className="question-text">
                      {block.content}
                    </p>
                  );
                }

                if (block.type === "image") {
                  const src =
                    block.src ||
                    (block.name
                      ? `${process.env.REACT_APP_IMAGE_BASE_URL}/${block.name}`
                      : null);

                  if (!src) return null;

                  return (
                    <img
                      key={idx}
                      src={src}
                      alt="question visual"
                      className="question-image"
                    />
                  );
                }

                return null;
              })}

              {/* TYPE 4 — TEXT INPUT */}
              {currentQ.question_type === 4 && (
                <textarea
                  className="text-input"
                  rows={2}
                  value={answers[String(currentQ.id)] || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  disabled={isReview}
                />
              )}

              {/* TYPE 3 — NUMERIC INPUT */}
              {currentQ.question_type === 3 && (
                <input
                  type="number"
                  className="numeric-input"
                  value={answers[String(currentQ.id)] || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  disabled={isReview}
                />
              )}

              {/* TYPE 1 — MCQ SINGLE */}
              {currentQ.question_type === 1 && (
                <div className="mcq-options">
                  {Object.entries(currentQ.options || {}).map(([key, value]) => (
                    <label
                      key={key}
                      className={`mcq-option-card ${
                        answers[String(currentQ.id)] === key ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${currentQ.id}`}
                        checked={answers[String(currentQ.id)] === key}
                        onChange={() => handleAnswer(key)}
                        disabled={isReview}
                      />
                      <span>{key}. {value}</span>
                    </label>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* REVIEW RESULT */}
          {mode === "review" && (
            <div
              className={`review-result ${
                isCorrect ? "answer-correct" : "answer-wrong"
              }`}
            >
              {isCorrect ? "✔ Correct" : "✖ Incorrect"}
            </div>
          )}

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
      )}

    </div>

    {showConfirmFinish && (
      <div className="confirm-overlay">
        <div className="confirm-modal">
          <h3>Finish Exam?</h3>
          <p>You won’t be able to change answers.</p>

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
                finishExam();
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    )}

  </div>
);
}
