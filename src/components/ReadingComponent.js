import React, { useState, useEffect, useMemo } from "react";
import "./ExamPage_reading.css";

export default function ReadingComponent({ studentId }) {
  const BACKEND_URL = "https://web-production-481a5.up.railway.app";

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };


  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [finished, setFinished] = useState(false);

  const [timeLeft, setTimeLeft] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const prettyTopic = (t) =>
    t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const buildLocalReport = () => {
  const total = questions.length;

  let correct = 0;
  let attempted = 0;

  const topicStats = {};

  questions.forEach((q, index) => {
    const topic = q.topic || "Unknown";

    if (!topicStats[topic]) {
      topicStats[topic] = {
        total: 0,
        attempted: 0,
        correct: 0
      };
    }

    topicStats[topic].total += 1;

    const selected = answers[index];
    if (selected != null) {
      attempted += 1;
      topicStats[topic].attempted += 1;

      if (selected === q.correct_answer) {
        correct += 1;
        topicStats[topic].correct += 1;
      }
    }
  });

  const wrong = attempted - correct;
  const accuracy = total
    ? Number(((correct / total) * 100).toFixed(1))
    : 0;

  const topics = Object.entries(topicStats).map(([topic, s]) => {
    const incorrect = s.attempted - s.correct;
    const not_attempted = s.total - s.attempted;

    return {
      topic,
      attempted: s.attempted,
      correct: s.correct,
      incorrect,
      not_attempted,
      accuracy: s.total
        ? Number(((s.correct / s.total) * 100).toFixed(1))
        : 0
    };
  });

  return {
    total,
    correct,
    wrong,
    accuracy,
    topics
  };
};

  
  


  /* -----------------------------
     LOAD EXAM
  ----------------------------- */
  useEffect(() => {
    if (!studentId) return;

    const loadExam = async () => {
      const res = await fetch(
        `${BACKEND_URL}/api/exams/start-reading?student_id=${studentId}`,
        { method: "POST" }
      );

      const data = await res.json();
      console.log("📦 START-READING RESPONSE (RAW):", data);
      console.log("📦 exam_json:", data.exam_json);
      console.log("📦 questions:", data.exam_json?.questions);
      console.log("📦 duration_minutes:", data.duration_minutes);
      console.log("📦 finished:", data.finished);
      if (data.finished === true) {
        setFinished(true);
        loadReport();
        return;
      }


      const flat = data.exam_json.questions || [];

      setQuestions(flat);


      setSessionId(data.session_id);
      setExam(data.exam_json);
      setQuestions(flat);

      const durationSeconds = (data.duration_minutes || 40) * 60;
      const start = new Date(data.start_time).getTime();
      const now = new Date(data.server_now).getTime();

      setTimeLeft(
        Math.max(durationSeconds - Math.floor((now - start) / 1000), 0)
      );
    };

    loadExam();
  }, [studentId]);

  /* -----------------------------
     TIMER
  ----------------------------- */
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) autoSubmit();

    const t = setInterval(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  /* -----------------------------
     GROUP QUESTIONS BY TOPIC
     (HOOK MUST BE ABOVE ANY RETURN)
  ----------------------------- */
  const groupedQuestions = useMemo(() => {
    const groups = {};
    questions.forEach((q, i) => {
      const key = q.topic || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push({ index: i });
    });
    return groups;
  }, [questions]);

  /* -----------------------------
     Front End Reporting
  ----------------------------- */
  const loadReport = async () => {
  setLoadingReport(true);

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/exams/reading-report?student_id=${studentId}`
    );

    if (!res.ok) {
      throw new Error("Failed to load report");
    }

    const data = await res.json();
    setReport(data);
  } catch (err) {
    console.error("❌ report load error:", err);
  } finally {
    setLoadingReport(false);
  }
};


  /* -----------------------------
     SUBMIT
  ----------------------------- */
  const autoSubmit = async () => {
  if (finished) return;

  // 1️⃣ Build report on frontend
  const report = buildLocalReport();

  try {
    // 2️⃣ Submit answers + report together
    await fetch(`${BACKEND_URL}/api/exams/submit-reading`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        answers,
        report   // 👈 this is the important addition
      }),
    });

    // 3️⃣ Switch to finished state
    setFinished(true);
    await loadReport();


  } catch (err) {
    console.error("❌ submit-reading error:", err);
  }
};

  
  
  const handleSelect = (choice) => {
    setAnswers((prev) => ({ ...prev, [index]: choice }));
  };

  const goTo = (i) => {
    setVisited((v) => ({ ...v, [i]: true }));
    setIndex(i);
  };

  /* -----------------------------
     FINISHED
  ----------------------------- */
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
        {/* LEFT: ACCURACY */}
        <div className="card">
          <h3>Accuracy</h3>

          <div
            className="accuracy-circle"
            style={{ "--p": report.accuracy }}
          >
            <span>{report.accuracy}%</span>
          </div>

          <div className="legend">
            <span className="correct-dot">
              Correct: {report.correct}
            </span>
            <span className="wrong-dot">
              Incorrect: {report.wrong}
            </span>
            <span className="not-attempted-dot">
              Not Attempted: {report.total - (report.correct + report.wrong)}
            </span>
          </div>


        </div>

        {/* RIGHT: TOPIC BREAKDOWN */}
        <div className="card">
          <h3>Topic Breakdown</h3>

          {report.topics.map((item) => (
            <div key={item.topic} className="improve-row">
              <label>{prettyTopic(item.topic)}</label>

              <div className="bar">
                <div
                  className="fill blue"
                  style={{ width: `${item.accuracy}%` }}
                />
              </div>

              <span>{item.accuracy}%</span>

              <div className="topic-meta">
                <small>
                  Attempted: {item.attempted} | 
                  Correct: {item.correct} | 
                  Incorrect: {item.incorrect} | 
                  Not Attempted: {item.not_attempted}
                </small>
              </div>
            </div>
          ))
          }

        </div>
      </div>
    </div>
  );
}


  /* -----------------------------
     SAFE EARLY RETURN (NO HOOKS BELOW)
  ----------------------------- */
  const currentQuestion = questions[index];
    if (!exam || !currentQuestion) return <div>Loading Exam…</div>;
  const topic = (currentQuestion.topic || "").toLowerCase();
  const rm = currentQuestion.reading_material || {};
  const optionsToRender = currentQuestion.answer_options || {};

  /* -----------------------------
     UI
  ----------------------------- */
  return (
    <div className="exam-container">
      <div className="exam-header">
        <div>Reading Comprehension Exam</div>
        <div className="timer-box">
          Time Left: {formatTime(timeLeft)}
        </div>

        <div className="counter">
          Question {index + 1} / {questions.length}
        </div>
      </div>

      {/* GROUPED QUESTION INDEX */}
      <div className="question-index-grouped">
        {Object.entries(groupedQuestions).map(([topicName, qs]) => (
          <div key={topicName} className="topic-group">
            <div className="topic-title">{topicName}</div>
            <div className="topic-circles">
              {qs.map(({ index: i }) => {
                let cls = "index-circle";
                if (answers[i]) cls += " answered";
                else if (visited[i]) cls += " visited";
                if (i === index) cls += " active";

                return (
                  <div key={i} className={cls} onClick={() => goTo(i)}>
                    {questions[i].question_number}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="exam-body">
        {/* LEFT PANE */}
        <div className="passage-pane">
          {topic.includes("gapped") && (
            <>
              <h3>{rm.title}</h3>
              <p className="reading-text">{rm.content}</p>
            </>
          )}

          {topic.includes("comparative") && (
            <>
              <h3>Extracts</h3>
              {Object.entries(rm.extracts || {}).map(([k, v]) => (
                <div key={k} className="extract-block">
                  <strong>Extract {k}</strong>
                  <p>{v}</p>
                </div>
              ))}
            </>
          )}

          {topic.includes("main idea") && (
            <>
              <h3>Paragraphs</h3>
              {Object.entries(rm.paragraphs || {}).map(([k, v]) => (
                <div key={k} className="paragraph-block">
                  <strong>Paragraph {k}</strong>
                  <p>{v}</p>
                </div>
              ))}
            </>
          )}
        </div>

        {/* RIGHT PANE */}
        <div className="question-pane">
          <div className="question-card">
            <p className="question-text">
              Q{currentQuestion.question_number}. {currentQuestion.question_text}
            </p>

            <div className="options">
              {Object.entries(optionsToRender).map(([letter, text]) => (
                <button
                  key={letter}
                  className={`option-btn ${
                    answers[index] === letter ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(letter)}
                >
                  <strong>{letter}.</strong> {text}
                </button>
              ))}
            </div>
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
