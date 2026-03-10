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
     * - submitting
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
  
    // Handle stringified objects like "{'value': 'B'}"
    if (typeof correctAnswer === "string") {
      try {
        const parsed = JSON.parse(correctAnswer.replace(/'/g, '"'));
  
        if (parsed && parsed.value !== undefined) {
          correctAnswer = parsed.value;
        } else {
          correctAnswer = parsed;
        }
      } catch {
        // Not JSON, leave as string
      }
    }
  
    // Handle actual object
    if (
      typeof correctAnswer === "object" &&
      correctAnswer !== null &&
      correctAnswer.value !== undefined
    ) {
      correctAnswer = correctAnswer.value;
    }
  
    // Multi-select
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
    function normalizeNumericValue(raw) {
      if (raw === null || raw === undefined) return null;
    
      // If DB sent object like { value: "5" }
      if (typeof raw === "object" && raw.value !== undefined) {
        raw = raw.value;
      }
    
      // Trim strings
      if (typeof raw === "string") {
        raw = raw.trim();
        if (raw === "") return null;
      }
    
      const number = Number(raw);
    
      if (isNaN(number)) return null;
    
      return number;
    }
    function areNumbersEqual(a, b) {
      const numA = normalizeNumericValue(a);
      const numB = normalizeNumericValue(b);
    
      if (numA === null || numB === null) return false;
    
      return numA === numB;
    }
    /* ============================================================
       START / RESUME EXAM
    ============================================================ */
    useEffect(() => {
      if (!studentId) return;
      if (hasSubmittedRef.current) return;
      if (
        mode === "report" ||
        mode === "review" ||
        mode === "submitting"
      ) {
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
        onLoaded={(qs, studentAnswers) => {
          const normalizedAnswers = {};
        
          Object.entries(studentAnswers || {}).forEach(([key, value]) => {
            if (typeof value === "string") {
              // convert "['E']" into ["E"]
              try {
                const parsed = JSON.parse(value.replace(/'/g, '"'));
                normalizedAnswers[String(key)] = parsed;
              } catch {
                normalizedAnswers[String(key)] = value;
              }
            } else {
              normalizedAnswers[String(key)] = value;
            }
          });
        
          setQuestions(qs || []);
          setAnswers(normalizedAnswers);
          setCurrentIndex(0);
          setVisited({});
        }}
      />
    );
  }
  
    /* ============================================================
       EXAM UI
    ============================================================ */
    const currentQ = questions[currentIndex];
    if (!currentQ) return null;
  
    const hasImageMultiSelect =
      currentQ.question_blocks?.some(
        b =>
          b.type === "image-multi-select" &&
          Array.isArray(b.options) &&
          b.options.some(opt => opt.image && opt.image.trim() !== "")
      );
  
    const isCorrect =
      mode === "review"
        ? (() => {
            const correctRaw = currentQ.correct_answer;
            const studentRaw = answers[String(currentQ.id)];
    
            // ✅ Type 2 (multi-select)
            if (currentQ.question_type === 2) {
              const correct = normalizeCorrectAnswer(
                correctRaw,
                currentQ.question_type
              );
    
              const student = normalizeStudentAnswer(
                studentRaw,
                currentQ.question_type
              );
    
              return (
                Array.isArray(student) &&
                Array.isArray(correct) &&
                student.length === correct.length &&
                student.every((v) => correct.includes(v))
              );
            }
    
            // ✅ Type 3 (numeric)
            if (currentQ.question_type === 3) {
              return areNumbersEqual(studentRaw, correctRaw);
            }
    
            // ✅ Default (Type 1, 4, 6)
            const correct = normalizeCorrectAnswer(
              correctRaw,
              currentQ.question_type
            );
    
            const student = normalizeStudentAnswer(
              studentRaw,
              currentQ.question_type
            );
    
            return student === correct;
          })()
        : null;
    const seenTextBlocks = new Set();
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
  
          {/* QUESTION INDEX */}
          <div className={styles.indexRow}>
            {questions.map((q, i) => {
              let cls = styles.indexCircle;
              const qid = String(q.id);

              const studentAnswer = answers[qid];

              const correctAnswer = normalizeCorrectAnswer(
                q.correct_answer,
                q.question_type
              );

              const normalizedStudentAnswer = normalizeStudentAnswer(
                studentAnswer,
                q.question_type
              );

              let isCorrect = false;

              if (isReview) {
                if (q.question_type === 2) {
                  if (
                    Array.isArray(normalizedStudentAnswer) &&
                    Array.isArray(correctAnswer)
                  ) {
                    isCorrect =
                      normalizedStudentAnswer.length === correctAnswer.length &&
                      normalizedStudentAnswer.every((v) =>
                        correctAnswer.includes(v)
                      );
                  }
                }
                
                // ✅ ADD THIS BLOCK
                else if (q.question_type === 3) {
                   console.log("TYPE 3 CHECK");
                    console.log("Student:", studentAnswer);
                    console.log("Correct:", q.correct_answer);
                    console.log("Equal?:", areNumbersEqual(studentAnswer, q.correct_answer));

                  isCorrect = areNumbersEqual(studentAnswer, q.correct_answer);
                }
                
                // Default for Type 1, 4, 6
                else {
                  isCorrect = normalizedStudentAnswer === correctAnswer;
                }

                if (isCorrect) {
                  cls += ` ${styles.indexCorrect}`;
                } else {
                  cls += ` ${styles.indexWrong}`;
                }
              } else {
                if (
                  studentAnswer !== undefined &&
                  (typeof studentAnswer !== "object" ||
                    studentAnswer.length > 0)
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
  
          {/* QUESTION CARD */}
          <div className="question-card">
            <div className="question-content-centered">
              {!currentQ.question_blocks?.some(b => b.type === "text") &&
                currentQ.question_text && (
                  <p className="question-text">
                    {currentQ.question_text}
                  </p>
                )}
  
              

              {(currentQ.question_blocks || []).map((block, idx) => {

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

                  const correctAnswer = normalizeCorrectAnswer(
                    currentQ.correct_answer,
                    currentQ.question_type
                  );

                  const studentAnswer = normalizeStudentAnswer(
                    answers[qid],
                    currentQ.question_type
                  );

                  const isCorrectCloze = studentAnswer === correctAnswer;

                  return (
                    <div key={idx} className="cloze-sentence">
                      {parts[0]}

                      <select
                        className={`cloze-dropdown ${
                          isReview
                            ? isCorrectCloze
                              ? "review-correct"
                              : "review-wrong"
                            : ""
                        }`}
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

                      {/* Review feedback */}
                      {isReview && !isCorrectCloze && (
                        <div className="correct-answer-text">
                          Correct answer: {currentQ.options?.[correctAnswer] || correctAnswer}
                        </div>
                      )}
                    </div>
                  );
                }
  
                if (block.type === "word-selection") {
                  const sentenceWords = block.sentence.split(" ");
                  const qid = String(currentQ.id);

                  const correctAnswer = normalizeCorrectAnswer(
                    currentQ.correct_answer,
                    currentQ.question_type
                  );

                  const studentAnswer = normalizeStudentAnswer(
                    answers[qid],
                    currentQ.question_type
                  );

                  return (
                    <div key={idx} className="sentence-container">
                      {sentenceWords.map((word, i) => {
                        const cleanWord = word.replace(/[.,!?]/g, "");
                        const isSelectable =
                          block.selectable_words.includes(cleanWord);

                        const isSelected = studentAnswer === cleanWord;
                        const isCorrectWord = correctAnswer === cleanWord;

                        let reviewClass = "";

                        if (isReview) {
                          if (isCorrectWord) {
                            reviewClass = "review-correct";
                          } else if (isSelected && !isCorrectWord) {
                            reviewClass = "review-wrong";
                          }
                        }

                        return (
                          <span
                            key={i}
                            className={[
                              "sentence-word",
                              isSelectable ? "selectable" : "non-selectable",
                              isSelected ? "selected" : "",
                              reviewClass
                            ].join(" ")}
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

                      {/* Show correct answer if wrong */}
                      {isReview && studentAnswer !== correctAnswer && (
                        <div className="correct-answer-text">
                          Correct answer: {correctAnswer}
                        </div>
                      )}
                    </div>
                  );
                }
  
                if (block.type === "image-multi-select") {
                  const qid = String(currentQ.id);
                  const selectedAnswers = Array.isArray(answers[qid])
                    ? answers[qid]
                    : [];

                  const correctAnswers = normalizeCorrectAnswer(
                    currentQ.correct_answer,
                    currentQ.question_type
                  );

                  return (
                    <div key={idx} className="image-multi-select-grid">
                      {block.options.map((opt) => {
                        console.log("QUESTION ID:", qid);
                        console.log("Correct Answers:", correctAnswers);
                        console.log("Student Answers:", selectedAnswers);
                        console.log("Current option id:", opt.id);
                        const isSelected = selectedAnswers.map(String).includes(String(opt.id));

                        const isCorrectOption =
                          Array.isArray(correctAnswers) &&
                          correctAnswers.map(String).includes(String(opt.id));

                        let reviewClass = "";

                        if (mode === "review") {
                          if (isCorrectOption && isSelected) {
                            reviewClass = "review-correct";
                          } 
                          else if (isCorrectOption && !isSelected) {
                            reviewClass = "review-wrong"; // missed correct
                          } 
                          else if (!isCorrectOption && isSelected) {
                            reviewClass = "review-wrong"; // wrongly selected
                          }
                        }

                        return (
                          <label
                            key={opt.id}
                            className={`image-option-card ${
                              isSelected ? "selected" : ""
                            } ${reviewClass}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={
                                isReview ||
                                (!isSelected &&
                                  selectedAnswers.length >= TYPE_2_MAX_SELECTIONS)
                              }
                              onChange={() => {
                                if (isReview) return;

                                const updated = isSelected
                                  ? selectedAnswers.filter((v) => v !== opt.id)
                                  : [...selectedAnswers, opt.id];

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
  
              {currentQ.question_type === 4 && (
                <textarea
                  className="text-input"
                  rows={2}
                  value={answers[String(currentQ.id)] || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  disabled={isReview}
                />
              )}
  
              {currentQ.question_type === 1 && (
              <div className="mcq-options">
                {Object.entries(currentQ.options || {}).map(
                  ([key, value]) => {
                    const qid = String(currentQ.id);
                    const studentAnswer = answers[qid];
                    console.log("QUESTION ID:", currentQ.id);
                    console.log("RAW correct_answer:", currentQ.correct_answer);
                    const correctAnswer = normalizeCorrectAnswer(
                      currentQ.correct_answer,
                      currentQ.question_type
                    );
            
                    const isSelected = studentAnswer === key;
                    const isCorrectOption = key === correctAnswer;
            
                    let reviewClass = "";
            
                    if (mode === "review") {
                      if (isCorrectOption) {
                        reviewClass = "review-correct";
                      } else if (isSelected && studentAnswer !== correctAnswer) {
                        reviewClass = "review-wrong";
                      }
                    }
            
                    return (
                      <label
                        key={key}
                        className={`mcq-option-card ${
                          isSelected ? "selected" : ""
                        } ${reviewClass}`}
                      >
                        <input
                          type="radio"
                          name={`q-${currentQ.id}`}
                          checked={isSelected}
                          onChange={() => handleAnswer(key)}
                          disabled={isReview}
                        />
                        <span>{key}. {value}</span>
                      </label>
                    );
                  }
                )}
              </div>
            )}
  
              {currentQ.question_type === 6 && (
                <div className="image-mcq-grid">
                  {Object.entries(currentQ.options || {}).map(
                    ([key, imgUrl]) => {
                      const qid = String(currentQ.id);
                      const studentAnswer = answers[qid];
              
                      const correctAnswer = normalizeCorrectAnswer(
                        currentQ.correct_answer,
                        currentQ.question_type
                      );
              
                      const isSelected = studentAnswer === key;
                      const isCorrectOption = key === correctAnswer;
              
                      let reviewClass = "";
              
                      if (mode === "review") {
                        if (isCorrectOption) {
                          reviewClass = "review-correct";
                        } else if (isSelected && studentAnswer !== correctAnswer) {
                          reviewClass = "review-wrong";
                        }
                      }
              
                      return (
                        <div
                          key={key}
                          className={`image-mcq-card ${
                            isSelected ? "selected" : ""
                          } ${reviewClass}`}
                          onClick={() => {
                            if (!isReview) {
                              handleAnswerForQuestion(currentQ.id, key);
                            }
                          }}
                        >
                          <img
                            src={imgUrl}
                            alt={`Option ${key}`}
                            className="image-mcq-image"
                          />
                          <div className="image-mcq-label">{key}</div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
  
              {currentQ.question_type === 3 && (
              <>
                <input
                  type="text"
                  className={`numeric-input ${
                    isReview
                      ? isCorrect
                        ? "review-correct"
                        : "review-wrong"
                      : ""
                  }`}
                  value={answers[String(currentQ.id)] || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                
                    // allow only digits, ".", "/", ":"
                    if (/^[0-9./:]*$/.test(value)) {
                      handleAnswer(value);
                    }
                  }}
                  disabled={isReview}
                />
            
                {/* ✅ Show correct answer in review mode */}
                {isReview && (
                  <div className="numeric-review-feedback">
                    {!isCorrect && (
                      <div className="correct-answer-text">
                        Correct answer: {normalizeCorrectAnswer(
                          currentQ.correct_answer,
                          currentQ.question_type
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
              
  
              
{currentQ.question_type === 2 && !hasImageMultiSelect && (() => {

  const qid = String(currentQ.id);

  const selectedAnswers = Array.isArray(answers[qid])
    ? answers[qid]
    : [];

  const correctAnswers = normalizeCorrectAnswer(
    currentQ.correct_answer,
    currentQ.question_type
  );

  const isFullyCorrect =
    Array.isArray(correctAnswers) &&
    selectedAnswers.length === correctAnswers.length &&
    selectedAnswers.every(v => correctAnswers.includes(v));

  return (
    <div className="text-multi-select-grid">

      {Object.entries(currentQ.options || {}).map(([key, value]) => {

        const isSelected = selectedAnswers.map(String).includes(String(key));

        const isCorrectOption =
          Array.isArray(correctAnswers) &&
          correctAnswers.map(String).includes(String(key));

        let reviewClass = "";

        if (mode === "review") {
          if (isCorrectOption) {
            reviewClass = "review-correct";
          } 
          else if (isSelected && !isCorrectOption) {
            reviewClass = "review-wrong";
          }
        }

        return (
          <label
            key={key}
            className={`text-option-card ${
              isSelected ? "selected" : ""
            } ${reviewClass}`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              disabled={
                isReview ||
                (!isSelected &&
                  selectedAnswers.length >= TYPE_2_MAX_SELECTIONS)
              }
              onChange={() => {
                if (isReview) return;

                const updatedAnswers = isSelected
                  ? selectedAnswers.filter((v) => v !== key)
                  : [...selectedAnswers, key];

                handleAnswer(updatedAnswers);
              }}
            />
            <span className="option-text">{value}</span>
          </label>
        );
      })}

      {/* ✅ Explicit Correct Answer Display */}
     {/* ✅ Explicit Correct Answer Display */}
      {mode === "review" && (
        <>
          {/* Show correct answer only if not fully correct */}
          {!isFullyCorrect && (
            <div
              className="correct-answer-text"
              style={{ marginTop: "12px", gridColumn: "1 / -1" }}
            >
              <strong>Correct answer: </strong>
              {Array.isArray(correctAnswers)
                ? correctAnswers
                    .map(key => currentQ.options?.[key])
                    .join(", ")
                : ""}
            </div>
          )}
      
          {/* Always show what student selected */}
          <div
            style={{
              marginTop: "8px",
              gridColumn: "1 / -1"
            }}
          >
            <strong>Your answer: </strong>
            <span
              style={{
                color: isFullyCorrect ? "#16a34a" : "#dc2626",
                fontWeight: 600
              }}
            >
              {selectedAnswers.length > 0
                ? selectedAnswers
                    .map(key => currentQ.options?.[key])
                    .join(", ")
                : "No answer selected"}
            </span>
          </div>
        </>
      )}
      

    </div>
  );
})()}


        </div> {/* closes question-content-centered */}
        </div> {/* closes question-card */}
        
        <div className="exam-navigation">
        
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
  
          </div> {/* closes exam-container */}
  </div>
  );
}
  

