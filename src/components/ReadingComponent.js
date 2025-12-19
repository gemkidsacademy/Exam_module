import React, { useEffect, useMemo, useState } from "react";
import "./ExamPage_reading.css";

export default function ReadingComponent({ studentId }) {
  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  /* =============================
     STATE
  ============================= */
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);

  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [finished, setFinished] = useState(false);

  const [sessionId, setSessionId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  /* =============================
     HELPERS
  ============================= */
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const prettyTopic = (t = "Other") =>
    t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  /* =============================
     LOAD EXAM
  ============================= */
  useEffect(() => {
    if (!studentId) return;

    const loadExam = async () => {
      const res = await fetch(
        `${BACKEND_URL}/api/exams/start-reading?student_id=${studentId}`,
        { method: "POST" }
      );

      const data = await res.json();

      console.log("🧪 API RESPONSE DATA:", data);


      if (data.finished === true) {
        setFinished(true);
        loadReport();
        return;
      }

      // 🔑 Reading exams come directly from exam_json.questions
      const flatQuestions = (data.exam_json?.sections || []).flatMap(section =>
        (section.questions || []).map(q => ({
          ...q,
          topic: section.topic,
          answer_options: section.answer_options || {},
          reading_material: section.reading_material || {}
        }))
      );
      console.log("📘 Flattened questions count:", flatQuestions.length);

      setExam(data.exam_json);
      setQuestions(flatQuestions);
      setSessionId(data.session_id);

      const durationSeconds = (data.duration_minutes || 40) * 60;
      const start = new Date(data.start_time).getTime();
      const now = new Date(data.server_now).getTime();

      setTimeLeft(
        Math.max(durationSeconds - Math.floor((now - start) / 1000), 0)
      );
    };

    loadExam();
  }, [studentId]);

  /* =============================
     TIMER
  ============================= */
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) autoSubmit();

    const t = setInterval(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  /* =============================
     GROUP QUESTIONS BY TOPIC
  ============================= */
  const groupedQuestions = useMemo(() => {
    const g = {};
    questions.forEach((q, i) => {
      const key = q.topic || "Other";
      if (!g[key]) g[key] = [];
      g[key].push(i);
    });
    return g;
  }, [questions]);

  /* =============================
     LOAD REPORT
  ============================= */
  const loadReport = async () => {
    setLoadingReport(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/exams/reading-report?student_id=${studentId}`
      );
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error("❌ report load error:", err);
    } finally {
      setLoadingReport(false);
    }
  };

  /* =============================
     SUBMIT
  ============================= */
  const autoSubmit = async () => {
    if (finished) return;

    try {
      await fetch(`${BACKEND_URL}/api/exams/submit-reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          answers,
          report: {} // 🔑 backend-required placeholder
        })
      });

      setFinished(true);
      await loadReport();
    } catch (err) {
      console.error("❌ submit-reading error:", err);
    }
  };

  /* =============================
     ANSWER HANDLING
  ============================= */
  const handleSelect = (letter) => {
    const q = questions[index];
    setAnswers((prev) => ({
      ...prev,
      [q.question_id]: letter
    }));
  };

  const goTo = (i) => {
    setVisited((v) => ({ ...v, [i]: true }));
    setIndex(i);
  };

  /* =============================
     FINISHED VIEW
  ============================= */
  if (finished) {
    if (loadingReport || !report) {
      return <div>Loading your report…</div>;
    }

    return (
      <div className="report-container">
        <h1>
          You scored {report.correct} out of {report.total}
        </h1>

        <div className="report-grid">
          <div className="card">
            <h3>Accuracy</h3>
            <div className="accuracy-circle" style={{ "--p": report.accuracy }}>
              <span>{report.accuracy}%</span>
            </div>
          </div>

          <div className="card">
            <h3>Topic Breakdown</h3>

            {report.topics.map((t) => (
              <div key={t.topic} className="improve-row">
                <label>{prettyTopic(t.topic)}</label>
                <div className="bar">
                  <div
                    className="fill blue"
                    style={{ width: `${t.accuracy}%` }}
                  />
                </div>
                <span>{t.accuracy}%</span>
                <small>
                  Attempted: {t.attempted} | Correct: {t.correct} | Incorrect:{" "}
                  {t.incorrect} | Not Attempted: {t.not_attempted}
                </small>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* =============================
     SAFE GUARD
  ============================= */
  const currentQuestion = questions[index];
  if (!exam || !currentQuestion) {
    return <div>Loading Exam…</div>;
  }

  const options = currentQuestion.answer_options;
  const rm = currentQuestion.reading_material || {};
  

  /* =============================
     EXAM UI
  ============================= */
  return (
    <div className="exam-container">
      <div className="exam-header">
        <div>Reading Comprehension Exam</div>
        <div className="timer-box">Time Left: {formatTime(timeLeft)}</div>
        <div className="counter">
          Question {index + 1} / {questions.length}
        </div>
      </div>

      <div className="question-index-grouped">
        {Object.entries(groupedQuestions).map(([topic, idxs]) => (
          <div key={topic} className="topic-group">
            <div className="topic-title">{prettyTopic(topic)}</div>
            <div className="topic-circles">
              {idxs.map((i) => (
                <div
                  key={i}
                  className={`index-circle ${
                    i === index ? "active" : ""
                  } ${answers[questions[i].question_id] ? "answered" : ""}`}
                  onClick={() => goTo(i)}
                >
                  {questions[i].question_number}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="exam-body">
        <div className="passage-pane">
          {rm.title && <h3>{rm.title}</h3>}
        
          {/* Comparative Analysis */}
          {rm.extracts && (
            <div className="extracts">
              {Object.entries(rm.extracts).map(([key, text]) => (
                <div key={key} className="extract">
                  <strong>{key}.</strong> {text}
                </div>
              ))}
            </div>
          )}
        
          {/* Gapped Text */}
          {rm.content && (
            <p className="reading-content">{rm.content}</p>
          )}
        
          {/* Main Idea / Paragraph-based */}
          {rm.paragraphs &&
            Object.entries(rm.paragraphs).map(([num, text]) => (
              <p key={num} className="reading-paragraph">
                <strong>{num}.</strong> {text}
              </p>
            ))}
        </div>

        <div className="question-pane">
          <p className="question-text">
            Q{currentQuestion.question_number}.{" "}
            {currentQuestion.question_text}
          </p>

          <div className="options">
            {Object.entries(options).map(([k, v]) => (
              <button
                key={k}
                className={`option-btn ${
                  answers[currentQuestion.question_id] === k
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleSelect(k)}
              >
                <strong>{k}.</strong> {v}
              </button>
            ))}
          </div>

          <div className="nav-buttons">
            <button disabled={index === 0} onClick={() => goTo(index - 1)}>
              Previous
            </button>

            {index < questions.length - 1 ? (
              <button onClick={() => goTo(index + 1)}>Next</button>
            ) : (
              <button onClick={autoSubmit}>Finish</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
