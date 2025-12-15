import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from "react";
import "./ExamPage.css";

export default function ExamPageThinkingSkills() {
  const studentId = sessionStorage.getItem("student_id");

  const hasSubmittedRef = useRef(false);
  const prevIndexRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [completed, setCompleted] = useState(false);

  /* -----------------------------------------------------------
     START / RESUME EXAM
  ----------------------------------------------------------- */
  useEffect(() => {
    if (!studentId) return;

    const startExam = async () => {
      try {
        const res = await fetch(
          "https://web-production-481a5.up.railway.app/api/student/start-exam",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_id: studentId })
          }
        );

        const data = await res.json();
        console.log("📥 start-exam response:", data);

        if (!res.ok) {
          setCompleted(true);
          setLoading(false);
          return;
        }

        // ❗ DO NOT auto-complete here
        setQuestions(data.questions || []);
        setTimeLeft(data.remaining_time);
        setLoading(false);

      } catch (err) {
        console.error("❌ start-exam error:", err);
      }
    };

    startExam();
  }, [studentId]);

  /* -----------------------------------------------------------
     MARK VISITED QUESTIONS
  ----------------------------------------------------------- */
  useEffect(() => {
    if (prevIndexRef.current !== null) {
      const prevIdx = prevIndexRef.current;
      const prevQid = questions[prevIdx]?.q_id;

      if (prevQid && !answers[prevQid]) {
        setVisited(prev => ({
          ...prev,
          [prevIdx]: true
        }));
      }
    }

    prevIndexRef.current = currentIndex;
  }, [currentIndex, questions, answers]);

  /* -----------------------------------------------------------
     FINISH EXAM (GUARDED, SINGLE SOURCE)
  ----------------------------------------------------------- */
  const finishExam = useCallback(
    async (reason = "submitted") => {
      if (hasSubmittedRef.current) return;
      hasSubmittedRef.current = true;

      const totalQuestions = questions.length;
      const attemptedQuestions = Object.keys(answers).length;
      const skippedQuestions = totalQuestions - attemptedQuestions;

      const payload = {
        student_id: studentId,
        answers: answers,

        // exam truth
        total_questions: totalQuestions,
        attempted_questions: attemptedQuestions,
        skipped_questions: skippedQuestions,

        completed_reason: reason
      };

      console.log("📤 finish-exam payload:", payload);

      try {
        const res = await fetch(
          "https://web-production-481a5.up.railway.app/api/student/finish-exam",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }
        );

        const data = await res.json();
        console.log("📥 finish-exam response:", data);

      } catch (err) {
        console.error("❌ finish-exam error:", err);
      }

      setCompleted(true);
    },
    [studentId, answers, questions.length]
  );

  /* -----------------------------------------------------------
     TIMER (AUTO SUBMIT)
  ----------------------------------------------------------- */
  useEffect(() => {
    if (timeLeft === null || completed) return;

    if (timeLeft <= 0) {
      finishExam("time_expired");
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, completed, finishExam]);

  /* -----------------------------------------------------------
     ANSWER HANDLING
  ----------------------------------------------------------- */
  const handleAnswer = (option) => {
    const qid = questions[currentIndex]?.q_id;
    if (!qid) return;

    setAnswers(prev => ({
      ...prev,
      [qid]: option
    }));
  };

  const goToQuestion = (idx) => {
    setCurrentIndex(idx);
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  /* -----------------------------------------------------------
     RENDER
  ----------------------------------------------------------- */
  if (loading) {
    return <p className="loading">Loading exam…</p>;
  }

  if (completed) {
    return (
      <div className="completed-screen">
        <h1>🎉 Exam Finished</h1>
        <p>Your exam has been submitted successfully.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  return (
    <div className="exam-container">
      <div className="exam-header">
        <div className="timer">⏳ {formatTime(timeLeft)}</div>
        <div className="counter">
          Question {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="index-row">
        {questions.map((q, i) => (
          <div
            key={q.q_id}
            className={`index-circle ${
              answers[q.q_id]
                ? "index-answered"
                : visited[i]
                ? "index-visited"
                : "index-not-visited"
            }`}
            onClick={() => goToQuestion(i)}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <div className="question-card">
        <p className="question-text">{currentQ.question}</p>

        {currentQ.options?.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            className={`option-btn ${
              answers[currentQ.q_id] === opt ? "selected" : ""
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="nav-buttons">
        <button
          onClick={() => goToQuestion(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          Previous
        </button>

        {currentIndex < questions.length - 1 ? (
          <button onClick={() => goToQuestion(currentIndex + 1)}>
            Next
          </button>
        ) : (
          <button onClick={() => finishExam("manual_submit")}>
            Finish Exam
          </button>
        )}
      </div>
    </div>
  );
}
