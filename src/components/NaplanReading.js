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

    const startExam = async () => {
      const res = await fetch(
        `${API_BASE}/api/student/start-exam/naplan-reading`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_id: studentId })
        }
      );

      const data = await res.json();

      // 🔍 LOG FULL EXAM PAYLOAD
      console.group("📘 NAPLAN READING EXAM PAYLOAD");
      console.log("Raw response:", data);
      console.log("Questions:", data.questions);
      console.log("Remaining time:", data.remaining_time);
      console.groupEnd();

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
    const qid = String(currentQ?.id);
    if (!qid) return;

    setAnswers(prev => ({ ...prev, [qid]: value }));
    setVisited(prev => ({ ...prev, [qid]: true }));
  };

  const goToQuestion = (idx) => {
    if (idx < 0 || idx >= flatQuestions.length) return;

    const qid = String(flatQuestions[idx].id);
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
            answers[String(currentQ.id)],
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
    p.questions.some(q => q.id === currentQ.id)
  );

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

                if (block.type === "text") {
                  return <p key={idx}>{block.content}</p>;
                }

                if (block.type === "multi_select") {
                  const selected = answers[String(currentQ.id)] || [];
                  const imageOptions = currentQ.exam_bundle.image_options;
                  const textOptions = currentQ.exam_bundle.options;

                  const optionsSource = imageOptions || textOptions;

                  return (
                    <div key={idx} className="mcq-options">
                      {Object.entries(optionsSource).map(([k, v]) => {
                        const isSelected = selected.includes(k);

                        return (
                          <label
                            key={k}
                            className={`mcq-option-card ${isSelected ? "selected" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isReview}
                              onChange={() => {
                                const updated = isSelected
                                  ? selected.filter(x => x !== k)
                                  : [...selected, k];

                                handleAnswer(updated);
                              }}
                            />

                            {/* 🔥 IMAGE OPTION */}
                            {imageOptions ? (
                              <img
                                src={v}
                                alt={`Option ${k}`}
                                className="option-image"
                              />
                            ) : (
                              <span>{k}. {v}</span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  );
                }

                if (block.type === "gap_fill") {
                  return (
                    <input
                      key={idx}
                      className="text-input"
                      value={answers[String(currentQ.id)] || ""}
                      onChange={(e) => handleAnswer(e.target.value)}
                      disabled={isReview}
                    />
                  );
                }

                if (block.type === "true_false") {
                  return (
                    <div key={idx} className="tf-options">
                      {block.statements.map((stmt, i) => (
                        <div key={i} className="tf-row">
                          <span>{stmt}</span>
                          <select
                            value={answers[String(currentQ.id)]?.[i] || ""}
                            disabled={isReview}
                            onChange={(e) => {
                              const prev = answers[String(currentQ.id)] || [];
                              const updated = [...prev];
                              updated[i] = e.target.value;
                              handleAnswer(updated);
                            }}
                          >
                            <option value="">Select</option>
                            <option value="True">True</option>
                            <option value="False">False</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  );
                }

                return null;
              })}
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
