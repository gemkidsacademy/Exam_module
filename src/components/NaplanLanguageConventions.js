import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from "react";
import "./NaplanNumeracyExam.css";

import "./ExamPage.css";
import styles from "./ExamPageThinkingSkills.module.css";

import NaplanLanguageConventionsReview from "./NaplanLanguageConventionsReview";
import NaplanLanguageConventionsReport from "./NaplanLanguageConventionsReport";

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function NaplanLanguageConventions({
  onExamStart,
  onExamFinish,
  mode: parentMode // 🔥 ADD THIS
}) {
  const studentId = sessionStorage.getItem("student_id");
  const API_BASE = process.env.REACT_APP_API_URL;
  const TYPE_2_MAX_SELECTIONS = 2;
  const isPopNavigationRef = useRef(false);

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
  const [explanations, setExplanations] = useState({});
  const [loadingExplanation, setLoadingExplanation] = useState(null);
  const formatExplanation = (text) => {
    if (!text) return "";
  
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong style='display:block; margin-top:10px;'>$1</strong>")
      .replace(/\n\n/g, "<br/><br/>")
      .replace(/\n/g, "<br/>");
  };
  const handleGenerateExplanation = async (question) => {
    const qid = String(question.id);
  
    if (explanations[qid]) return;
  
    setLoadingExplanation(qid);
  
    try {
      const res = await fetch(
        `${API_BASE}/api/ai/explain-question-TS`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            question: question.question_blocks, // ✅ important
            options: question.options || {},
            correct_answer: question.correct_answer
          })
        }
      );
  
      if (!res.ok) {
        throw new Error("API failed");
      }
  
      const data = await res.json();
  
      setExplanations(prev => ({
        ...prev,
        [qid]: data.explanation || "⚠️ Failed to generate explanation."
      }));
  
    } catch (err) {
      console.error("Explanation failed", err);
  
      setExplanations(prev => ({
        ...prev,
        [qid]: "⚠️ Failed to generate explanation."
      }));
    } finally {
      setLoadingExplanation(null);
    }
  };
  const normalizeCorrectAnswer = (correctAnswer, questionType) => {
    if (correctAnswer == null) return null;

    // handle stringified objects like "{'value':'brilliantly'}"
    if (
      typeof correctAnswer === "string" &&
      correctAnswer.includes("value")
    ) {
      try {
        const parsed = JSON.parse(correctAnswer.replace(/'/g, '"'));
        return parsed.value;
      } catch {
        return correctAnswer;
      }
    }

    if (
      typeof correctAnswer === "object" &&
      correctAnswer.value !== undefined
    ) {
      return correctAnswer.value;
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
  function renderHighlightedText(content) {
    if (!content) return content;
  
    const parts = content.split(/(\*\*.*?\*\*)/g);
  
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const word = part.slice(2, -2);
        return (
          <span key={i} className="highlight-word">
            {word}
          </span>
        );
      }
  
      return part;
    });
  }
  function areNumbersEqual(a, b) {
    if (a == null || b == null) return false;

    const numA = Number(
      typeof a === "object" && a.value !== undefined ? a.value : a
    );

    const numB = Number(
      typeof b === "object" && b.value !== undefined ? b.value : b
    );

    if (Number.isNaN(numA) || Number.isNaN(numB)) {
      return false;
    }

    return numA === numB;
  }

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
    
  }, [API_BASE, studentId]);
  useEffect(() => {
  if (mode !== "report") return;
  loadReport();
}, [mode, loadReport]);
  
  useEffect(() => {
  if (!studentId) return;
  if (mode !== "loading") return;

  // 🔥 REPORT MUST WIN
  if (parentMode === "report") {
    setMode("report");
    return;
  }

  if (parentMode === "exam") {
    setMode("exam");
  }

}, [studentId, parentMode, mode]);
  useEffect(() => {
  if (mode !== "exam" || questions.length === 0) return;

  // 🔥 Step 1: initial state
  window.history.replaceState(
    { questionIndex: 0 },
    "",
    window.location.href
  );

  // 🔥 Step 2: buffer (prevents exit on back)
  window.history.pushState(
    { questionIndex: 0 },
    "",
    window.location.href
  );
}, [mode, questions.length]);
useEffect(() => {
  if (mode !== "exam") return;

  if (isPopNavigationRef.current) {
    isPopNavigationRef.current = false;
    return;
  }

  window.history.pushState(
    { questionIndex: currentIndex },
    "",
    window.location.href
  );
}, [currentIndex, mode]);
useEffect(() => {
  if (mode !== "exam") return;

  const handlePopState = (e) => {
    const state = e.state;

    console.log("POPSTATE:", state);

    // 🔥 CASE 1: User is at Question 1 → block exit
    if (currentIndex === 0) {
      if (!showConfirmFinish) {
        setShowConfirmFinish(true);
      }

      // 🔥 Keep user inside exam (important)
      window.history.replaceState(
        { questionIndex: 0 },
        "",
        window.location.href
      );

      return;
    }

    // 🔥 CASE 2: Normal navigation
    if (!state || typeof state.questionIndex !== "number") {
      return;
    }

    isPopNavigationRef.current = true;
    setCurrentIndex(state.questionIndex);
  };

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, [mode, currentIndex, showConfirmFinish]);
  
    /* ============================================================
     START / RESUME EXAM
  ============================================================ */
  useEffect(() => {
  if (!studentId) return;
  if (mode !== "exam") return;
  if (parentMode !== "exam") return; // 🔥 safety

  const startExamNaplanLanguageConventions = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/student/start-exam/naplan-language-conventions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_id: studentId })
        }
      );

      const examPayload = await response.json();

      if (examPayload.completed === true) {
        await loadReport();
        setMode("report"); // 🔥 IMPORTANT
        return;
      }

      setQuestions(examPayload.questions || []);
      setTimeLeft(examPayload.remaining_time);

      onExamStart?.();

    } catch (error) {
      console.error("Failed to start exam:", error);
    }
  };

  startExamNaplanLanguageConventions();

}, [studentId, mode, parentMode, API_BASE, loadReport, onExamStart]);
  useEffect(() => {
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("copy", e => e.preventDefault());
  document.addEventListener("cut", e => e.preventDefault());
}, []);
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
  if (mode === "submitting") {
    return (
      <div className="loading-screen">
        <p className="loading">Submitting exam…</p>
      </div>
    );
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
        onLoaded={(qs, studentAnswers) => {
          setQuestions(qs);
          setCurrentIndex(0);
          setVisited({});
          setAnswers(studentAnswers || {});
          setExplanations({});
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
      (b) =>
        b.type === "image-multi-select" &&
        Array.isArray(b.options) &&
        b.options.some(opt => opt.image && opt.image.trim() !== "")
    );
  if (!currentQ) return null;
  const qid = String(currentQ.id);
  console.log("CURRENT ANSWER FOR TYPE 6:", answers[qid]);
  const isCorrect =
  mode === "review"
    ? Boolean(currentQ.is_correct)
    : null;


  const normalizedCorrectAnswer = normalizeCorrectAnswer(
    currentQ.correct_answer,
    currentQ.question_type
  );
  const normalizedStudentAnswer = normalizeStudentAnswer(
    answers[String(currentQ.id)],
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

            if (isReview) {
              const questionCorrect = Boolean(q.is_correct);
            
              cls += questionCorrect
                ? ` ${styles.indexCorrect}`
                : ` ${styles.indexWrong}`;
            } else {

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
            {renderHighlightedText(block.content)}
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
              {block.options.map((opt, i) => {
                const key = String.fromCharCode(65 + i); // still used for display if needed
              
                return (
                  <option key={key} value={opt}>
                    {opt}
                  </option>
                );
              })}
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
        onChange={(e) => {
          const cleanedValue = e.target.value
            .replace(/[^a-zA-Z]/g, "")
            .toLowerCase();
    
          handleAnswer(cleanedValue);
        }}
        disabled={isReview}
        spellCheck={false}
        autoComplete="off"
        onContextMenu={(e) => e.preventDefault()}
      />
    )}
    {/* =========================
      TYPE 1 — SINGLE CHOICE (MCQ)
    ========================= */}
    {currentQ.question_type === 1 && currentQ.options && (
      <div className="mcq-options">
        {Object.entries(currentQ.options).map(([key, value]) => {
          const isSelected = normalizedStudentAnswer === value;
          const isCorrectOption = normalizedCorrectAnswer === value;
          const isWrongSelected = isReview && isSelected && !isCorrectOption;
          const isCorrectHighlight = isReview && isCorrectOption;
        
          return (
            <label
              key={key}
              className={`mcq-option-card
                ${isSelected ? "selected" : ""}
                ${isCorrectHighlight ? "review-correct" : ""}
                ${isWrongSelected ? "review-wrong" : ""}
              `}
            >
              <input
                type="radio"
                name={`q-${qid}`}
                checked={isSelected}
                disabled={isReview}
                onChange={() => handleAnswer(value)}
              />
              <span>{key}. {value}</span>
            </label>
          );
        })}
      </div>
    )}
    {isReview && (
      <div className={`your-answer-text ${isCorrect ? "correct" : "wrong"}`}>
        <strong>Your answer:</strong>{" "}
        {normalizedStudentAnswer || "No answer"}
      </div>
    )}

    {isReview && !isCorrect && (
      <div className="correct-answer-text">
        <strong>Correct answer:</strong>{" "}
        {(() => {
          let answer = normalizedCorrectAnswer;

          // case: "{'value': 'brilliantly'}"
          if (typeof answer === "string" && answer.includes("value")) {
            try {
              const parsed = JSON.parse(answer.replace(/'/g, '"'));
              return parsed.value;
            } catch {
              return answer;
            }
          }

          // case: MCQ keys (A,B,C,D)
          return currentQ.options?.[answer] || answer;
        })()}
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
      <div className="text-multi-select-grid">
        {Object.values(currentQ.options || {}).map((value, idx) => {
          const key = String.fromCharCode(65 + idx); // internal key only
          const selected = answers[qid] || [];
          const isSelected = selected.includes(key);

          const correctAnswers = normalizedCorrectAnswer || [];
          const isCorrectOption = correctAnswers.includes(key);
          const isWrongSelected = isReview && isSelected && !isCorrectOption;
          const isCorrectHighlight = isReview && isCorrectOption;

          return (
            <label
              key={key}
              className={`text-option-card
                ${isSelected ? "selected" : ""}
                ${isCorrectHighlight ? "review-correct" : ""}
                ${isWrongSelected ? "review-wrong" : ""}
              `}
            >
              <input
                type="checkbox"
                checked={isSelected}
                disabled={isReview}
                onChange={() => {
                  let updated;

                  if (isSelected) {
                    updated = selected.filter(v => v !== key);
                  } else {
                    if (selected.length >= TYPE_2_MAX_SELECTIONS) return;
                    updated = [...selected, key];
                  }

                  handleAnswer(updated);
                }}
              />

              <div className="text-option-content">
                <span className="option-text">{value}</span>
              </div>
            </label>
          );
        })}
      </div>
    )}
  {/* ================= AI EXPLANATION ================= */}
{isReview && (
  <div style={{ marginTop: "16px" }}>
    
    {!explanations[qid] && (
      <button
        className="ai-explain-btn"
        onClick={() => handleGenerateExplanation(currentQ)}
        disabled={loadingExplanation === qid}
      >
        {loadingExplanation === qid
          ? "Generating..."
          : "Generate AI Explanation"}
      </button>
    )}

    {explanations[qid] && (
      <div className="ai-explanation-box">
        <h4>Explanation</h4>
        <div
          dangerouslySetInnerHTML={{
            __html: formatExplanation(explanations[qid])
          }}
        />
      </div>
    )}
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
              disabled={mode === "submitting"}
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
              
                  // 🔑 BLANK SCREEN STARTS HERE
                  setMode("submitting");
              
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
