import React, { useEffect, useMemo, useState } from "react";
import "./ExamPage_reading.css";
import ReadingReview from "./ReadingReview";



export default function ReadingComponent({
    studentId,
    onExamStart,
    onExamFinish
  }) {
  const API_BASE = process.env.REACT_APP_API_URL;
  console.log("🔗 API_BASE:", API_BASE);
  if (!API_BASE) {
   console.error("❌ REACT_APP_API_URL is not defined");
  }

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
  const [mode, setMode] = useState("exam");
  const [reviewQuestions, setReviewQuestions] = useState([]);
    
  const handleReviewExam = async () => {
  if (!attemptId) {
    console.error("❌ No session_id available for review");
    alert("Exam session not found.");
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/api/exams/review-reading?session_id=${attemptId}`
    );

    if (!res.ok) {
      throw new Error("Failed to load review");
    }

    const data = await res.json();

    console.log("🧪 REVIEW PAYLOAD:", data);

    setReviewQuestions(
      (data.questions || []).map((q) => ({
        ...q,
        answer_options:
          (q.answer_options && Object.keys(q.answer_options).length > 0)
            ? q.answer_options
            : q.section_ref?.answer_options ||
              q.section?.answer_options ||
              {}
      }))
    );

    setMode("review");

  } catch (err) {
    console.error("❌ Review exam error:", err);
    alert("Unable to load exam review.");
  }
};

  const loadReportBySession = async (sessionId) => {
  try {
    setLoadingReport(true);

    const res = await fetch(
      `${API_BASE}/api/exams/reading-report?session_id=${sessionId}`
    );

    if (!res.ok) {
      throw new Error("Failed to load report");
    }

    const data = await res.json();
    setReport(data);

  } catch (err) {
    console.error("❌ loadReportBySession error:", err);
  } finally {
    setLoadingReport(false);
  }
};

  

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
  const normalizeMainIdeaReadingMaterial = (rm) => {
  if (typeof rm !== "string") return rm;

  // Split instructions from paragraph body
  const splitIndex = rm.indexOf("paragraphs:");
  if (splitIndex === -1) return rm;

  const instructions = rm.slice(0, splitIndex).trim();
  const body = rm.slice(splitIndex + "paragraphs:".length);

  // Split on " 1: ", " 2: ", etc.
  const parts = body.split(/\s+(?=\d+:)/);

  const paragraphs = {};
  parts.forEach((p, idx) => {
    const match = p.match(/^(\d+):\s*(.*)$/s);
    if (match) {
      paragraphs[15 + idx] = match[2].trim();
    }
  });

  if (Object.keys(paragraphs).length === 0) {
    console.warn("⚠️ Main Idea normalization failed — no paragraphs detected");
    return rm;
  }

  return {
    instructions,
    title: "The Age of Transparency",
    paragraphs
  };
};


  const TOPIC_LABELS = {
      main_idea: "Main Idea and Summary",
      main_idea_and_summary: "Main Idea and Summary",
      comparative_analysis: "Comparative Analysis",
      gapped_text: "Gapped Text",
    };

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
      `${API_BASE}/api/exams/start-reading`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId })
      }
    );

    const meta = await res.json();
    console.log("🧪 START-READING META:", meta);

    if (meta.completed === true) {
      setAttemptId(meta.attempt_id);
      setFinished(true);
    
      if (meta.attempt_id) {
        await loadReportBySession(meta.attempt_id);
      }
    
      onExamFinish?.();
      return;
    }


    setAttemptId(meta.attempt_id);
    setTimeLeft(meta.remaining_time);

    // 2️⃣ Fetch exam content (NEW)
    const examRes = await fetch(
      `${API_BASE}/api/exams/reading-content/${meta.exam_id}`
    );

    const examData = await examRes.json();
    

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

const flatQuestions = sections.flatMap((section, idx) => {
   console.log("🧪 SECTION", idx, {
    question_type: section.question_type,
    topic: section.topic,
    keys: Object.keys(section),
  });  
  const qs =
    section.questions ||
    section.items ||
    section.question_list ||
    [];

  return qs.map((q) => ({
    ...q,
    topic: TOPIC_LABELS[section.question_type] || "Other",
    passage_style: section.passage_style || "informational",
    answer_options: q.answer_options || section.answer_options || {},
    section_ref: section
  }));
});

console.log("✅ FLATTENED QUESTIONS COUNT:", flatQuestions.length);

    setExam(examData.exam_json);
    setIndex(0); // ✅ REQUIRED
    setQuestions(flatQuestions);
    


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
        console.log("🧩 GROUP KEY CHECK", {
          section_id: q.section_ref.section_id,
          topic: q.topic
        });
  
    
        if (!g[key]) {
          g[key] = {
            topic: q.topic,
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
      `${API_BASE}/api/exams/submit-reading`,
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
  // 🔴 1. REVIEW MODE — HIGHEST PRIORITY
    if (mode === "review") {
      return (
        <ReadingReview
          questions={reviewQuestions}
          onExit={() => {
              setReviewQuestions([]);
              setMode("exam");
            }}

        />
      );
    }
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
    
    {/* ✅ NEW: Review Exam Button */}
    <button
      className="review-exam-btn"
      onClick={handleReviewExam}
    >
      Review Exam
    </button>
    <div className="report-grid">

      {/* =============================
          OVERALL ACCURACY
      ============================= */}
      <div className="card">
      <h3>Overall Accuracy</h3>
    
      <div
        className="accuracy-circle"
        style={{ "--p": normalizedReport.accuracy }}
      >
        <span>{normalizedReport.accuracy}%</span>
      </div>
    
      <div className="overall-stats">
        <div>Total Questions: {normalizedReport.total}</div>
        <div>Attempted: {normalizedReport.attempted}</div>
        <div>Correct: {normalizedReport.correct}</div>
        <div>Incorrect: {normalizedReport.incorrect}</div>
        <div>Not Attempted: {normalizedReport.not_attempted}</div>
        <div>Score: {normalizedReport.score}%</div>
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
  if (!exam || questions.length === 0) {
  return <div>Loading Exam…</div>;
}

const currentQuestion = questions[index];


  const options = currentQuestion.answer_options || {};
  const hasOptions = Object.keys(options).length > 0;

  /* const rm = currentQuestion.section_ref?.reading_material ?? "";*/
  const rawRm = currentQuestion.section_ref?.reading_material ?? "";
  const rm = normalizeMainIdeaReadingMaterial(rawRm);
  
  const passageStyle =
  ["main_idea", "main_idea_and_summary"].includes(
  currentQuestion.section_ref?.question_type
)

    ? "informational"
    : currentQuestion.passage_style ||
      currentQuestion.section_ref?.passage_style ||
      "informational";

    console.log("MAIN IDEA DEBUG", {
  question_type: currentQuestion.section_ref?.question_type,
  passageStyle,
  rmType: typeof rm,
  hasParagraphs: !!rm?.paragraphs,
  paragraphKeys: rm?.paragraphs && Object.keys(rm.paragraphs),
  rmPreview:
    typeof rm === "string"
      ? rm.slice(0, 120)
      : rm
});

  

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
        {passageStyle === "literary" && typeof rm === "string" && (
          <pre className="literary-passage">
            {rm}
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
