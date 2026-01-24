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
    
      const [attemptId, setAttemptId] = useState(null);
    
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
            score: report.overall.score,
            result: report.overall.result,   // ✅ PASS / FAIL
            has_sufficient_data: report.has_sufficient_data,
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
      console.log("🧠 STATE UPDATED", {
        exam,
        questionsCount: questions.length
      });
    }, [exam, questions]);
      useEffect(() => {
      if (!studentId) return;
    
      const loadExam = async () => {
        // 1️⃣ Start / resume attempt
        const res = await fetch(
          `${BACKEND_URL}/api/exams/start-reading`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_id: studentId })
          }
        );
    
        const meta = await res.json();
        console.log("🧪 START-READING META:", meta);
    
        if (meta.completed === true) {
          setFinished(true);
          onExamFinish?.();
          return;
        }
    
        setAttemptId(meta.attempt_id);
        setTimeLeft(meta.remaining_time);
    
        // 2️⃣ Fetch exam content (NEW)
        const examRes = await fetch(
          `${BACKEND_URL}/api/exams/reading-content/${meta.exam_id}`
        );
    
        const examData = await examRes.json();
        console.log("🚨 FULL examData OBJECT:", JSON.stringify(examData, null, 2));

        console.log("📘 EXAM CONTENT (raw):", examData);
        console.log("📘 exam_json:", examData.exam_json);
        console.log("📘 exam_json.sections:", examData.exam_json?.sections);
        console.log("📘 sections length:", examData.exam_json?.sections?.length);
        console.log("📘 EXAM CONTENT:", examData);
    
        const sections = examData.exam_json?.sections || [];
        sections.forEach((section, i) => {
          console.log(`🧱 SECTION ${i} KEYS:`, Object.keys(section));
        });


console.log("🧩 FLATTEN: sections =", sections);

const flatQuestions = sections.flatMap((section, sIdx) => {
  const qs =
    section.questions ||
    section.items ||
    section.question_list ||
    [];

  return qs.map((q) => ({
    ...q,
    topic: section.topic,
    passage_style: section.passage_style || "informational",
    answer_options: q.answer_options || section.answer_options || {},
    section_ref: section
  }));
});

console.log("✅ FLATTENED QUESTIONS COUNT:", flatQuestions.length);

        setExam(examData.exam_json);
        setIndex(0); // ✅ REQUIRED
        setQuestions(flatQuestions);
        setTimeout(() => {
  console.log("🧠 STATE AFTER SET", {
    exam,
    questionsCount: questions.length
  });
}, 0);

    
        onExamStart?.();
      };
    
      loadExam();
    }, [studentId]);
    
      /* =============================
         TIMER
      ============================= */
      useEffect(() => {
      if (timeLeft === null) return;
    
      if (timeLeft <= 0 && !finished) {
        autoSubmit();
        return;
      }
    
      const t = setInterval(() => {
        setTimeLeft((v) => (v > 0 ? v - 1 : 0));
      }, 1000);
    
      return () => clearInterval(t);
    }, [timeLeft, finished]);
    
    
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
              session_id: attemptId,
              answers
            })
          }
        );
    
        if (!res.ok) {
          const errText = await res.text();
          console.error("❌ submit-reading failed:", errText);
          return;
        }
    
        const data = await res.json();
    
        // ✅ CHANGE 4B: hydrate report immediately
        setReport(data.report);
    
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
        <div
          className={`result-badge ${
            normalizedReport.result === "Pass" ? "pass" : "fail"
          }`}
        >
          {normalizedReport.result}
        </div>
    
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
        IMPROVEMENT AREAS
    ============================= */}
    {normalizedReport.has_sufficient_data && (
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
            </div>
          );
        })}
      </div>
    )}
    {/* =============================
        IMPROVEMENT AREAS (INSUFFICIENT DATA)
    ============================= */}
    {!normalizedReport.has_sufficient_data && (
      <div className="card">
        <h3>Improvement Areas</h3>
        <p className="section-note">
          Not enough data is available to identify improvement areas yet.
        </p>
    
        <div className="low-data-warning">
          Try attempting more questions to get a detailed topic-wise analysis.
        </div>
      </div>
    )}
    
    
    
        </div>
      </div>
    );
    }
    
    
      /* =============================
         SAFE GUARD
      ============================= */
      const currentQuestion = questions[index];
      if (!exam || !currentQuestion) {
          console.log("⛔ RENDER BLOCKED", {
            exam,
            currentQuestion,
            questionsCount: questions.length,
            index
          });
          return <div>Loading Exam…</div>;
        }

    
      const options = currentQuestion.answer_options || {};
      const hasOptions = Object.keys(options).length > 0;
    
      const rm = currentQuestion.section_ref?.reading_material ?? "";
      const passageStyle =
          currentQuestion.passage_style ||
          currentQuestion.section_ref?.passage_style ||
          "informational";
    
    
      
    
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
          <div className={`passage-pane ${passageStyle}`}>
    
            {/* LITERARY PASSAGE */}
            {passageStyle === "literary" && (
              <pre className="literary-passage">
                {typeof rm === "string" ? rm : ""}
              </pre>
            )}
    
    
            {/* NON-LITERARY PASSAGE */}
            {passageStyle !== "literary" && (
              <>
                {rm.title && <h3>{rm.title}</h3>}
    
                {rm.extracts && (
                  <div className="extracts">
                    {Object.entries(rm.extracts).map(([key, text]) => (
                      <div key={key} className="extract">
                        <strong>{key}.</strong> {text}
                      </div>
                    ))}
                  </div>
                )}
    
                {rm.content && (
                  <p className="reading-content">{rm.content}</p>
                )}
    
                {rm.paragraphs &&
                  Object.entries(rm.paragraphs).map(([num, text]) => (
                    <p key={num} className="reading-paragraph">
                      <strong>{num}.</strong> {text}
                    </p>
                  ))}
              </>
            )}
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
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    autoSubmit();
                  }}
                >
                  Finish
                </button>
    
    
              )}
            </div>
          </div>
        </div>
      </div>
    );
    
    }
