import React, { useEffect, useMemo, useState } from "react";
import "./ExamPage_reading.css";

export default function ReadingComponent({
    studentId,
    onExamStart,
    onExamFinish
  }) {
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
  const normalizedReport = useMemo(() => {
    if (!report) return null;
  
    return {
      total: report.overall.total_questions,
      attempted: report.overall.attempted,
      correct: report.overall.correct,
      incorrect: report.overall.incorrect,
      not_attempted: report.overall.not_attempted,
      accuracy: report.overall.accuracy,
      topics: report.topics || [],
      improvement_order: report.improvement_order || []
    };
  }, [report]);
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
        setSessionId(data.session_id);
        setFinished(true);
        onExamFinish?.();  
        return;
      }

      // 🔑 Reading exams come directly from exam_json.questions
      const flatQuestions = (data.exam_json?.sections || []).flatMap(section =>
          (section.questions || []).map(q => ({
            ...q,
            topic: section.topic,
        
            // ✅ prefer question options, fallback to section options
            answer_options: q.answer_options || section.answer_options || {},
        
            section_ref: section
          }))
        );

      console.log("📘 Flattened questions count:", flatQuestions.length);

      setExam(data.exam_json);
      setQuestions(flatQuestions);
      setSessionId(data.session_id);
      onExamStart?.();  

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
        const key = q.section_ref.section_id;
    
        if (!g[key]) {
          g[key] = {
            topic: q.section_ref.topic,
            indexes: []
          };
        }
    
        g[key].indexes.push(i);
      });
      return g;
    }, [questions]);

  /* =============================
     LOAD REPORT
  ============================= */
  const loadReport = async () => {
  if (!sessionId) return;

  setLoadingReport(true);
  console.log("📊 Loading report for session:", sessionId);

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/exams/reading-report?session_id=${sessionId}`
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ report load failed:", errText);
      return;
    }

    const data = await res.json();
    setReport(data);

  } catch (err) {
    console.error("❌ report load error:", err);
  } finally {
    setLoadingReport(false);
  }
};
useEffect(() => {
  if (finished && sessionId) {
    loadReport();
  }
}, [finished, sessionId]);


  /* =============================
     SUBMIT
  ============================= */
  const autoSubmit = async () => {
  if (finished) return;

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/exams/submit-reading`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          answers   // 🔑 raw answers only (keyed by question_id)
        })
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ submit-reading failed:", errText);
      return;
    }

    setFinished(true);
    onExamFinish?.();  

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
    if (loadingReport || !normalizedReport) {
      return <div>Loading your report…</div>;
    }

    return (
  <div className="report-container">
    <h1>
      You scored {normalizedReport.correct} out of {normalizedReport.total}
    </h1>

    <div className="report-grid">

      {/* =============================
          OVERALL ACCURACY
      ============================= */}
      <div className="card">
        <h3>Accuracy</h3>
        <div
          className="accuracy-circle"
          style={{ "--p": normalizedReport.accuracy }}
        >
          <span>{normalizedReport.accuracy}%</span>
        </div>
      </div>

      {/* =============================
          TOPIC BREAKDOWN
      ============================= */}
      <div className="card">
        <h3>Topic Breakdown</h3>

        {normalizedReport.topics.map((t) => (
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

      {/* =============================
          IMPROVEMENT AREAS (NEW)
      ============================= */}
      <div className="card">
        <h3>Improvement Areas</h3>
        <p className="section-note">
          Topics are ranked from weakest to strongest based on performance.
        </p>

        {normalizedReport.improvement_order.map((topic, idx) => {
          const t = normalizedReport.topics.find(
            (x) => x.topic === topic
          );

          if (!t) return null;

          return (
            <div key={topic} className="improve-row">
              <strong>
                {idx + 1}. {prettyTopic(topic)}
              </strong>

              <div className="bar">
                <div
                  className="fill red"
                  style={{ width: `${t.accuracy}%` }}
                />
              </div>

              <small>
                Accuracy: {t.accuracy}% · Attempted: {t.attempted}/{t.total}
              </small>

              {t.total < 3 && (
                <div className="low-data-warning">
                  Limited data available for this topic
                </div>
              )}
            </div>
          );
        })}
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

  const options = currentQuestion.answer_options || {};
  const hasOptions = Object.keys(options).length > 0;

  const rm = currentQuestion.section_ref?.reading_material || {};

  

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
        {Object.entries(groupedQuestions).map(([sectionId, data]) => (
          <div key={sectionId} className="topic-group">
            <div className="topic-title">
              {prettyTopic(data.topic)}
            </div>
        
            <div className="topic-circles">
              {data.indexes.map((i) => (
                <div
                  key={questions[i].question_id}
                  className={`index-circle
                    ${visited[i] ? "visited" : ""}
                    ${answers[questions[i].question_id] ? "answered" : ""}
                    ${i === index ? "active" : ""}
                  `}
                  onClick={() => goTo(i)}
                >
                  {i + 1}
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
              {!hasOptions && (
                <div className="no-options-warning">
                  ⚠️ No answer options available for this question
                </div>
              )}
            
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
