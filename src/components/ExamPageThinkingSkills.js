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

        if (!res.ok || data.completed) {
          setCompleted(true);
          setLoading(false);
          return;
        }

        setQuestions(data.questions || []);
        setTimeLeft(data.remaining_time);
        setLoading(false);
      } catch (err) {
        console.error("start-exam error:", err);
      }
    };

    startExam();
  }, [studentId]);

  /* -----------------------------------------------------------
     MARK PREVIOUS QUESTION AS VISITED (ONLY IF UNANSWERED)
  ----------------------------------------------------------- */
  useEffect(() => {
    if (prevIndexRef.current !== null) {
      const prevIdx = prevIndexRef.current;
      const prevQid = questions[prevIdx]?.q_id;

      if (prevQid && !answers[prevQid]) {
        setVisited((prev) => ({
          ...prev,
          [prevIdx]: true
        }));
      }
    }

    prevIndexRef.current = currentIndex;
  }, [currentIndex, questions, answers]);

  /* -----------------------------------------------------------
     FINISH EXAM (SAFE + GUARDED)
  ----------------------------------------------------------- */
  const finishExam = useCallback(async () => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    const payload = {
      student_id: studentId,
      answers: answers
    };

    console.log("finish-exam payload:", payload);

    try {
      await fetch(
        "https://web-production-481a5.up.railway.app/api/student/finish-exam",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
    } catch (err) {
      console.error("finish-exam error:", err);
    }

    setCompleted(true);
  }, [studentId, answers]);

  /* -----------------------------------------------------------
     TIMER (AUTO-SUBMIT WHEN TIME EXPIRES)
  ----------------------------------------------------------- */
  useEffect(() => {
    if (timeLeft === null || completed) return;

    if (timeLeft <= 0) {
      finishExam();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, completed, finishExam]);

  /* -----------------------------------------------------------
     ANSWER HANDLING
  ----------------------------------------------------------- */
  const handleAnswer = (option) => {
    const qid = questions[currentIndex]?.q_id;
    if (!qid) return;

    setAnswers((prev) => ({
      ...prev,
      [qid]: option
    }));
  };

  /* -----------------------------------------------------------
     NAVIGATION
  ----------------------------------------------------------- */
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
        <p>You have already completed this exam.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  return (
    <div className="exam-container">
      {/* Header */}
      <div className="exam-header">
        <div className="timer">⏳ {formatTime(timeLeft)}</div>
        <div className="counter">
          Question {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Question Index Bar */}
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

      {/* Question Card */}
      <div className="question-card">
        <p className="question-text">{currentQ.question}</p>

        {Array.isArray(currentQ.options) &&
          currentQ.options.map((opt, i) => (
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

      {/* Navigation */}
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
          <button onClick={finishExam}>
            Finish Exam
          </button>
        )}
      </div>
    </div>
  );
}
