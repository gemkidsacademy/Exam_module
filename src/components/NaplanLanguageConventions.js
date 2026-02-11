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

export default function NaplanLanguageConventions({
  onExamStart,
  onExamFinish
}) {
  const studentId = sessionStorage.getItem("student_id");
  const API_BASE = process.env.REACT_APP_API_URL;

  if (!API_BASE) {
    throw new Error("REACT_APP_API_URL is not defined");
  }

  const hasSubmittedRef = useRef(false);

  const [mode, setMode] = useState("loading");
  const isReview = mode === "review";

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);

  const [report, setReport] = useState(null);
  const [examAttemptId, setExamAttemptId] = useState(null);

  /* ================= LOAD REPORT ================= */
  const loadReport = useCallback(async () => {
    const res = await fetch(
      `${API_BASE}/api/student/exam-report/naplan-language-conventions?student_id=${studentId}`
    );

    if (!res.ok) return;

    const data = await res.json();
    setReport(data);
    setExamAttemptId(data.exam_attempt_id);
    setMode("report");
  }, [API_BASE, studentId]);

  /* ================= START / RESUME ================= */
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

  /* ================= FINISH ================= */
  const finishExam = useCallback(async () => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    await fetch(
      `${API_BASE}/api/student/finish-exam/naplan-language-conventions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, answers })
      }
    );

    await loadReport();
    onExamFinish?.();
  }, [API_BASE, studentId, answers, loadReport, onExamFinish]);

  /* ================= TIMER ================= */
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

  /* ================= ANSWERS ================= */
  const handleAnswer = (value) => {
    const qid = String(questions[currentIndex]?.id);
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

  if (mode === "loading") return <p className="loading">Loading…</p>;
  if (mode === "exam" && !questions.length)
    return <p className="loading">Loading…</p>;

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

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  return (
    <div className={`exam-shell ${styles.examShell}`}>
      <div className={`exam-container ${styles.examContainer}`}>

        <div className={styles.examHeader}>
          {!isReview && (
            <div className="timer">⏳ {formatTime(timeLeft)}</div>
          )}
          <div className="counter">
            Question {currentIndex + 1} / {questions.length}
          </div>
        </div>

        {/* INDEX ROW */}
        <div className={styles.indexRow}>
          {questions.map((q, i) => {
            let cls = styles.indexCircle;
            const qid = String(q.id);

            if (answers[qid] !== undefined) {
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

        {/* QUESTION */}
        <div className="question-card">
          <div className="question-content-centered">

            {currentQ.question_blocks?.map((block, idx) => {
              if (block.type === "text") {
                return (
                  <p key={idx} className="question-text">
                    {block.content}
                  </p>
                );
              }

              if (block.type === "image") {
                return (
                  <img
                    key={idx}
                    src={block.src}
                    alt="question visual"
                    className="question-image"
                  />
                );
              }

              return null;
            })}

            {/* TYPE 3 — NUMERIC */}
            {currentQ.question_type === 3 && (
              <input
                type="number"
                className="numeric-input"
                value={answers[String(currentQ.id)] || ""}
                onChange={(e) => handleAnswer(e.target.value)}
                disabled={isReview}
              />
            )}

            {/* TYPE 4 — TEXT */}
            {currentQ.question_type === 4 && (
              <textarea
                className="text-input"
                rows={2}
                value={answers[String(currentQ.id)] || ""}
                onChange={(e) => handleAnswer(e.target.value)}
                disabled={isReview}
              />
            )}

            {/* TYPE 1 — SINGLE MCQ */}
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
                      value={key}
                      checked={answers[String(currentQ.id)] === key}
                      onChange={() => handleAnswer(key)}
                      disabled={isReview}
                    />
                    <span>{key}. {value}</span>
                  </label>
                ))}
              </div>
            )}

            {/* TYPE 2 — MULTI MCQ */}
            {currentQ.question_type === 2 && (
              <div className="mcq-options">
                {Object.entries(currentQ.options || {}).map(([key, value]) => {
                  const selected = answers[String(currentQ.id)] || [];

                  return (
                    <label
                      key={key}
                      className={`mcq-option-card ${
                        selected.includes(key) ? "selected" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(key)}
                        onChange={() => {
                          let updated;

                          if (selected.includes(key)) {
                            updated = selected.filter(v => v !== key);
                          } else {
                            updated = [...selected, key];
                          }

                          handleAnswer(updated);
                        }}
                        disabled={isReview}
                      />
                      <span>{key}. {value}</span>
                    </label>
                  );
                })}
              </div>
            )}

          </div>
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
