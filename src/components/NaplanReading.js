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
  function hasAnswered(question, answers) {
    const qid = question.question_id;
    const value = answers[qid];
  
    if (value == null) return false;
  
    switch (question.question_type) {
      case 1: // single choice
      case 3: // gap fill
      case 6: // single gap
        return value !== "";
  
      case 2: // multi select
        return Array.isArray(value) && value.length > 0;
  
      case 5: // true/false
        return Array.isArray(value) && value.some(v => v !== null);
  
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
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);

  // ---------------- REPORT ----------------
  const [report, setReport] = useState(null);
  const [examAttemptId, setExamAttemptId] = useState(null);

  /* ============================================================
     NORMALIZATION HELPERS (REUSED FROM NUMERACY)
  ============================================================ */
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

    return String(correctAnswer).trim();
  };

  const normalizeStudentAnswer = (answer, questionType) => {
    if (answer == null) return null;

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

  /* ============================================================
     START / RESUME EXAM
  ============================================================ */
  useEffect(() => {
  if (!studentId) return;
  if (mode === "report" || mode === "review") return;

  // 🔒 HARD RESET FIRST (prevents ghost answers)
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
      console.group("🛰️ START-EXAM RESPONSE");
      console.log("completed:", data.completed);
      console.log("is_resumed:", data.is_resumed);
      console.log("answers from API:", data.answers);
      console.log("questions count:", data.questions?.length);
      console.groupEnd();

      console.group("📘 NAPLAN READING EXAM PAYLOAD");
      console.log("Raw response:", data);
      console.log("Existing answers:", data.answers);
      console.log("is_resumed:", data.is_resumed);
      console.groupEnd();

      if (data.completed === true) {
        await loadReport();
        console.log("🧠 RENDER answers state:", answers);
        return;
      }

      setQuestions(data.questions || []);
      setTimeLeft(data.remaining_time);

      // Resume ONLY if backend explicitly says so
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
    if (mode !== "exam" || timeLeft == null) return;

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
        onLoaded={(qs) => {
          setQuestions(qs);
          setCurrentIndex(0);
          setVisited({});
          setAnswers({});
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
      ? (() => {
          const correct = normalizeCorrectAnswer(
            currentQ.exam_bundle.correct_answer,
            currentQ.question_type
          );

          const student = normalizeStudentAnswer(
            answers[String(currentQ.question_id)],
            currentQ.question_type
          );

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

  /* ============================================================
     CURRENT PASSAGE
  ============================================================ */
  const currentPassage = passages.find(p =>
    p.questions.some(q => q.question_id === currentQ.question_id)
  );
  console.log("🧠 ACTUAL RENDER answers:", answers);

  return (
    <div className="exam-shell">
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
        
            return (
              <button
                key={q.question_id}
                className={[
                  "question-index-item",
                  isAnswered ? "answered" : "unanswered",
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
          <div className="question-pane">
            <div className="question-card">
          
              {currentQ.exam_bundle.question_blocks
                .filter(b => b.type !== "reading")
                .map((block, idx) => {
          
                  // ✅ TYPE 7: WORD SELECT
                  if (block.type === "word_select") {
                    const qid = String(currentQ.question_id);
                    const selected = answers[qid] || "";
          
                    return (
                      <div key={idx} className="word-select-block">
                        <p className="word-select-text">{block.text}</p>
          
                        <div className="word-select-options">
                          {block.options.map(option => (
                            <label key={option} className="word-select-option">
                              <input
                                type="radio"
                                name={`word-select-${qid}`}
                                value={option}
                                checked={selected === option}
                                disabled={isReview}
                                onChange={() => handleAnswer(option)}
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  }
                if (block.type === "gap_fill") {
                  const qid = String(currentQ.question_id);

                  // Split sentence on [BLANK]
                  const [before, after] = block.content.split("[BLANK]");

                  return (
                    <div key={idx} className="gap-fill-block">

                      {/* Instruction */}
                      <p className="gap-fill-instruction">
                        Choose the word that best completes the sentence below.
                      </p>

                      {/* ✅ Inline sentence */}
                      <p className="gap-fill-text">
                        {before}

                        <select
                          className="gap-dropdown inline"
                          value={answers[qid] || ""}
                          disabled={isReview}
                          onChange={(e) => handleAnswer(e.target.value)}
                        >
                          <option value="">Select</option>
                          {block.word_bank.map(word => (
                            <option key={word} value={word}>
                              {word}
                            </option>
                          ))}
                        </select>

                        {after}
                      </p>
                    </div>
                  );
                }
                if (block.type === "single_gap") {
                  const qid = String(currentQ.question_id);

                  // Split on [BLANK]
                  const parts = block.content.split("[BLANK]");
                  const before = parts[0] ?? "";
                  const after = parts[1] ?? "";

                  return (
                    <div key={idx} className="gap-fill-block">

                      {/* Instruction */}
                      

                      {/* Inline sentence */}
                      <p className="gap-fill-text">
                        {before}

                        <select
                          className="gap-dropdown inline"
                          value={answers[qid] || ""}
                          disabled={isReview}
                          onChange={(e) => handleAnswer(e.target.value)}
                        >
                          <option value="">Select</option>
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
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return null;
              })

            {/* 2️⃣ OPTIONS — RENDER ONCE PER QUESTION */}
            {(() => {
              if ([6].includes(currentQ.question_type)) {
                return null;
              }

              const imageOptions = currentQ.exam_bundle.image_options;
              const textOptions = currentQ.exam_bundle.options;
              const optionsSource = imageOptions || textOptions;

              if (!optionsSource) return null;

              // MULTI SELECT
              // MULTI SELECT — checkbox list (vertical)
              if (currentQ.question_type === 2) {
                const selected = answers[String(currentQ.question_id)] || [];

                return (
                  <div className="mcq-options list">
                    {Object.entries(optionsSource).map(([k, v]) => {
                      const isSelected = selected.includes(k);

                      return (
                        <label key={k} className="mcq-option-row">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isReview}
                            onChange={() => {
                              let updated;
                            
                              if (isSelected) {
                                // always allow unselect
                                updated = selected.filter(x => x !== k);
                              } else {
                                // block if max reached
                                if (selected.length >= TYPE_2_MAX_SELECTIONS) {
                                  return; // 🚫 do nothing
                                }
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

                    return (
                      <label key={k} className="mcq-option-row">
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

          </div>
        </div>

      </div>

        {mode === "review" && (
          <div className={`review-result ${isCorrect ? "answer-correct" : "answer-wrong"}`}>
            {isCorrect ? "✔ Correct" : "✖ Incorrect"}
          </div>
        )}

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
            <button onClick={finishExam}>Submit</button>
          </div>
        </div>
      )}
    </div>
  );
}
