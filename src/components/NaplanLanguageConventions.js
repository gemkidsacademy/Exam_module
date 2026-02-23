import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from "react";
import "./NaplanNumeracyExam.css";

import "./ExamPage.css";
import styles from "./ExamPageThinkingSkills.module.css";

import NaplanNumeracyReview from "./NaplanNumeracyReview";
import NaplanNumeracyReport from "./NaplanNumeracyReport";

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function NaplanLanguageConventions({
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
      `${API_BASE}/api/student/exam-report/naplan-language-conventions?student_id=${studentId}`
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
      console.log("NAPLAN QUESTIONS:", data.questions);
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
  
    setAnswers(prev => ({
      ...prev,
      [qid]: value
    }));
  
    setVisited(prev => ({
      ...prev,
      [qid]: true
    }));
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
  if (mode === "loading") return <p className="loading">Loading…</p>;
  if (mode === "exam" && !questions.length)
    return <p className="loading">Loading…</p>;

  if (mode === "report") {
    return (
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
    );
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
  const currentQ = questions[currentIndex];
  const hasImageMultiSelect =
    currentQ?.question_blocks?.some(
      (b) => b.type === "image-multi-select"
    );
  if (!currentQ) return null;
  const qid = String(currentQ.id);
  console.log("CURRENT ANSWER FOR TYPE 6:", answers[qid]);
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

        {/* HEADER */}
        <div className={styles.examHeader}>
          {!isReview && <div className="timer">⏳ {formatTime(timeLeft)}</div>}
          <div className="counter">
            Question {currentIndex + 1} / {questions.length}
          </div>
        </div>

        {/* QUESTION INDEX (same as Thinking Skills) */}
        <div className={styles.indexRow}>
          {questions.map((q, i) => {
            let cls = styles.indexCircle;
            const qid = String(q.id);
            
            if (
              answers[qid] !== undefined &&
              (
                typeof answers[qid] !== "object" ||
                answers[qid].length > 0
              )
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
        if (
          currentQ.question_type === 6 &&
          block.role === "option"
        ) {
          return null;
        }

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
            className={
              block.role === "reference"
                ? "question-image reference-image"
                : "question-image"
            }
          />
        );
      }

      if (block.type === "cloze-dropdown") {
        const parts = block.sentence.split("{{dropdown}}");
        const qid = String(currentQ.id);

        return (
          <div key={idx} className="cloze-sentence">
            {parts[0]}
            <select
              className="cloze-dropdown"
              value={answers[qid] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              disabled={isReview}
            >
              <option value="" disabled>
                Select
              </option>
              {block.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {parts[1]}
          </div>
        );
      }

      if (block.type === "word-selection") {
        const sentenceWords = block.sentence.split(" ");

        return (
          <div key={idx} className="sentence-container">
            {sentenceWords.map((word, i) => {
              const cleanWord = word.replace(/[.,!?]/g, "");
              const isSelectable = block.selectable_words.includes(cleanWord);
              const isSelected =
                answers[String(currentQ.id)] === cleanWord;

              return (
                <span
                  key={i}
                  className={`sentence-word
                    ${isSelectable ? "selectable" : "non-selectable"}
                    ${isSelected ? "selected" : ""}
                  `}
                  onClick={() => {
                    if (!isReview && isSelectable) {
                      handleAnswer(cleanWord);
                    }
                  }}
                >
                  {word + " "}
                </span>
              );
            })}
          </div>
        );
      }

      if (block.type === "image-multi-select") {
        const qid = String(currentQ.id);
        const selected = answers[qid] || [];

        return (
          <div key={idx} className="image-multi-select-grid">
            {block.options.map((opt) => {
              const isSelected = selected.includes(opt.id);

              return (
                <label
                  key={opt.id}
                  className={`image-option-card ${
                    isSelected ? "selected" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    value={opt.id}
                    checked={isSelected}
                    disabled={isReview}
                    onChange={() => {
                      let updated;

                      if (isSelected) {
                        updated = selected.filter(v => v !== opt.id);
                      } else {
                        if (!isSelected && selected.length >= TYPE_2_MAX_SELECTIONS) return;
                        updated = [...selected, opt.id];
                      }

                      handleAnswer(updated);
                    }}
                  />
                  <img
                    src={opt.image}
                    alt={opt.label}
                    className="image-option-image"
                  />
                  <div className="image-option-label">
                    {opt.label}
                  </div>
                </label>
              );
            })}
          </div>
        );
      }

      return null;
    })}
    {/* =========================
      TYPE 3 — SHORT / NUMERIC INPUT
    ========================= */}
    {currentQ.question_type === 3 && (
      <input
        type="text"
        className="numeric-input"
        value={answers[qid] || ""}
        onChange={(e) => handleAnswer(e.target.value)}
        disabled={isReview}
      />
    )}

    {/* =========================
      TYPE 4 — TEXT INPUT
    ========================= */}
    {currentQ.question_type === 4 && (
      <textarea
        className="text-input"
        rows={2}
        placeholder="Type your answer here"
        value={answers[qid] || ""}
        onChange={(e) => handleAnswer(e.target.value)}
        disabled={isReview}
      />
    )}
    {/* =========================
      TYPE 1 — SINGLE CHOICE (MCQ)
    ========================= */}
    {currentQ.question_type === 1 && currentQ.options && (
      <div className="mcq-options">
        {Object.entries(currentQ.options).map(([key, value]) => {
          const isSelected = answers[qid] === key;

          return (
            <label
              key={key}
              className={`mcq-option-card ${isSelected ? "selected" : ""}`}
            >
              <input
                type="radio"
                name={`q-${qid}`}
                checked={isSelected}
                disabled={isReview}
                onChange={() => handleAnswer(key)}
              />
              <span>{key}. {value}</span>
            </label>
          );
        })}
      </div>
    )}
    
    {/* =========================
   TYPE 6 — IMAGE MCQ
    ========================= */}
    {currentQ.question_type === 6 && (
      <div className="image-mcq-grid">
        {currentQ.question_blocks
          .filter(b => b.type === "image" && b.role === "option")
          .map((block, idx) => {
            const optionKey = String(idx); // ✅ FIX

            const src =
              block.src ||
              `${process.env.REACT_APP_IMAGE_BASE_URL}/${block.name}`;

            const isSelected = answers[qid] === optionKey;

            return (
              <div
                key={optionKey}
                className={`image-mcq-card ${isSelected ? "selected" : ""}`}
                onClick={() => !isReview && handleAnswer(optionKey)}
              >
                <img
                  src={src}
                  alt={`Option ${optionKey}`}
                  className="image-mcq-image"
                />
                <div className="image-mcq-label">
                  {String.fromCharCode(65 + idx)}
                </div>
              </div>
            );
          })}
      </div>
    )}
    {currentQ.question_type === 2 && !hasImageMultiSelect && (
      <div className="mcq-options">
        {Object.entries(currentQ.options || {}).map(([key, value]) => {
          const selected = answers[String(currentQ.id)] || [];
          const isSelected = selected.includes(key);

          return (
            <label
              key={key}
              className={`mcq-option-card ${
                isSelected ? "selected" : ""
              }`}
            >
              <input
                type="checkbox"
                value={key}
                checked={isSelected}
                disabled={isReview}
                onChange={() => {
                  let updated;
                
                  if (isSelected) {
                    updated = selected.filter(v => v !== key);
                  } else {
                    if (!isSelected && selected.length >= TYPE_2_MAX_SELECTIONS) return;
                    updated = [...selected, key];
                  }
                
                  handleAnswer(updated);
                }}                  
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
