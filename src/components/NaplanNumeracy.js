
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
    const [examDates, setExamDates] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState(null);
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
    const loadExamDates = useCallback(async () => {
  try {
    const res = await fetch(
      `${API_BASE}/api/student/exam-dates/naplan-numeracy?student_id=${studentId}`
    );

    if (!res.ok) return;

    const data = await res.json();

    setExamDates(data || []);

    // 🔥 always select latest after refresh
    if (data?.length > 0) {
      setSelectedExamId(data[0].exam_id);
    }

  } catch (err) {
    console.error("Failed to load exam dates", err);
  }
}, [API_BASE, studentId]);
  
    /* ============================================================
       LOAD REPORT
    ============================================================ */
    const loadReport = useCallback(async (examId) => {
  console.log("🚀 loadReport called with examId:", examId);

  if (!examId) {
    console.warn("⚠️ loadReport aborted: examId is missing");
    return;
  }

  const url = `${API_BASE}/api/student/exam-report/naplan-numeracy?student_id=${studentId}&exam_id=${examId}`;
  console.log("🌐 Fetching URL:", url);

  try {
    const res = await fetch(url);

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
}, [API_BASE, studentId]);      
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
      loadExamDates();
    }, [loadExamDates]);
      
    useEffect(() => {
      console.log("Selected exam changed:", selectedExamId);
    
      if (selectedExamId) {
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
          await loadExamDates(); // 🔥 this will trigger report automatically
          return;
        }
  
        setQuestions(data.questions || []);
        setTimeLeft(data.remaining_time);
        setMode("exam");
        onExamStart?.();
      };
  
      startExam();
    }, [studentId, API_BASE, loadReport, mode, onExamStart]);
  
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
        await fetch(
          `${API_BASE}/api/student/finish-exam/naplan-numeracy`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_id: studentId, answers })
          }
        );
  
        await loadExamDates();
        
        onExamFinish?.();
      } catch (err) {
        console.error("Finish exam failed", err);
      }
    }, [API_BASE, studentId, answers, loadExamDates, onExamFinish]);
  
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
        />
      );
    }
  
    if (mode === "review" && !questions.length) {
  return (
    <NaplanNumeracyReview
      studentId={studentId}
      examId={selectedExamId}
      examDates={examDates}
      selectedExamId={selectedExamId}
      onExamChange={(id) => setSelectedExamId(id)}
      onLoaded={(qs, studentAnswers) => {
        const normalizedAnswers = {};

        Object.entries(studentAnswers || {}).forEach(([key, value]) => {
          if (typeof value === "string") {
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
    if (mode === "review") {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f6f7f9"
      }}
    >
      {/* 🔷 HEADER (NOW ALWAYS VISIBLE) */}
      <div
        style={{
          padding: "16px 24px",
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div style={{ fontWeight: 600 }}>
          NAPLAN Numeracy Review
        </div>

        <select
          value={selectedExamId || ""}
          onChange={(e) => {
            const newId = Number(e.target.value);
            console.log("📅 Switching exam:", newId);

            // 🔥 RESET STATE BEFORE LOAD
            setQuestions([]);
            setAnswers({});
            setCurrentIndex(0);
            setVisited({});

            setSelectedExamId(newId);
          }}
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1"
          }}
        >
          {examDates?.map((exam) => (
            <option key={exam.exam_id} value={exam.exam_id}>
              {exam.completed_at
              ? new Date(exam.completed_at).toLocaleString()
              : "Unknown Date"}
            </option>
          ))}
        </select>
      </div>

      {/* 🔄 CONTENT AREA */}
      {!questions.length ? (
  <div
    style={{
      flex: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}
  >
    <p>Loading review...</p>
  </div>
) : (
  <div style={{ flex: 1, overflowY: "auto" }}>
    {(() => {
  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  return (
    <div className={`exam-shell ${styles.examShell}`}>
      <div className={`exam-container ${styles.examContainer}`}>

        {/* HEADER */}
        <div className={styles.examHeader}>
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

            let isCorrectLocal = false;

            if (mode === "review") {
              if (q.question_type === 2) {
                if (
                  Array.isArray(normalizedStudentAnswer) &&
                  Array.isArray(correctAnswer)
                ) {
                  isCorrectLocal =
                    normalizedStudentAnswer.length === correctAnswer.length &&
                    normalizedStudentAnswer.every(v =>
                      correctAnswer.includes(v)
                    );
                }
              } else if (q.question_type === 3) {
                isCorrectLocal = areNumbersEqual(studentAnswer, q.correct_answer);
              } else {
                isCorrectLocal = normalizedStudentAnswer === correctAnswer;
              }

              cls += isCorrectLocal
                ? ` ${styles.indexCorrect}`
                : ` ${styles.indexWrong}`;
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

        {/* QUESTION TEXT */}
        <div className="question-card">
          <div className="question-content-centered">
            {currentQ.question_text && (
              <p className="question-text">
                {currentQ.question_text}
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
})()}
  </div>
)}
);
}
    
return null;    
}
  

