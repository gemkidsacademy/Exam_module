
import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from "react";

import "./ExamPage.css";
import "./NaplanReadingExam.css";

import NaplanReadingReport from "./NaplanReadingReport";
import NaplanReadingReview from "./NaplanReadingReview";

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function NaplanReading({
  onExamStart,
  onExamFinish
}) {
  const studentId = sessionStorage.getItem("student_id");
  const API_BASE = process.env.REACT_APP_API_URL;
  const TYPE_2_MAX_SELECTIONS = 2;
  const [explanations, setExplanations] = useState({});
  const explanationRef = useRef(null);
  
  const [loadingExplanation, setLoadingExplanation] = useState(null);
  const handleGenerateExplanationForReading = async (q) => {
  const qid = String(q.question_id);
  const isPopNavigationRef = useRef(false);
    

  // allow regenerate
  if (loadingExplanation === qid) return;

  setLoadingExplanation(qid);

  try {
    const questionText = q.exam_bundle?.question_blocks
      ?.filter(b => b.type !== "reading")
      ?.map(b => b.content || b.text || "")
      ?.join(" ");

    const passageBlock = q.exam_bundle?.question_blocks?.find(
      b => b.type === "reading"
    );

    const res = await fetch(
      `${API_BASE}/api/ai/explain-question-naplan-reading`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: questionText,
          options:
            q.exam_bundle?.options ||
            q.exam_bundle?.image_options ||
            {},
          correct_answer: q.exam_bundle?.correct_answer,
          passage: passageBlock || null
        })
      }
    );

    const data = await res.json();

    setExplanations(prev => ({
      ...prev,
      [qid]: data.explanation || "⚠️ Failed to generate explanation."
    }));
    
    // ✅ scroll AFTER render
    setTimeout(() => {
      explanationRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 100);

  } catch (err) {
    console.error(err);

    setExplanations(prev => ({
      ...prev,
      [qid]: "⚠️ Failed to generate explanation."
    }));
  } finally {
    setLoadingExplanation(null);
  }
};
  const formatExplanationHtml = (text) => {
  if (!text) return "";

  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong style='display:block; margin-top:10px;'>$1</strong>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
};
  function hasAnswered(question, answers) {
  if (!question || !answers) return false;

  const qid = String(question.question_id);

  const value =
    answers[qid] ??
    answers[question.question_id];

  if (value === undefined || value === null) {
    return false;
  }

  switch (question.question_type) {

    // single choice (text or image)
    case 1:
    case 4:
      return String(value).trim() !== "";

    // gap fill
    case 3:
    case 6:
      return String(value).trim() !== "";

    // word select
    case 7:
      return String(value).trim() !== "";

    // multi select
    case 2:
      return Array.isArray(value) && value.length > 0;

    // true / false matrix
    case 5:
      return (
        Array.isArray(value) &&
        value.length > 0 &&
        value.some(v => v !== null && v !== undefined)
      );

    default:
      return false;
  }
}
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
  const [passages, setPassages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [correctness, setCorrectness] = useState({});
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);

  // ---------------- REPORT ----------------
  const [report, setReport] = useState(null);
  const [examAttemptId, setExamAttemptId] = useState(null);

  /* ============================================================
     NORMALIZATION HELPERS (REUSED FROM NUMERACY)
  ============================================================ */
  function isAnswerCorrect(question, answers) {
  const correct = normalizeCorrectAnswer(
    question.exam_bundle.correct_answer,
    question.question_type
  );

  const student = normalizeStudentAnswer(
    answers[String(question.question_id)],
    question.question_type
  );

  // Multi select
  if (question.question_type === 2) {
    if (!Array.isArray(student) || !Array.isArray(correct)) return false;

    if (student.length !== correct.length) return false;

    return student.every(v => correct.includes(v));
  }

  // True / False matrix
  if (question.question_type === 5) {
    if (!Array.isArray(student) || !Array.isArray(correct)) return false;

    if (student.length !== correct.length) return false;

    return student.every((v, i) => v === correct[i]);
  }

  // All other types
  return student === correct;
}
  const normalizeCorrectAnswer = (correctAnswer, questionType) => {
  if (correctAnswer == null) return null;

  if (typeof correctAnswer === "object" && correctAnswer.value !== undefined) {
    correctAnswer = correctAnswer.value;
  }
  // true false
if (questionType === 5) {
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

  // multi select
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

  // word select
  // word select
  if (questionType === 7) {
    if (Array.isArray(correctAnswer)) {
      return String(correctAnswer[0]).trim();
    }
  
    return String(correctAnswer).trim();
  }
  return String(correctAnswer).trim();
};
  const normalizeStudentAnswer = (answer, questionType) => {
  if (answer == null) return null;

  // MULTI SELECT
  if (questionType === 2) {
    if (Array.isArray(answer)) {
      return [...answer].sort();
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

  // TRUE / FALSE MATRIX
  if (questionType === 5) {
    if (Array.isArray(answer)) return answer;

    if (typeof answer === "string") {
      try {
        return JSON.parse(answer.replace(/'/g, '"'));
      } catch {
        return [];
      }
    }

    return [];
  }

  return String(answer).trim();
};
  /* ============================================================
     LOAD REPORT
  ============================================================ */
  const loadReport = useCallback(async () => {
    const res = await fetch(
      `${API_BASE}/api/student/exam-report/naplan-reading?student_id=${studentId}`
    );

    if (!res.ok) return;

    const data = await res.json();
    setReport(data);
    setExamAttemptId(data.exam_attempt_id);
    setMode("report");
  }, [API_BASE, studentId]);
  
  useEffect(() => {
  if (mode !== "exam" || flatQuestions.length === 0) return;

  // Replace initial state
  window.history.replaceState(
    { questionIndex: 0 },
    "",
    window.location.href
  );

  // Push buffer state
  window.history.pushState(
    { questionIndex: 0 },
    "",
    window.location.href
  );

}, [mode, flatQuestions.length]);
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

    // 🔥 CASE 1: On Q1 → show submit modal
    if (currentIndex === 0) {
      if (!showConfirmFinish) {
        setShowConfirmFinish(true);
      }

      // Stay on Q1
      window.history.replaceState(
        { questionIndex: 0 },
        "",
        window.location.href
      );

      // 🔥 CRITICAL: re-add buffer so user can't escape
      window.history.pushState(
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
  
    // 🔒 start-exam must run ONCE only
    if (mode !== "loading") return;
  
    // hard reset (safe here)
    setAnswers({});
    setVisited({});
    setCurrentIndex(0);
  
    const startExam = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/student/start-exam/naplan-reading`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_id: studentId })
          }
        );
  
        const data = await res.json();
        // 🔍 LOG BACKEND PAYLOAD
        console.log("📦 start-exam response:", data);
        if (data.completed === true) {
          await loadReport();
          return;
        }
  
        setQuestions(data.questions || []);
        setTimeLeft(data.remaining_time);
  
        if (data.is_resumed === true && data.answers) {
          setAnswers(data.answers);
          setVisited(
            Object.fromEntries(
              Object.keys(data.answers).map(qid => [qid, true])
            )
          );
        }
  
        setMode("exam");
        onExamStart?.();
  
      } catch (err) {
        console.error("❌ Failed to start exam:", err);
      }
    };
  
    startExam();
  }, [studentId, API_BASE, loadReport, mode, onExamStart]);
  useEffect(() => {
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("copy", e => e.preventDefault());
  document.addEventListener("cut", e => e.preventDefault());
}, []);
  /* ============================================================
     GROUP QUESTIONS BY PASSAGE
  ============================================================ */
  useEffect(() => {
    if (!questions.length) return;

    const map = {};

    questions.forEach(q => {
      if (!map[q.passage_id]) {
        const readingBlock = q.exam_bundle.question_blocks.find(
          b => b.type === "reading"
        );

        map[q.passage_id] = {
          passage_id: q.passage_id,
          reading_block: readingBlock,
          questions: []
        };
      }

      map[q.passage_id].questions.push(q);
    });

    setPassages(Object.values(map));
  }, [questions]);

  const flatQuestions = passages.flatMap(p => p.questions);
  const currentQ = flatQuestions[currentIndex];

  /* ============================================================
     FINISH EXAM
  ============================================================ */
  const finishExam = useCallback(async () => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    await fetch(
      `${API_BASE}/api/student/finish-exam/naplan-reading`,
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
    if (mode !== "exam" || timeLeft == null || hasSubmittedRef.current) return;

    if (timeLeft <= 0) {
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
    const qid = String(currentQ.question_id);
    if (!qid) return;
  
    console.log("✍️ handleAnswer called", { qid, value });
  
    setAnswers(prev => {
      const next = { ...prev, [qid]: value };
      console.log("➡️ answers updated to:", next);
      return next;
    });
  
    setVisited(prev => ({ ...prev, [qid]: true }));
  };

  const goToQuestion = (idx) => {
    if (idx < 0 || idx >= flatQuestions.length) return;

    const qid = String(flatQuestions[idx].question_id);
    setVisited(prev => ({ ...prev, [qid]: true }));
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
  if (mode === "submitting") {
    return (
      <div className="loading-screen">
        <p className="loading">Submitting exam…</p>
      </div>
    );
  }
  if (mode === "report") {
    return (
      <NaplanReadingReport
        report={report}
        onViewExamDetails={() => {
          setQuestions([]);
          setAnswers({});
          setVisited({});
          setCurrentIndex(0);
          setMode("review");
        }}
      />
    );
  }

  if (mode === "review" && !questions.length) {
    return (
      <NaplanReadingReview
        studentId={studentId}
        examAttemptId={examAttemptId}
        onLoaded={(qs, ans) => {
          setQuestions(qs);
          setCurrentIndex(0);
          setVisited({});
          const cleanedAnswers = {};
          const correctnessMap = {};
          
          Object.entries(ans || {}).forEach(([qid, obj]) => {
            cleanedAnswers[qid] = obj.answer;
            correctnessMap[qid] = obj.is_correct;
          });
          
          setAnswers(cleanedAnswers);
          setCorrectness(correctnessMap);
        }}
      />
    );
  }

  if (!currentQ) return null;

  /* ============================================================
     REVIEW CORRECTNESS
  ============================================================ */
  const isCorrect =
  mode === "review"
    ? correctness[String(currentQ.question_id)]
    : null;
  const qid = String(currentQ.question_id);
  /* ============================================================
     CURRENT PASSAGE
  ============================================================ */
  const currentPassage = passages.find(p =>
    p.questions.some(q => q.question_id === currentQ.question_id)
  );
  console.log("🧠 ACTUAL RENDER answers:", answers);

  return (
    <div className={`exam-shell ${mode === "review" ? "review-mode" : ""}`}>
      <div className="exam-container">

        {/* HEADER */}
        <div className="exam-header">
          {!isReview && <div className="timer">⏳ {formatTime(timeLeft)}</div>}
          <div className="counter">
            Question {currentIndex + 1} / {flatQuestions.length}
          </div>
        </div>
         {/* QUESTION INDEX BAR */}
        <div className="question-index-bar">
          {flatQuestions.map((q, idx) => {
            const isAnswered = hasAnswered(q, answers);
            const isCurrent = idx === currentIndex;
        
            let reviewClass = "";
        
            if (mode === "review") {
              const correctFlag = correctness[String(q.question_id)];
              reviewClass = correctFlag ? "correct" : "incorrect";
            }        
            return (
              <button
                key={q.question_id}
                className={[
                "question-index-item",
                mode === "review"
                  ? reviewClass
                  : isAnswered
                  ? "answered"
                  : "unanswered",
                isCurrent ? "current" : ""
              ].join(" ")}
                onClick={() => goToQuestion(idx)}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
        <div className="exam-body reading-mode">

        {/* LEFT: PASSAGE(S) */}
        {currentPassage?.reading_block && (
          <div className="passage-pane">
            {currentPassage.reading_block.extracts.map(ext => (
              <div key={ext.extract_id} className="extract">
                <h3>{ext.title}</h3>
                <p>{ext.content}</p>

                {ext.images?.map(img => (
                  <img key={img} src={img} alt="" />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* RIGHT: SINGLE QUESTION */}
        <div
          className="question-pane"
          style={{
            flex: 1,
            paddingRight: "8px",
            overflowY: "auto"
          }}
        >
          
          <div className="question-card">
            
            <div className="question-header">
              <h3>
                Q{currentIndex + 1}.
              </h3>
            
              {mode === "review" && (
                <button
                  className="explain-btn-inline"
                  onClick={() => handleGenerateExplanationForReading(currentQ)}
                  disabled={loadingExplanation === qid}
                >
                  {loadingExplanation === qid
                    ? "Generating..."
                    : explanations[qid]
                    ? "💡 Regenerate"
                    : "💡 Explain"}
                </button>
              )}
            </div>

            {/* 1️⃣ QUESTION TEXT / STRUCTURE */}
            {currentQ.exam_bundle.question_blocks
              .filter(b => b.type !== "reading")
              .map((block, idx) => {
                 // ✅ ADD THIS FIRST
                if (block.type === "instruction") {
                  return (
                    <p key={idx} className="question-instruction">
                      {block.text}
                    </p>
                  );
                }

                if (
                  block.content &&
                  !["gap_fill", "single_gap"].includes(block.type)
                ) {
                  return <p key={idx}>{block.content}</p>;
                }

                if (block.type === "gap_fill") {
                  const qid = String(currentQ.question_id);

                  return (
                    <div key={idx} className="gap-fill-block">
                      {/* Sentence */}
                      <p className="gap-fill-text">
                        {block.content}
                      </p>

                      {/* Word bank (if present) */}
                      {block.word_bank?.length > 0 && (
                        <select
                          className="gap-dropdown"
                          value={answers[qid] || ""}
                          disabled={isReview}
                          onChange={(e) => handleAnswer(e.target.value)}
                        >
                          <option value="">Select an answer</option>

                          {block.word_bank.map(word => (
                            <option key={word} value={word}>
                              {word}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Free-text fallback */}
                      {!block.word_bank?.length && (
                        <input
                          className="text-input"
                          value={answers[qid] || ""}
                          onChange={(e) => handleAnswer(e.target.value)}
                          disabled={isReview}
                        />
                      )}
                    </div>
                  );
                }
                if (block.type === "single_gap") {
                  const qid = String(currentQ.question_id);

                  const [before, after] = block.content.split("[BLANK]");

                  return (
                    <div key={idx} className="gap-fill-block">
                      <p className="gap-fill-text inline-gap">
                        {before}
                        <select
                          className="gap-dropdown inline"
                          value={answers[qid] || ""}
                          disabled={isReview}
                          onChange={(e) => handleAnswer(e.target.value)}
                        >
                          <option value="">Select an answer</option>
                          {Object.entries(block.options).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                        {after}
                      </p>
                    </div>
                  );
                }
                if (block.type === "word_select") {
                    const qid = String(currentQ.question_id);
                    const selected = answers[qid] || null;

                    // Clean up text issues from backend
                    const text = block.text
                      .replace("/n", "\n")
                      .replace("eat pies,plums", "eats pies, plums")
                      .replace("off bug", "odd bug");

                    const tokens = text.split(/(\s+)/); // keep spaces

                    return (
                      <p key={idx} className="word-select-text">
                        {tokens.map((token, i) => {
                          const clean = token.replace(/[.,]/g, "");
                          const isOption = block.options.includes(clean);
                          const isSelected = selected === clean;

                          if (!isOption) {
                            return <span key={i}>{token}</span>;
                          }

                          return (
                            <span
                              key={i}
                              className={`word-select-option ${isSelected ? "selected" : ""}`}
                              onClick={() => {
                                if (!isReview) {
                                  handleAnswer(clean);
                                }
                              }}
                            >
                              {token}
                            </span>
                          );
                        })}
                      </p>
                    );
                  }

                if (block.type === "true_false") {
                  const qid = String(currentQ.question_id);
                  const selectedAnswers = answers[qid] || [];

                  return (
                    <div key={idx} className="tf-question">

                      {/* ✅ Instruction text */}
                      <p className="tf-instruction">
                        Which of these statements are true and which are false?
                      </p>

                      {/* Grid */}
                      <div className="tf-grid">
                        {/* Header */}
                        <div className="tf-grid-header">
                          <span></span>
                          <span>True</span>
                          <span>False</span>
                        </div>

                        {block.statements.map((stmt, i) => {
                          const currentValue = selectedAnswers[i] || null;

                          return (
                            <div key={i} className="tf-grid-row">
                              <span className="tf-statement">{stmt}</span>

                              <div className={`tf-cell ${currentValue === "False" ? "tf-dim" : ""}`}>
                                <input
                                  type="radio"
                                  name={`tf-${qid}-${i}`}
                                  checked={currentValue === "True"}
                                  disabled={isReview}
                                  onChange={() => {
                                    const updated = [...selectedAnswers];
                                    updated[i] = "True";
                                    handleAnswer(updated);
                                  }}
                                />
                              </div>
                              
                              <div className={`tf-cell ${currentValue === "True" ? "tf-dim" : ""}`}>
                                <input
                                  type="radio"
                                  name={`tf-${qid}-${i}`}
                                  checked={currentValue === "False"}
                                  disabled={isReview}
                                  onChange={() => {
                                    const updated = [...selectedAnswers];
                                    updated[i] = "False";
                                    handleAnswer(updated);
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return null;
              })}

            {/* 2️⃣ OPTIONS — RENDER ONCE PER QUESTION */}
            {(() => {
              if ([6, 7].includes(currentQ.question_type)) {
                return null;
              }

              const imageOptions = currentQ.exam_bundle.image_options;
              const textOptions =
                currentQ.exam_bundle.options ||
                currentQ.options ||
                {};
              const optionsSource = imageOptions || textOptions;

              if (!optionsSource || Object.keys(optionsSource).length === 0) {
                console.warn("⚠️ No options found for question:", currentQ);
                return null;
              }

              // MULTI SELECT
              // MULTI SELECT — checkbox list (vertical) #here
              if (currentQ.question_type === 2) {
                const selected = answers[String(currentQ.question_id)] || [];

                const correct = normalizeCorrectAnswer(
                  currentQ.exam_bundle.correct_answer,
                  currentQ.question_type
                );

                return (
                  <div className="mcq-options list">
                    {Object.entries(optionsSource).map(([k, v]) => {
                      const isSelected = selected.includes(k);

                      const correctArray = Array.isArray(correct) ? correct : [];
                      const isCorrectOption = correctArray.includes(k);
                      
                      let optionClass = "";

                      if (isReview) {
                        if (isSelected && isCorrectOption) {
                          optionClass = "option-correct";
                        } else if (isSelected && !isCorrectOption) {
                          optionClass = "option-wrong";
                        } else if (!isSelected && isCorrectOption) {
                          optionClass = "option-correct";
                        }
                      }
                      return (
                        <label
                          key={k}
                          className={`mcq-option-row ${optionClass}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isReview}
                            onChange={() => {
                              let updated;

                              if (isSelected) {
                                updated = selected.filter(x => x !== k);
                              } else {
                                if (selected.length >= TYPE_2_MAX_SELECTIONS) return;
                                updated = [...selected, k];
                              }

                              handleAnswer(updated);
                            }}
                          />

                          <span className="option-text">
                            {k}. {v}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                );
              }

              // SINGLE CHOICE
              const selected = answers[String(currentQ.question_id)];

              // 🖼️ IMAGE OPTIONS → cards
              if (imageOptions) {
                return (
                  <div className="mcq-options image-list">
                    {Object.entries(imageOptions).map(([k, v]) => {
                      const isSelected = selected === k;

                      return (
                        <label
                          key={k}
                          className={`mcq-option-card ${isSelected ? "selected" : ""}`}
                        >
                          <input
                            type="radio"
                            name={`q-${currentQ.question_id}`}
                            checked={isSelected}
                            disabled={isReview}
                            onChange={() => handleAnswer(k)}
                          />
                          <img src={v} alt={`Option ${k}`} className="option-image" />
                        </label>
                      );
                    })}
                  </div>
                );
              }

              // 📝 TEXT OPTIONS → radio list
              return (
                <div className="mcq-options list">
                  {Object.entries(textOptions).map(([k, v]) => {
                    const isSelected = selected === k;

                    const correct = normalizeCorrectAnswer(
                      currentQ.exam_bundle.correct_answer,
                      currentQ.question_type
                    );

                    const student = normalizeStudentAnswer(
                      answers[String(currentQ.question_id)],
                      currentQ.question_type
                    );

                    const isCorrectOption = mode === "review" && k === correct;
                    const isWrongSelection =
                      mode === "review" && k === student && student !== correct;

                    return (
                      <label
                        key={k}
                        className={[
                          "mcq-option-row",
                          isCorrectOption ? "option-correct" : "",
                          isWrongSelection ? "option-wrong" : ""
                        ].join(" ")}
                      >
                        <input
                          type="radio"
                          name={`q-${currentQ.question_id}`}
                          checked={isSelected}
                          disabled={isReview}
                          onChange={() => handleAnswer(k)}
                        />

                        <span className="option-text">
                          {k}. {v}
                        </span>
                      </label>
                    );
                  })}
                </div>
              );
            })()}
            {explanations[qid] && (
              <div
                className="ai-explanation-inline"
                ref={explanationRef}
              >
                <div className="ai-explanation-title">
                  Explanation
                </div>

                <div
                  className="ai-explanation-content"
                  dangerouslySetInnerHTML={{
                    __html: formatExplanationHtml(explanations[qid])
                  }}
                />
              </div>
            )}
            
          </div>
        </div>

      </div>

        {mode === "review" && (() => {
          const correct = normalizeCorrectAnswer(
            currentQ.exam_bundle.correct_answer,
            currentQ.question_type
          );
        
          const student = normalizeStudentAnswer(
            answers[String(currentQ.question_id)],
            currentQ.question_type
          );
        
          let displayCorrect = "—";
          let displayStudent = "—";
          
          /* ------------------------------------------------
             Resolve option source (normal or single_gap)
          ------------------------------------------------ */
          
          let optionMap = currentQ.exam_bundle.options;
          
          if (!optionMap) {
            const gapBlock = currentQ.exam_bundle.question_blocks?.find(
              b => b.type === "single_gap"
            );
            if (gapBlock?.options) {
              optionMap = gapBlock.options;
            }
          }
          
          /* ---------- Correct Answer ---------- */
          
          if (correct != null) {
          
            if (Array.isArray(correct)) {
              displayCorrect = correct
                .map(k => optionMap?.[k] || k)
                .join(", ");
            } else {
              displayCorrect = optionMap?.[correct] || correct;
            }
          
          }
          
          /* ---------- Student Answer ---------- */

          if (student != null) {
          
            if (Array.isArray(student)) {
              displayStudent = student
                .map(k => optionMap?.[k] || k)
                .join(", ");
            } else {
              displayStudent = optionMap?.[student] || student;
            }
          
          }
          return (
            <>
              
              {/* EXISTING RESULT BOX */}
              <div className={`review-result ${isCorrect ? "answer-correct" : "answer-wrong"}`}>
                
                <div className="review-status">
                  {isCorrect ? "✔ Correct" : "✖ Incorrect"}
                </div>
          
                <div className="review-details">
                  <div>
                    <strong>Your answer:</strong> {displayStudent || "—"}
                  </div>
          
                  {!isCorrect && (
                    <div>
                      <strong>Correct answer:</strong> {displayCorrect}
                    </div>
                  )}
                </div>
              </div>
          
              
            </>
          );
         
        })()}

        {/* NAVIGATION */}
        <div className="nav-buttons">
          <button disabled={currentIndex === 0} onClick={() => goToQuestion(currentIndex - 1)}>
            Previous
          </button>

          {currentIndex < flatQuestions.length - 1 ? (
            <button onClick={() => goToQuestion(currentIndex + 1)}>Next</button>
          ) : (
            !isReview && (
              <button onClick={() => setShowConfirmFinish(true)}>
                Finish Exam
              </button>
            )
          )}
        </div>
      </div>

      {showConfirmFinish && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h3>Finish Exam?</h3>
            <p>You won’t be able to change answers.</p>
            <button onClick={() => setShowConfirmFinish(false)}>Cancel</button>
            <button
              onClick={() => {
                setShowConfirmFinish(false);
                setMode("submitting");   // 🔑 UI LOCK
                finishExam();
              }}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
