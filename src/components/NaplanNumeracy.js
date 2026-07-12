import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from "react";
import "./NaplanNumeracyExam.css";

//import "./ExamPage.css";
import styles from "./ExamPageThinkingSkills.module.css";
import NaplanCalculator from "./NaplanCalculator";
import DraggableCalculator from "./DraggableCalculator";
import NaplanNumeracyReview from "./NaplanNumeracyReview";
import NaplanNumeracyReport from "./NaplanNumeracyReport";
import NaplanRuler from "./NaplanRuler";
import NaplanProtractor from "./NaplanProtractor";

/* ============================================================
  MAIN COMPONENT
============================================================ */
export default function NaplanNumeracy({
  onExamStart,
  onExamFinish,
  mode: parentMode,
  onBackToDashboard
}) {
  const studentId = sessionStorage.getItem("student_id");
  const API_BASE = process.env.REACT_APP_API_URL;
  const [showCalculator, setShowCalculator] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [showProtractor, setShowProtractor] = useState(false);
  
  const [examDates, setExamDates] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [showQuestionNavigator, setShowQuestionNavigator] =
    useState(false);
    const [classYear, setClassYear] = useState(null);
    const canUseCalculator = Number(classYear) >= 6;

  
  const [flaggedQuestions, setFlaggedQuestions] =
    useState({});
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
  
  const isPopNavigationRef = useRef(false);
  // ---------------- EXAM STATE ----------------
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQ = questions[currentIndex];
  console.log("MODE →", mode);

  if (currentQ) {
    console.log("QUESTION BLOCKS FOR CURRENT Q:", currentQ.question_blocks);
  }
  
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [explanations, setExplanations] = useState({});
  const [loadingExplanation, setLoadingExplanation] = useState(null);

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
  const hasImageMultiSelect =
  currentQ &&
  currentQ.question_blocks?.some(
      b =>
        b.type === "image-multi-select" &&
        Array.isArray(b.options) &&
        b.options.some(opt => opt.image && opt.image.trim() !== "")
    );
  const isCorrect = (() => {
  if (!currentQ) return false;

  const correctRaw = currentQ.correct_answer;
const studentRaw = answers[String(currentQ.id)];

if (currentQ.question_type === 2) {
const correct = normalizeCorrectAnswer(correctRaw, currentQ.question_type);
const student = normalizeStudentAnswer(studentRaw, currentQ.question_type);


return (
  Array.isArray(student) &&
  Array.isArray(correct) &&
  student.length === correct.length &&
  student.every(v => correct.includes(v))
);
}

if (currentQ.question_type === 3) {
return areNumbersEqual(studentRaw, correctRaw);
}

const correct = normalizeCorrectAnswer(correctRaw, currentQ.question_type);
const student = normalizeStudentAnswer(studentRaw, currentQ.question_type);

return student === correct;
})();
  const loadExamDates = useCallback(async () => {
  try {
    const examDatesUrl =
      parentMode === "report_homework" || parentMode === "homework"
        ? `${API_BASE}/api/student/exam-dates/naplan-numeracy-homework?student_id=${studentId}`
        : `${API_BASE}/api/student/exam-dates/naplan-numeracy?student_id=${studentId}`;

    const res = await fetch(examDatesUrl);

    if (!res.ok) {
      console.error("Failed to load exam dates:", res.status);
      return [];
    }

    const data = await res.json();

    setExamDates(data || []);

    if (data?.length > 0) {
      setSelectedExamId(data[0].exam_id);
    }

    return data || [];
  } catch (err) {
    console.error("Failed to load exam dates", err);
    return [];
  }
}, [API_BASE, studentId, parentMode]);

  /* ============================================================
    LOAD REPORT
  ============================================================ */
  const loadReport = useCallback(async (examId) => {
  console.log("🚀 loadReport called with examId:", examId);
  console.log("📌 parentMode:", parentMode);
  console.log("📌 parentMode === 'homework' ?", parentMode === "homework");

  if (!examId) {
    console.warn("⚠️ loadReport aborted: examId is missing");
    return;
  }

  const isHomeworkMode = parentMode?.includes("homework");

  console.log("📌 parentMode:", parentMode);
  console.log("📌 isHomeworkMode:", isHomeworkMode);

  const reportUrl = isHomeworkMode
    ? `${API_BASE}/api/student/exam-report/naplan-numeracy-homework?student_id=${studentId}&exam_id=${examId}`
    : `${API_BASE}/api/student/exam-report/naplan-numeracy?student_id=${studentId}&exam_id=${examId}`;

  console.log("🌐 Fetching URL:", reportUrl);

  try {
    const res = await fetch(reportUrl);

    console.log("📡 Response status:", res.status);

    if (!res.ok) {
      console.error("❌ API request failed");
      return;
    }

    const data = await res.json();

    console.log("📦 Response data:", data);

    setReport(data);
    setExamAttemptId(data.exam_attempt_id);
    setMode("report");

    console.log("✅ Report state updated");
  } catch (err) {
    console.error("🔥 loadReport error:", err);
  }
}, [API_BASE, studentId, parentMode]);
  function normalizeNumericValue(raw) {
    if (raw == null) return null;
  
    raw = String(raw).trim();
  
    // fraction support
    if (raw.includes("/")) {
      const [a, b] = raw.split("/");
      return Number(a) / Number(b);
    }
  
    // time support mm:ss
    if (raw.includes(":")) {
      const [m, s] = raw.split(":");
      return Number(m) * 60 + Number(s);
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
  useEffect(() => {
  if (!studentId) {
    console.log("❌ No studentId found in sessionStorage");
    return;
  }

  const loadStudentClassYear = async () => {
    const url = `${API_BASE}/api/student/profile?student_id=${studentId}`;
    console.log("📘 ABOUT TO FETCH STUDENT PROFILE:", url);

    try {
      const res = await fetch(url);
      console.log("📘 STUDENT PROFILE STATUS:", res.status);

      const text = await res.text();
      console.log("📘 STUDENT PROFILE RAW RESPONSE:", text);

      if (!res.ok) {
        console.error("❌ Failed to load student class year");
        return;
      }

      const data = JSON.parse(text);
      console.log("📘 STUDENT PROFILE JSON:", data);

      setClassYear(data.class_year);
    } catch (err) {
      console.error("❌ Failed to fetch student class year", err);
    }
  };

  loadStudentClassYear();
}, [API_BASE, studentId]);
useEffect(() => {
  if (!canUseCalculator) {
    setShowCalculator(false);
    setShowRuler(false);
    setShowProtractor(false);
  }
}, [canUseCalculator]);
  

  useEffect(() => {
  if (isReview) {
    setShowQuestionNavigator(false);
  }
}, [isReview]);
  useEffect(() => {
if (!studentId) return;
if (mode !== "loading") return;

// Report mode takes priority
if (parentMode?.startsWith("report")) {
  setMode("report");
  return;
}

// Exam + Homework both use exam screen
if (
  parentMode === "exam" ||
  parentMode === "homework"
) {
  setMode("exam");
}

}, [studentId, parentMode, mode, loadExamDates]);
  useEffect(() => {
    if (mode !== "report" && mode !== "review") return;
    loadExamDates();
  }, [mode, loadExamDates]);
    
  useEffect(() => {
    console.log("Selected exam changed:", selectedExamId);
  
    if (mode === "report" && selectedExamId) {
      loadReport(selectedExamId);
    }
  }, [selectedExamId, loadReport]);
  

      
  useEffect(() => {
if (mode !== "exam" || questions.length === 0) return;

// 🔥 Step 1: initial state
window.history.replaceState(
  { questionIndex: 0 },
  "",
  window.location.href
);

// 🔥 Step 2: buffer state (prevents exit)
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

  console.log("NUMERACY POPSTATE:", state);

  // 🔥 CASE 1: User is at Q1 → block exit
  if (currentIndex === 0) {
    if (!showConfirmFinish) {
      setShowConfirmFinish(true);
    }

    // keep user inside exam
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

useEffect(() => {
  if (mode !== "exam") return;

  const handleBeforeUnload = (e) => {
    e.preventDefault();
    e.returnValue = "";
    return "";
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, [mode]);
  
  
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

const startExam = async () => {
  const startUrl =
    parentMode === "homework"
      ? `${API_BASE}/api/student/start-homework-exam/naplan-numeracy`
      : `${API_BASE}/api/student/start-exam/naplan-numeracy`;

  const res = await fetch(startUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: studentId
    })
  });

  const data = await res.json();
  console.log("START EXAM RESPONSE →", data);
  

  if (data.completed === true) {
    await loadExamDates();
    setMode("report");
    return;
  }

  const qs =
    data.questions ||
    data.data?.questions ||
    [];

  setQuestions(qs);
  setTimeLeft(data.remaining_time);
  onExamStart?.();
};

startExam();

}, [
studentId,
mode,
parentMode,
API_BASE,
loadExamDates,
onExamStart
]);
    
  const formatExplanation = (text) => {
    if (!text) return "";
  
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong style='display:block; margin-top:10px;'>$1</strong>")
      .replace(/\n\n/g, "<br/><br/>")
      .replace(/\n/g, "<br/>");
  };
  /* ============================================================
    FINISH EXAM
  ============================================================ */
  
  const finishExam = useCallback(async () => {
  if (hasSubmittedRef.current) return;

  hasSubmittedRef.current = true;

  setMode("submitting");

  try {
    const finishUrl =
      parentMode === "homework"
        ? `${API_BASE}/api/student/finish-homework-exam/naplan-numeracy`
        : `${API_BASE}/api/student/finish-exam/naplan-numeracy`;

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
    const latestDates = await loadExamDates();

    if (latestDates?.length > 0) {
      setSelectedExamId(latestDates[0].exam_id);
    }

    setMode("report");

    onExamFinish?.();

  } catch (err) {
    console.error("Finish exam failed", err);
  }

}, [
  API_BASE,
  studentId,
  answers,
  parentMode,
  loadExamDates,
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
//generate explanation in exam review  
const handleGenerateExplanation = async (question) => {
const qid = String(question.id);

// prevent duplicate calls
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
        question: question.question_blocks,  // ✅ FIX
        options: question.options,
        correct_answer: question.correct_answer
      })
    }
  );

  const data = await res.json();

  setExplanations(prev => ({
    ...prev,
    [qid]: data.explanation
  }));

} catch (err) {
  console.error("Explanation failed", err);
} finally {
  setLoadingExplanation(null);
}
};
const toggleFlagQuestion = () => {

  const qid = String(currentQ.id);

  setFlaggedQuestions(prev => ({

    ...prev,

    [qid]: !prev[qid]

  }));
};
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
        examDates={examDates}
        selectedExamId={selectedExamId}
        onExamChange={(newExamId) => setSelectedExamId(newExamId)}
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

  

  /* ============================================================
    EXAM UI
  ============================================================ */
  if (mode === "exam" || mode === "review") {
    const hasClozeDropdownBlock = (currentQ?.question_blocks || []).some(
      b => b.type === "cloze-dropdown"
    );
    
    
return (
<div className={`exam-shell ${styles.examShell}`}>
  
  {/* 🔥 ALWAYS FETCH DATA */}
  <NaplanNumeracyReview
    studentId={studentId}
    examId={selectedExamId}
    mode={parentMode}
    onLoaded={(qs, studentAnswers) => {
      const normalizedAnswers = {};

      Object.entries(studentAnswers || {}).forEach(
        ([key, value]) => {
          if (typeof value === "string") {
            try {
              const parsed = JSON.parse(
                value.replace(/'/g, '"')
              );
              normalizedAnswers[String(key)] = parsed;
            } catch {
              normalizedAnswers[String(key)] = value;
            }
          } else {
            normalizedAnswers[String(key)] = value;
          }
        }
      );

      setQuestions(qs || []);
      setAnswers(normalizedAnswers);
      setCurrentIndex(0);
      setVisited({});
    }}
  />

  {/* 🔥 Loader */}
  {!questions.length && (
    <p style={{ textAlign: "center" }}>
      Loading review...
    </p>
  )}

  {/* 🔥 FULL UI */}
  {currentQ && (
    
      <div
        className={`exam-container ${styles.examContainer}`}
        style={{
          maxHeight: "100vh",
          overflowY: "auto",
          overflowX: "hidden"
        }}
      >
          {/* HEADER */}
          {/* HEADER */}
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
                  className="exit-review-btn-small"
                  onClick={() => {
                    setQuestions([]);
                    setAnswers({});
                    setVisited({});
                    setCurrentIndex(0);
                    setMode("report");
                  }}
                >
                  Exit Review
                </button>

                {examDates?.length > 0 && (
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
                    {examDates.map((d) => (
                      <option key={d.exam_id} value={d.exam_id}>
                        {new Date(d.date).toLocaleString("en-AU", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true
                        })}
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}
    </div>

    <div className="exam-progress">
      <div
        className="exam-progress-fill"
        style={{
          width: `${((currentIndex + 1) / questions.length) * 100}%`
        }}
      />
    </div>
  </div>

      {/* RIGHT: NAV BUTTONS */}
      {/* RIGHT: NAV BUTTONS */}
    <div className="exam-header-actions">
      <div className="header-nav-buttons">
        {!isReview && canUseCalculator && (
          <div className="gadget-toolbar">
            <button
              className={`gadget-btn ${showCalculator ? "active" : ""}`}
              onClick={() => setShowCalculator(prev => !prev)}
              title="Calculator"
              aria-label="Calculator"
              type="button"
            >
              🧮
            </button>

            <button
              className={`gadget-btn ${showProtractor ? "active" : ""}`}
              onClick={() => setShowProtractor(prev => !prev)}
              title="Protractor"
              aria-label="Protractor"
              type="button"
            >
              <img
                src="/icons/protractor.png"
                alt="Protractor"
                className="gadget-icon"
              />
            </button>

            <button
              className={`gadget-btn ${showRuler ? "active" : ""}`}
              onClick={() => setShowRuler(prev => !prev)}
              title="Ruler"
              aria-label="Ruler"
              type="button"
            >
              📏
            </button>
          </div>
        )}
        

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
            onClick={() => setShowConfirmFinish(true)}
          >
            Finish Exam
          </button>
        )}
   </div>

</div>
</div> 

        {/* QUESTION INDEX */}
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
                      Object.values(
                        flaggedQuestions
                      )
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

                {
                  questions.map((q, i) => {

                    let cls =
                      "question-index-item";

                    const qid =
                      String(q.id);

                    const studentAnswer =
                      answers[qid];

                    const correctAnswer =
                      normalizeCorrectAnswer(
                        q.correct_answer,
                        q.question_type
                      );

                    const normalizedStudentAnswer =
                      normalizeStudentAnswer(
                        studentAnswer,
                        q.question_type
                      );

                    let isCorrect = false;

                    if (isReview) {

                      if (
                        q.question_type === 2
                      ) {

                        if (
                          Array.isArray(
                            normalizedStudentAnswer
                          ) &&
                          Array.isArray(
                            correctAnswer
                          )
                        ) {

                          isCorrect =
                            normalizedStudentAnswer.length ===
                            correctAnswer.length &&

                            normalizedStudentAnswer.every(
                              (v) =>
                                correctAnswer.includes(v)
                            );
                        }

                      } else if (
                        q.question_type === 3
                      ) {

                        isCorrect =
                          areNumbersEqual(
                            studentAnswer,
                            q.correct_answer
                          );

                      } else {

                        isCorrect =
                          normalizedStudentAnswer ===
                          correctAnswer;
                      }

                      cls += isCorrect
                        ? " correct"
                        : " incorrect";

                    } else {

                      if (
                        studentAnswer !== undefined &&
                        (
                          typeof studentAnswer !== "object" ||
                          studentAnswer.length > 0
                        )
                      ) {

                        cls += " answered";

                      } else if (
                        visited[qid]
                      ) {

                        cls += " visited";

                      } else {

                        cls += " unanswered";
                      }
                    }

                    if (
                      i === currentIndex
                    ) {

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
                  })
                }

              </div>

            </div>

          )
        }

        {/* QUESTION + CALCULATOR LAYOUT */}
        <div className="question-layout">
          
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
                const text = block.content || "";

                if (text.includes("{{dropdown}}")) {
                  return null;
                }

                return (
                  <p
                    key={idx}
                    className="question-text"
                    style={{ color: "black", fontSize: "18px" }}
                  >
                    {text}
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
                const qid = String(currentQ.id);
                const sentence = block.sentence || block.content || "";
                const parts = sentence.split("{{dropdown}}");

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
                  <div
                    key={idx}
                    className="question-text cloze-inline-text"
                    style={{ color: "black", fontSize: "18px" }}
                  >
                    <span>{parts[0]}</span>

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
                      {(block.options || []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    <span>{parts[1]}</span>

                    {isReview && !isCorrectCloze && (
                      <div
                        className="correct-answer-text"
                        style={{ marginTop: "10px" }}
                      >
                        Correct answer: {correctAnswer}
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
                            !isReview && isSelected ? "selected" : "",
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
    ? answers[qid].map(v => String(v).trim().toUpperCase())
    : [];

  const correctAnswersRaw = normalizeCorrectAnswer(
    currentQ.correct_answer,
    currentQ.question_type
  );

  const correctAnswers = Array.isArray(correctAnswersRaw)
    ? correctAnswersRaw.map((ans) => {
        const normalizedAns = String(ans).trim();

        // backend already gives A/B/C...
        if (/^[A-Z]$/i.test(normalizedAns)) {
          return normalizedAns.toUpperCase();
        }

        // backend gives 1,2,3...
        if (/^\d+$/.test(normalizedAns)) {
          const idx = Number(normalizedAns) - 1;
          if (idx >= 0 && idx < block.options.length) {
            return String.fromCharCode(65 + idx);
          }
        }

        // backend gives label text
        const matchedIndex = block.options.findIndex(
          (opt) =>
            String(opt.label || "").trim().toLowerCase() ===
            normalizedAns.toLowerCase()
        );
        if (matchedIndex !== -1) {
          return String.fromCharCode(65 + matchedIndex);
        }

        return normalizedAns.toUpperCase();
      })
    : [];

  return (
    <div
      key={idx}
      className="image-multi-select-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "16px",
        marginTop: "20px"
      }}
    >
      {block.options.map((opt, optIdx) => {
        const optionKey = String.fromCharCode(65 + optIdx)
          .trim()
          .toUpperCase();

        const normalizedSelectedAnswers = Array.isArray(selectedAnswers)
          ? selectedAnswers.map(v => String(v).trim().toUpperCase())
          : [];

        const normalizedCorrectAnswers = Array.isArray(correctAnswers)
          ? correctAnswers.map(v => String(v).trim().toUpperCase())
          : [];

        const isSelected = normalizedSelectedAnswers.includes(optionKey);
        const isCorrectOption = normalizedCorrectAnswers.includes(optionKey);

        // ===== FORCE REVIEW COLORS INLINE =====
        let cardBorder = "1px solid #d1d5db";
        let cardBg = "#ffffff";
        let labelColor = "#111827";
        let imageWrapBg = "#ffffff";

        if (isReview) {
          if (isCorrectOption) {
            cardBorder = "3px solid #22c55e";
            cardBg = "#dcfce7";
            labelColor = "#166534";
            imageWrapBg = "#dcfce7";
          } else if (isSelected && !isCorrectOption) {
            cardBorder = "3px solid #ef4444";
            cardBg = "#fee2e2";
            labelColor = "#b91c1c";
            imageWrapBg = "#fee2e2";
          }
        } else if (isSelected) {
          cardBorder = "2px solid #3b82f6";
          cardBg = "#eff6ff";
          imageWrapBg = "#eff6ff";
        }

        return (
          <label
            key={optionKey}
            style={{
              borderRadius: "14px",
              padding: "12px",
              border: cardBorder,
              backgroundColor: cardBg,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              cursor: isReview ? "default" : "pointer",
              boxSizing: "border-box",
              width: "100%",
              minHeight: "220px"
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              disabled={
                isReview ||
                (!isSelected &&
                  normalizedSelectedAnswers.length >= TYPE_2_MAX_SELECTIONS)
              }
              onChange={() => {
                if (isReview) return;

                const updated = isSelected
                  ? normalizedSelectedAnswers.filter(v => v !== optionKey)
                  : [...normalizedSelectedAnswers, optionKey];

                handleAnswer(updated);
              }}
            />

            {/* image wrapper gets the same review color */}
            <div
              style={{
                width: "100%",
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: imageWrapBg,
                borderRadius: "10px",
                padding: "10px",
                boxSizing: "border-box"
              }}
            >
              <img
                src={opt.image}
                alt={opt.label || `Option ${optionKey}`}
                style={{
                  maxWidth: "100%",
                  maxHeight: "160px",
                  objectFit: "contain",
                  display: "block"
                }}
              />
            </div>

            <div
              style={{
                fontWeight: 600,
                color: labelColor,
                textAlign: "center"
              }}
            >
              {opt.label || `Shape ${optionKey}`}
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
                  // 🔍 DEBUG LOGS
                  console.log("--------------------------------------------------");
                  console.log("QUESTION ID:", currentQ.id);
                  console.log("OPTION KEY:", key);
                  console.log("OPTION VALUE:", value);
                  console.log("RAW correct_answer:", currentQ.correct_answer);
                  console.log("NORMALIZED correctAnswer:", correctAnswer);
                  console.log("STUDENT ANSWER:", studentAnswer);
                  console.log("isSelected:", isSelected);
                  console.log("isCorrectOption:", isCorrectOption);
                  console.log("reviewClass:", reviewClass);
                  console.log("mode:", mode);
                  
          
                  return (
                    <label
                      key={key}
                      className={`mcq-option-card ${isSelected && mode !== "review" ? "selected" : ""} ${reviewClass}`}
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
  <div
    className="image-mcq-grid"
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(420px, 1fr))",
      gap: "24px",
      justifyItems: "center",
      marginTop: "20px"
    }}
  >
    {Object.entries(currentQ.options || {}).map(([key, imgUrl]) => {
  const qid = String(currentQ.id);

  const studentAnswerRaw = answers[qid];
  const correctAnswerRaw = normalizeCorrectAnswer(
    currentQ.correct_answer,
    currentQ.question_type
  );

  const optionKey = String(key).trim();
  const optionValue = String(imgUrl).trim();

  // Normalize student answer to option key if backend stored image URL
  let normalizedStudentAnswer = "";
  if (studentAnswerRaw != null) {
    const rawStudent = String(studentAnswerRaw).trim();

    if (rawStudent === optionKey || rawStudent === optionValue) {
      normalizedStudentAnswer = optionKey;
    }
  }

  // Normalize correct answer to option key if backend stored image URL
  let normalizedCorrectAnswer = "";
  if (correctAnswerRaw != null) {
    const rawCorrect = String(correctAnswerRaw).trim();

    if (rawCorrect === optionKey || rawCorrect === optionValue) {
      normalizedCorrectAnswer = optionKey;
    }
  }

  const isSelected = normalizedStudentAnswer === optionKey;
  const isCorrectOption = normalizedCorrectAnswer === optionKey;

  console.log("===== NUMERACY TYPE 6 REVIEW DEBUG =====");
  console.log("qid:", qid);
  console.log("optionKey:", optionKey);
  console.log("optionValue:", optionValue);
  console.log("studentAnswerRaw:", studentAnswerRaw);
  console.log("normalizedStudentAnswer:", normalizedStudentAnswer);
  console.log("correctAnswerRaw:", correctAnswerRaw);
  console.log("normalizedCorrectAnswer:", normalizedCorrectAnswer);
  console.log("isSelected:", isSelected);
  console.log("isCorrectOption:", isCorrectOption);

      return (
        <div
          key={key}
          className={`image-mcq-card ${
            !isReview && isSelected ? "selected" : ""
          }`}
          style={{
            width: "420px",
            padding: "16px",
            borderRadius: "14px",
            boxSizing: "border-box",
            overflow: "visible",

            border: isReview
              ? isCorrectOption
                ? "3px solid #22c55e"
                : isSelected
                ? "3px solid #ef4444"
                : "2px solid #d9e2f2"
              : isSelected
              ? "3px solid #3b82f6"
              : "2px solid #d9e2f2",

            backgroundColor: isReview
              ? isCorrectOption
                ? "#ecfdf5"
                : isSelected
                ? "#fef2f2"
                : "#ffffff"
              : "#ffffff",

            boxShadow: isReview
              ? isCorrectOption
                ? "0 0 0 1px rgba(34,197,94,0.15)"
                : isSelected
                ? "0 0 0 1px rgba(239,68,68,0.15)"
                : "none"
              : "none"
          }}
          onClick={() => {
            if (!isReview) {
              handleAnswerForQuestion(currentQ.id, key);
            }
          }}
        >
          <div
            style={{
              width: "100%",
              minHeight: "220px",
              padding: "16px",
              borderRadius: "12px",
              backgroundColor: isReview
                ? isCorrectOption
                  ? "#dcfce7"
                  : isSelected
                  ? "#fee2e2"
                  : "#f8fafc"
                : "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box"
            }}
          >
            <img
              src={imgUrl}
              alt={`Option ${key}`}
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "100%",
                maxHeight: "260px",
                display: "block",
                objectFit: "contain",
                borderRadius: "10px"
              }}
            />
          </div>

          <div
            className="image-mcq-label"
            style={{
              marginTop: "10px",
              fontWeight: 700,
              textAlign: "center",
              color: isReview
                ? isCorrectOption
                  ? "#166534"
                  : isSelected
                  ? "#b91c1c"
                  : "#111827"
                : "#111827"
            }}
          >
            {key}
          </div>
        </div>
      );
    })}
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
    ? answers[qid].map(String)
    : [];

  const correctAnswersRaw = normalizeCorrectAnswer(
    currentQ.correct_answer,
    currentQ.question_type
  );

  const correctAnswers = Array.isArray(correctAnswersRaw)
    ? correctAnswersRaw.map(String)
    : [];

  const isFullyCorrect =
    selectedAnswers.length === correctAnswers.length &&
    selectedAnswers.every(v => correctAnswers.includes(v));

  return (
    <div className="text-multi-select-grid">
      {Object.entries(currentQ.options || {}).map(([key, value]) => {
        const normalizedKey = String(key);
        const isSelected = selectedAnswers.includes(normalizedKey);
        const isCorrectOption = correctAnswers.includes(normalizedKey);

        let optionClass = "text-option-card";

        // ✅ exam mode only
        if (!isReview && isSelected) {
          optionClass += " selected";
        }

        // ✅ review mode only
        if (isReview) {
          if (isCorrectOption) {
            optionClass += " review-correct";
          } else if (isSelected && !isCorrectOption) {
            optionClass += " review-wrong";
          }
        }

        return (
          <label key={key} className={optionClass}>
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
                  ? selectedAnswers.filter(v => v !== normalizedKey)
                  : [...selectedAnswers, normalizedKey];

                handleAnswer(updatedAnswers);
              }}
            />
            <span className="option-text">{value}</span>
          </label>
        );
      })}

      {isReview && (
        <>
          {!isFullyCorrect && (
            <div
              className="correct-answer-text"
              style={{ marginTop: "12px", gridColumn: "1 / -1" }}
            >
              <strong>Correct answer: </strong>
              {correctAnswers
                .map(key => currentQ.options?.[key])
                .join(", ")}
            </div>
          )}

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

      {/* ================= AI EXPLANATION ================= */}
{isReview && (
<div style={{ marginTop: "16px" }}>
  
  {!explanations[String(currentQ.id)] && (
    <button
      className="ai-explain-btn"
      onClick={() => handleGenerateExplanation(currentQ)}
      disabled={loadingExplanation === String(currentQ.id)}
    >
      {loadingExplanation === String(currentQ.id)
        ? "Generating..."
        : "Generate AI Explanation"}
    </button>
  )}

  {explanations[String(currentQ.id)] && (
    <div className="ai-explanation-box">
      <h4>Explanation</h4>
      <div
        dangerouslySetInnerHTML={{
          __html: formatExplanation(
            explanations[String(currentQ.id)]
          )
        }}
      />
    </div>
  )}

</div>
)}
            </div> {/* closes question-content-centered */}
          </div> {/* closes question-card */}
          </div> {/* closes question-layout */}
          {!isReview && canUseCalculator && showCalculator && (
            <DraggableCalculator
              initialX={window.innerWidth - 380}
              initialY={140}
              title="Calculator"
              width="340px"
            >
              <NaplanCalculator />
            </DraggableCalculator>
          )}

          {!isReview && canUseCalculator && showRuler && (
            <DraggableCalculator
              initialX={window.innerWidth - 520}
              initialY={220}
              title="Ruler"
              width="500px"
              transparentBody={true}
              hideBodyPadding={true}
              rotatable={true}
              initialRotation={0}
            >
              <NaplanRuler />
            </DraggableCalculator>
          )}
          {!isReview && canUseCalculator && showProtractor && (
            <DraggableCalculator
              initialX={window.innerWidth - 520}
              initialY={120}
              title="Protractor"
              width="520px"
              transparentBody={true}
              hideBodyPadding={true}
              rotatable={true}
              initialRotation={0}
            >
              <NaplanProtractor />
            </DraggableCalculator>
          )}
      
      

      

        
    </div>
  )}
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

)
};
}