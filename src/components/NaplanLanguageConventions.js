import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from "react";
import "./NaplanNumeracyExam.css";


import "./ExamPage.css";
import MatchingQuestion from "./MatchingQuestion";
import OrderingQuestion from "./OrderingQuestion";
import CalendarQuestion from "./CalendarQuestion";
import styles from "./ExamPageThinkingSkills.module.css";

import NaplanLanguageConventionsReview from "./NaplanLanguageConventionsReview";
import NaplanLanguageConventionsReport from "./NaplanLanguageConventionsReport";

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function NaplanLanguageConventions({
  onExamStart,
  onExamFinish,
  mode: parentMode,
  onBackToDashboard
}) {
  const studentId = sessionStorage.getItem("student_id");
  const API_BASE = process.env.REACT_APP_API_URL;
  //const API_BASE = "http://127.0.0.1:8000";
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
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  
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
    if ([8, 9, 10].includes(questionType)) {
        return correctAnswer;
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
    if ([8, 9, 10].includes(questionType)) {
        return answer;
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

  const [examDates, setExamDates] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [showQuestionNavigator, setShowQuestionNavigator] =
    useState(false);

  const [flaggedQuestions, setFlaggedQuestions] =
    useState({});
  const isHomework =
  parentMode === "homework" ||
  parentMode === "report_homework";
  const loadExamDates = useCallback(async () => {
  try {
    setIsLoadingDates(true); // 🔥 ADD

    const datesUrl = isHomework
      ? `${API_BASE}/api/student/exam-dates/naplan-language-conventions-homework?student_id=${studentId}`
      : `${API_BASE}/api/student/exam-dates/naplan-language-conventions?student_id=${studentId}`;

    const res = await fetch(datesUrl);
    if (!res.ok) return;

    const data = await res.json();

    setExamDates(data || []);

    if (data?.length > 0) {
      setSelectedExamId(data[0].exam_id);
    }

  } catch (err) {
    console.error("Failed to load exam dates", err);
  } finally {
    setIsLoadingDates(false); // 🔥 ADD
  }
}, [API_BASE, studentId, isHomework]);
  /* ============================================================
     LOAD REPORT
  ============================================================ */
  const loadReport = useCallback(async (examId) => {
  if (!examId) return;

  try {
    const reportUrl =
      isHomework
        ? `${API_BASE}/api/student/exam-report/naplan-language-conventions-homework?student_id=${studentId}&exam_id=${examId}`
        : `${API_BASE}/api/student/exam-report/naplan-language-conventions?student_id=${studentId}&exam_id=${examId}`;

    const res = await fetch(reportUrl);

    if (!res.ok) return;

    const data = await res.json();

    setReport(data);
    setExamAttemptId(data.exam_attempt_id);
    setMode("report");

  } catch (err) {
    console.error(err);
  }

}, [API_BASE, studentId, parentMode]);
  useEffect(() => {
  if (isReview) {
    setShowQuestionNavigator(false);
  }
}, [isReview]);
  useEffect(() => {
  if (mode !== "report") return;

  loadExamDates();

}, [mode, loadExamDates]);

useEffect(() => {
  if (mode !== "report") return;
  if (!selectedExamId) return;

  loadReport(selectedExamId);

}, [mode, selectedExamId, loadReport]);
  
  useEffect(() => {
  if (!studentId) return;
  if (mode !== "loading") return;

  if (parentMode?.startsWith("report")) {
    setMode("report");
    return;
  }

  if (parentMode === "exam" || parentMode === "homework") {
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

  if (
    parentMode !== "exam" &&
    parentMode !== "homework"
  ) return;

  const startExamNaplanLanguageConventions =
    async () => {
     
    const startUrl =
      isHomework
        ? `${API_BASE}/api/student/start-homework/naplan-language-conventions`
        : `${API_BASE}/api/student/start-exam/naplan-language-conventions`;

    try {
      const response = await fetch(
        startUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            student_id: studentId
          })
        }
      );

      const examPayload =
        await response.json();

      if (examPayload.completed) {
        await loadExamDates();
        setMode("report");
        return;
      }

      setQuestions(
        examPayload.questions || []
      );

      setTimeLeft(
        examPayload.remaining_time
      );

      onExamStart?.();

    } catch (error) {
      console.error(
        "Failed to start exam:",
        error
      );
    }
  };

  startExamNaplanLanguageConventions();

}, [
  studentId,
  mode,
  parentMode,
  API_BASE,
  loadReport,
  onExamStart
]);
  
  /* ============================================================
     FINISH EXAM
  ============================================================ */
  const finishExam = useCallback(async () => {
  if (hasSubmittedRef.current) return;

  hasSubmittedRef.current = true;

  try {
    const finishUrl =
      isHomework
        ? `${API_BASE}/api/student/finish-homework-exam/naplan-language-conventions`
        : `${API_BASE}/api/student/finish-exam/naplan-language-conventions`;

    await fetch(finishUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        student_id: studentId,
        answers
      })
    });

    await loadExamDates();
    setMode("report");

    onExamFinish?.();

  } catch (err) {
    console.error(err);
  }

}, [
  API_BASE,
  studentId,
  answers,
  parentMode,
  loadReport,
  onExamFinish
]);

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
  useEffect(() => {
  if (mode !== "exam") return;

  const handleBeforeUnload = (e) => {
    e.preventDefault();
    e.returnValue = "";
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, [mode]);

  /* ============================================================
     ANSWERS
  ============================================================ */
  const handleAnswer = (value) => {
    const qid = String(questions[currentIndex]?.id);
    if (!qid) return;
  
    setAnswers(prev => ({ ...prev, [qid]: value }));
    setVisited(prev => ({ ...prev, [qid]: true }));
  };
  const toggleFlagQuestion = () => {

  const qid = String(currentQ.id);

  setFlaggedQuestions(prev => ({

    ...prev,

    [qid]: !prev[qid]

  }));
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
 // ✅ show loading first
if (mode === "report" && isLoadingDates) {
  return <p className="loading">Generating your report...</p>;
}

// ✅ show empty only AFTER loading
if (mode === "report" && !isLoadingDates && examDates.length === 0) {
  return (
    <div className="no-report">
      <h3>No reports available yet</h3>
      <p>Please complete an exam first.</p>
    </div>
  );
}
  if (mode === "report") {
    return (
      <NaplanLanguageConventionsReport
        report={report}
        examDates={examDates}
        selectedExamId={selectedExamId}
        onExamChange={(id) => {
          setQuestions([]);
          setSelectedExamId(id);
        }}
        onViewExamDetails={() => {
          setQuestions([]);
          setCurrentIndex(0);
          setVisited({});
          setAnswers({});
          setMode("review");
        }}
        onBackToDashboard={onBackToDashboard}
      />
    );
  }

  if (mode === "review" && !questions.length) {
    return (
      <NaplanLanguageConventionsReview
        mode={parentMode}
        studentId={studentId}
        examId={selectedExamId}
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
  console.log("CURRENT QUESTION", currentQ);
  console.log("QUESTION TYPE", currentQ?.question_type);
  console.log("BLOCKS", currentQ?.question_blocks);
  console.log("CORRECT ANSWER", currentQ?.correct_answer);
  console.log("STUDENT ANSWER", answers[String(currentQ?.id)]);
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
  console.log(
      "QUESTION TYPE:",
      currentQ.question_type
  );

  console.log(
      "normalizedStudentAnswer:",
      normalizedStudentAnswer
  );

  console.log(
      "normalizedCorrectAnswer:",
      normalizedCorrectAnswer
  );

  return (
    <div
      className={`exam-shell ${styles.examShell}`}
      style={{
        height: "100vh",
        overflow: "hidden"
      }}
    >
      <div
        className={`exam-container ${styles.examContainer}`}
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        
        {/* HEADER */}
        {/* HEADER */}
<div className="exam-header">
  {/* LEFT: TIMER */}
  {!isReview ? (
    <div className="exam-header-left">
      <div className="timer">
        ⏳ {formatTime(timeLeft)}
      </div>
    </div>
  ) : (
    <div className="exam-header-left" />
  )}

  {/* CENTER: QUESTION + PROGRESS */}
  <div className="question-header-center">
    <div className="question-counter-inline">
      <span className="question-counter-text">
        Question {currentIndex + 1} of {questions.length}
      </span>

      <button
        className="question-grid-toggle"
        onClick={() => setShowQuestionNavigator(prev => !prev)}
      >
        ▦
      </button>

      {isReview && (
        <>
          <button
            className="exit-review-btn"
            onClick={() => {
              setQuestions([]);
              setAnswers({});
              setVisited({});
              setCurrentIndex(0);
              setMode("report");
            }}
          >
            ← Exit Review
          </button>

          {examDates.length > 0 && (
            <select
              className="review-exam-dropdown"
              value={selectedExamId || ""}
              onChange={(e) => {
                setQuestions([]);
                setAnswers({});
                setVisited({});
                setCurrentIndex(0);
                setSelectedExamId(Number(e.target.value));
              }}
            >
              {examDates.map((item) => (
                <option key={item.exam_id} value={item.exam_id}>
                  {new Date(item.date).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </option>
              ))}
            </select>
          )}
        </>
      )}
    </div>

    {!isReview && (
      <div className="exam-progress">
        <div
          className="exam-progress-fill"
          style={{
            width: `${((currentIndex + 1) / questions.length) * 100}%`
          }}
        />
      </div>
    )}
  </div>

  {/* RIGHT: NAV BUTTONS */}
  {/* RIGHT: NAV BUTTONS */}
<div className="exam-header-actions">
  <div className="header-nav-buttons">
    <button
      className="nav-btn prev"
      disabled={currentIndex === 0}
      onClick={() => goToQuestion(currentIndex - 1)}
    >
      Previous
    </button>

    {!isReview && (
      <button
        className={`flag-btn ${
          flaggedQuestions[String(currentQ.id)] ? "flagged" : ""
        }`}
        onClick={toggleFlagQuestion}
      >
        🚩 {flaggedQuestions[String(currentQ.id)] ? "Unflag" : "Flag"}
      </button>
    )}

    {isReview ? (
      <button
        className="nav-btn next"
        disabled={currentIndex === questions.length - 1}
        onClick={() => goToQuestion(currentIndex + 1)}
      >
        Next
      </button>
    ) : currentIndex < questions.length - 1 ? (
      <button
        className="nav-btn next"
        onClick={() => goToQuestion(currentIndex + 1)}
      >
        Next
      </button>
    ) : (
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
</div>

        {/* QUESTION INDEX (same as Thinking Skills) */}
        {
          showQuestionNavigator && (

            <div className="question-index-wrapper">
            {!isReview && (
              <div className="question-summary-row">

                <div className="summary-item">
                  <span className="summary-count">
                    {
                      questions.filter(q =>
                        answers[String(q.id)] !== undefined
                      ).length
                    }
                  </span>

                  <span className="summary-label">
                    Answered
                  </span>
                </div>

                <div className="summary-item">
                  <span className="summary-count">
                    {
                      questions.length -
                      questions.filter(q =>
                        answers[String(q.id)] !== undefined
                      ).length
                    }
                  </span>

                  <span className="summary-label">
                    Not answered
                  </span>
                </div>

                <div className="summary-item">
                  <span className="summary-count">
                    {
                      questions.filter(q =>
                        !visited[String(q.id)]
                      ).length
                    }
                  </span>

                  <span className="summary-label">
                    Not read
                  </span>
                </div>

                <div className="summary-item">
                  <span className="summary-count">
                    {
                      Object.values(flaggedQuestions)
                        .filter(Boolean)
                        .length
                    }
                  </span>

                  <span className="summary-label">
                    Flagged
                  </span>
                </div>

              </div>
            )}

              <div className="question-index-bar">

                {questions.map((q, i) => {

                  let cls = "question-index-item";

                  const qid = String(q.id);

                  if (isReview) {

                    cls += q.is_correct
                      ? " correct"
                      : " incorrect";

                  } else {

                    if (
                      answers[qid] !== undefined &&
                      (
                        typeof answers[qid] !== "object" ||
                        answers[qid].length > 0
                      )
                    ) {
                      cls += " answered";

                    } else if (visited[qid]) {
                      cls += " visited";

                    } else {
                      cls += " unanswered";
                    }
                  }

                  if (i === currentIndex) {
                    cls += " current";
                  }

                  return (
                    <button
                      key={q.id}
                      className={cls}

                      onClick={() => {

                        goToQuestion(i);

                        if (!isReview) {
                          setShowQuestionNavigator(false);
                        }
                      }}
                    >

                      <div className="question-index-content">

                        <span>
                          {i + 1}
                        </span>

                        {
                          flaggedQuestions[qid] && (
                            <span className="question-flag">
                              🚩
                            </span>
                          )
                        }

                      </div>

                    </button>
                  );
                })}

              </div>

            </div>

          )
        }

        {/* QUESTION */}
    <div
      className="question-card"
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        paddingRight: "6px"
      }}
    >
  <div className="question-content-centered">
    {!currentQ.question_blocks?.some(b => b.type === "text") &&
      currentQ.question_text && (
        <p className="question-text">
          {currentQ.question_text}
        </p>
    )}
    {currentQ.question_blocks?.map((block, idx) => {

        if (block.type === "matching") {
            return (
                <MatchingQuestion
                    key={idx}
                    block={block}
                    answer={answers[String(currentQ.id)]}
                    onAnswer={handleAnswer}
                    review={isReview}
                    correctAnswer={currentQ.correct_answer}
                />
            );
        }
        if (block.type === "ordering") {
            return (
                <OrderingQuestion
                    key={idx}
                    block={block}
                    answer={answers[String(currentQ.id)]}
                    onAnswer={handleAnswer}
                    review={isReview}
                    correctAnswer={currentQ.correct_answer}
                />
            );
        }

        if (block.type === "calendar") {
            return (
                <CalendarQuestion
                    key={idx}
                    block={block}
                    answer={answers[String(currentQ.id)]}
                    onAnswer={handleAnswer}
                    review={isReview}
                    correctAnswer={currentQ.correct_answer}
                />
            );
        }

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

  const studentAnswer =
    normalizeStudentAnswer(answers[qid], currentQ.question_type) || "";

  const correctAnswer =
    normalizeCorrectAnswer(currentQ.correct_answer, currentQ.question_type) || "";

  const isClozeCorrect =
    String(studentAnswer).trim().toLowerCase() ===
    String(correctAnswer).trim().toLowerCase();

  return (
    <div key={idx} className="cloze-sentence">
      {parts[0]}

      <select
        className="cloze-dropdown"
        value={studentAnswer}
        onChange={(e) => handleAnswer(e.target.value)}
        disabled={isReview}
        style={{
          backgroundColor: isReview
            ? isClozeCorrect
              ? "#dcfce7"
              : "#fee2e2"
            : "#fff",
          border: isReview
            ? isClozeCorrect
              ? "2px solid #22c55e"
              : "2px solid #ef4444"
            : "1px solid #d1d5db",
          color: "#111827",
          fontWeight: isReview ? 600 : 400,
          borderRadius: "10px",
          padding: "8px 12px"
        }}
      >
        <option value="" disabled>
          Select
        </option>

        {block.options.map((opt, i) => {
          const key = String.fromCharCode(65 + i);
          return (
            <option key={key} value={opt}>
              {opt}
            </option>
          );
        })}
      </select>

      {parts[1]}

      {isReview && !isClozeCorrect && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px 12px",
            borderRadius: "8px",
            background: "#f0fdf4",
            border: "1px solid #22c55e",
            color: "#166534",
            fontWeight: 500
          }}
        >
          <strong>Correct answer:</strong> {correctAnswer}
        </div>
      )}
    </div>
  );
}

      if (block.type === "word-selection") {
        const sentenceWords = block.sentence.split(" ");

        return (
          <div key={idx} className="word-selection-panel">
            <div className="sentence-container">
              {sentenceWords.map((word, i) => {
                const cleanWord = word.replace(/[.,!?]/g, "").trim();
                const isSelectable = block.selectable_words.includes(cleanWord);

                const isSelected =
                  normalizedStudentAnswer === cleanWord;

                const isCorrectWord =
                  normalizedCorrectAnswer === cleanWord;

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
                    className={`sentence-word
                      ${isSelectable ? "selectable" : "non-selectable"}
                      ${!isReview && isSelected ? "selected" : ""}
                      ${reviewClass}
                    `}
                    onClick={() => {
                      if (!isReview && isSelectable) {
                        handleAnswer(cleanWord);
                      }
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
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
    {currentQ.question_type === 4 && (() => {
  const studentAnswer =
    normalizeStudentAnswer(answers[qid], currentQ.question_type) || "";

  const correctAnswer =
    normalizeCorrectAnswer(currentQ.correct_answer, currentQ.question_type) || "";

  const isTextCorrect =
    studentAnswer.trim().toLowerCase() ===
    String(correctAnswer).trim().toLowerCase();

  return (
    <>
      <textarea
        className="text-input"
        rows={2}
        placeholder="Type your answer here"
        value={studentAnswer}
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
        style={{
          backgroundColor: isReview
            ? isTextCorrect
              ? "#dcfce7"
              : "#fee2e2"
            : "#fff",
          border: isReview
            ? isTextCorrect
              ? "2px solid #22c55e"
              : "2px solid #ef4444"
            : "1px solid #d1d5db",
          color: "#111827"
        }}
      />

      {isReview && !isTextCorrect && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px 12px",
            borderRadius: "8px",
            background: "#f0fdf4",
            border: "1px solid #22c55e",
            color: "#166534",
            fontWeight: 500
          }}
        >
          <strong>Correct answer:</strong> {correctAnswer}
        </div>
      )}
    </>
  );
})()}
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
      const key = String.fromCharCode(65 + idx);
      const selected = Array.isArray(answers[qid]) ? answers[qid] : [];
      const correctAnswers = Array.isArray(normalizedCorrectAnswer)
        ? normalizedCorrectAnswer
        : [];

      const isSelected = selected.includes(key);
      const isCorrectOption = correctAnswers.includes(key);

      let optionClass = "text-option-card";

      if (isReview) {
        if (isCorrectOption) {
          optionClass += " review-correct";
        } else if (isSelected && !isCorrectOption) {
          optionClass += " review-wrong";
        }
      } else {
        if (isSelected) {
          optionClass += " selected";
        }
      }

      return (
        <label key={key} className={optionClass}>
          <input
            type="checkbox"
            checked={isSelected}
            disabled={isReview}
            onChange={() => {
              if (isReview) return;

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

        
      </div>

      {showConfirmFinish && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.55)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999999
    }}
  >
    <div
      style={{
        width: "420px",
        maxWidth: "90vw",
        background: "#fff",
        borderRadius: "16px",
        padding: "32px",
        textAlign: "center",
        boxShadow: "0 20px 50px rgba(0,0,0,.25)"
      }}
    >
      <h3
        style={{
          margin: "0 0 16px",
          fontSize: "34px",
          fontWeight: 700,
          color: "#0f172a"
        }}
      >
        Finish Exam?
      </h3>

      <p
        style={{
          margin: "0 0 28px",
          fontSize: "20px",
          lineHeight: 1.5,
          color: "#4b5563"
        }}
      >
        You won't be able to change your answers after submission.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "14px"
        }}
      >
        <button
          onClick={() => setShowConfirmFinish(false)}
          style={{
            padding: "12px 28px",
            border: "none",
            borderRadius: "8px",
            background: "#e5e7eb",
            color: "#374151",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Cancel
        </button>

        <button
          onClick={() => {
            setShowConfirmFinish(false);
            setMode("submitting");
            finishExam();
          }}
          style={{
            padding: "12px 28px",
            border: "none",
            borderRadius: "8px",
            background: "#2563eb",
            color: "#fff",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer"
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
