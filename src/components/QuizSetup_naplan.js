import React, { useState, useEffect } from "react";
import "./QuizSetup.css";

export default function QuizSetup_naplan({ examType }) {
  const [availableTopics, setAvailableTopics] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [questionBank, setQuestionBank] = useState([]);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [qbLoading, setQbLoading] = useState(false);
  const getAllowedRange = (year) => {
    if (year === "3") {
      return { min: 35, max: 40 };
    }
  
    if (year === "5") {
      return { min: 40, max: 45 };
    }
  
    return null;
  };
  

  

  const [quiz, setQuiz] = useState({
    className: "naplan",
    subject: examType.replace("naplan_", ""),
    year: "",
    difficulty: "",
    numTopics: 1,
    topics: [],
  });
  const allowedRange = getAllowedRange(quiz.year);
  const isTotalValid =
    allowedRange &&
    totalQuestions >= allowedRange.min &&
    totalQuestions <= allowedRange.max;

  
  /* ============================
     Sync subject with examType
  ============================ */
  useEffect(() => {
    setQuiz((prev) => ({
      ...prev,
      subject: examType.replace("naplan_", ""),
      topics: [],
    }));
    setAvailableTopics([]);
    setTotalQuestions(0);
    setShowQuestionBank(false);
  }, [examType]);

  /* ============================
     Input handlers
  ============================ */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuiz((prev) => ({ ...prev, [name]: value }));
  };

  /* ============================
     Generate Topics
  ============================ */
  const generateTopics = () => {
    const num = parseInt(quiz.numTopics) || 1;

    const topicsArray = Array.from({ length: num }, () => ({
      name: "",
      ai: 0,
      db: 0,
      total: 0,
    }));

    setQuiz((prev) => ({ ...prev, topics: topicsArray }));
    setTotalQuestions(0);
  };

  /* ============================
     Topic handlers
  ============================ */
  const handleTopicNameChange = (index, value) => {
    setQuiz((prev) => {
      const topics = [...prev.topics];
      topics[index].name = value;
      return { ...prev, topics };
    });
  };

  const handleTopicChange = (index, field, value) => {
  setQuiz((prev) => {
    const topics = [...prev.topics];
    const num = Number(value) || 0;

    topics[index][field] = num;
    topics[index].total =
      Number(topics[index].ai || 0) +
      Number(topics[index].db || 0);

    const globalTotal = topics.reduce(
      (sum, t) => sum + (t.total || 0),
      0
    );

    const range = getAllowedRange(prev.year);

    if (range && globalTotal > range.max) {
      alert(
        `Total questions cannot exceed ${range.max} for Year ${prev.year}`
      );
      return prev; // block the update
    }

    setTotalQuestions(globalTotal);

    return { ...prev, topics };
  });
};


  /* ============================
     View Question Bank
  ============================ */
  const handleViewQuestionBank = async () => {
    if (!quiz.year) {
      alert("Please select year first.");
      return;
    }

    try {
      setQbLoading(true);
      setShowQuestionBank(false);

      const res = await fetch(
        `https://web-production-481a5.up.railway.app/api/admin/question-bank/naplan?subject=${quiz.subject}&year=${quiz.year}`
      );

      if (!res.ok) throw new Error("Failed to load question bank");

      const data = await res.json();
      setQuestionBank(data);
      setShowQuestionBank(true);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch question bank.");
    } finally {
      setQbLoading(false);
    }
  };
  const handleGenerateExam = async () => {
  if (!isTotalValid) {
    alert("Total questions do not meet NAPLAN requirements.");
    return;
  }

  if (!quiz.topics.length) {
    alert("Please generate and select topics first.");
    return;
  }

  // Build payload exactly as backend expects
  const payload = {
    class_name: quiz.className,            // "naplan"
    subject: quiz.subject,                 // "numeracy"
    year: Number(quiz.year),               // 3 or 5
    difficulty: quiz.difficulty,           // "easy" | "medium" | "hard"
    num_topics: quiz.topics.length,
    topics: quiz.topics.map((t) => ({
      name: t.name,
      ai: t.ai,
      db: t.db,
      total: t.total,
    })),
    total_questions: totalQuestions,
  };

  console.log("📤 NAPLAN QUIZ PAYLOAD:", payload);

  try {
    const res = await fetch(
      "https://web-production-481a5.up.railway.app/api/quizzes-naplan-numeracy",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Failed to create quiz");
    }

    const data = await res.json();
    console.log("✅ QUIZ CREATED:", data);

    alert("NAPLAN exam created successfully!");
  } catch (err) {
    console.error("❌ ERROR CREATING QUIZ:", err);
    alert("Failed to create exam. Check console for details.");
  }
};


  /* ============================
     Fetch available topics
  ============================ */
  useEffect(() => {
    if (!quiz.subject || !quiz.year || !quiz.difficulty) {
      setAvailableTopics([]);
      return;
    }

    const fetchTopics = async () => {
      try {
        const params = new URLSearchParams({
          subject: quiz.subject,
          year: quiz.year,
          difficulty: quiz.difficulty,
        });
        
        const res = await fetch(
          `https://web-production-481a5.up.railway.app/api/topics-naplan?${params.toString()}`
        );

        if (!res.ok) throw new Error("Failed to fetch topics");

        const data = await res.json();
        setAvailableTopics(data);
      } catch (err) {
        console.error(err);
        setAvailableTopics([]);
      }
    };

    fetchTopics();
  }, [quiz.subject, quiz.year, quiz.difficulty]);

  /* ============================
     Render
  ============================ */
  return (
    <div className="quiz-setup-container">
      <h2 style={{ marginBottom: "20px" }}>
        NAPLAN – {quiz.subject.replace("_", " ").toUpperCase()}
      </h2>

      <label>Class:</label>
      <input value="NAPLAN" readOnly />

      <label>Subject:</label>
      <input
        value={quiz.subject.replace("_", " ").toUpperCase()}
        readOnly
      />

      <label>Year:</label>
      <select name="year" value={quiz.year} onChange={handleInputChange}>
        <option value="">Select Year</option>
        <option value="3">Year 3</option>
        <option value="5">Year 5</option>
      </select>

      <label>Difficulty:</label>
      <select
        name="difficulty"
        value={quiz.difficulty}
        onChange={handleInputChange}
      >
        <option value="">Select Difficulty</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <label>Number of Topics:</label>
      <input
        type="number"
        name="numTopics"
        min="1"
        value={quiz.numTopics}
        onChange={handleInputChange}
      />

      <button
        type="button"
        onClick={generateTopics}
        disabled={!quiz.year || !quiz.difficulty}
      >
        Generate Topics
      </button>

      {/* ============================
         Topics
      ============================ */}
      <div className="topics-container">
        {quiz.topics.map((topic, index) => (
          <div className="topic" key={index}>
            <h4>Topic {index + 1}</h4>

            <label>Topic Name:</label>
            <select
              value={topic.name}
              onChange={(e) =>
                handleTopicNameChange(index, e.target.value)
              }
            >
              <option value="">Select topic</option>
              {availableTopics.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>

            <label>AI Questions:</label>
            <input
              type="number"
              min="0"
              value={topic.ai}
              onChange={(e) =>
                handleTopicChange(index, "ai", e.target.value)
              }
            />

            <label>DB Questions:</label>
            <input
              type="number"
              min="0"
              value={topic.db}
              onChange={(e) =>
                handleTopicChange(index, "db", e.target.value)
              }
            />
          </div>
        ))}
      </div>

     <div className="total-section">
      <h3>Total Questions: {totalQuestions}</h3>
    
      {allowedRange && (
        <p
          style={{
            color: isTotalValid ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          Allowed range for Year {quiz.year}:{" "}
          {allowedRange.min} to {allowedRange.max}
        </p>
      )}
    </div>


      {/* ============================
         Question Bank
      ============================ */}
      <div style={{ marginTop: "15px" }}>
        <button
          type="button"
          onClick={handleViewQuestionBank}
          disabled={!quiz.year}
        >
          View Question Bank
        </button>
        <button
          type="button"
          onClick={handleGenerateExam}
          disabled={
            !quiz.topics.length ||
            !isTotalValid
          }
          style={{
            backgroundColor: isTotalValid ? "#0d6efd" : "#ccc",
            cursor: isTotalValid ? "pointer" : "not-allowed",
          }}
        >
          Generate Exam
        </button>
      </div>
      

      {showQuestionBank && (
        <div className="question-bank" style={{ marginTop: "20px" }}>
          <h3>Question Bank Summary</h3>

          {qbLoading ? (
            <p>Loading...</p>
          ) : questionBank.length === 0 ? (
            <p>No questions found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Difficulty</th>
                  <th>Topic</th>
                  <th>Total Questions</th>
                </tr>
              </thead>
              <tbody>
                {questionBank.map((row, idx) => (
                  <tr key={`${row.difficulty}-${row.topic}-${idx}`}>
                    <td>{row.difficulty}</td>
                    <td>{row.topic}</td>
                    <td>{row.total_questions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
