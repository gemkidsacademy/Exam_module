import React, { useState, useEffect } from "react";
import "./QuizSetup.css";

export default function QuizSetup_naplan_language_conventions() {
  const [availableTopics, setAvailableTopics] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [questionBank, setQuestionBank] = useState([]);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [qbLoading, setQbLoading] = useState(false);

  /* ============================
     NAPLAN Rules
  ============================ */
  const getAllowedRange = (year) => {
    if (year === "3") return { min: 35, max: 40 };
    if (year === "5") return { min: 40, max: 45 };
    return null;
  };

  const [quiz, setQuiz] = useState({
    className: "naplan",
    subject: "language_conventions",
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
     Input Handlers
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
     Topic Handlers
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
      return prev;
    }

    setTotalQuestions(globalTotal);
    return { ...prev, topics };
  });
};


  /* ============================
     Fetch Available Topics
  ============================ */
  useEffect(() => {
    if (!quiz.year || !quiz.difficulty) {
      setAvailableTopics([]);
      return;
    }

    const fetchTopics = async () => {
      try {
        const params = new URLSearchParams({
          subject: "language_conventions",
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
  }, [quiz.year, quiz.difficulty]);

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
        `https://web-production-481a5.up.railway.app/api/admin/question-bank/naplan?subject=language_conventions&year=${quiz.year}`
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

  /* ============================
     Create Exam
  ============================ */
  const handleGenerateExam = async () => {
    if (!isTotalValid) {
      alert("Total questions do not meet NAPLAN requirements.");
      return;
    }

    if (!quiz.topics.length) {
      alert("Please generate and select topics first.");
      return;
    }

    const payload = {
      class_name: "naplan",
      subject: "Language Conventions",
      year: Number(quiz.year),
      difficulty: quiz.difficulty,
      num_topics: quiz.topics.length,
      topics: quiz.topics.map((t) => ({
        name: t.name,
        ai: t.ai,
        db: t.db,
        total: t.total,
      })),

      total_questions: totalQuestions,
      };
    console.log("📤 LANGUAGE CONVENTIONS PAYLOAD:", payload);

    try {
      const res = await fetch(
        "https://web-production-481a5.up.railway.app/api/quizzes-naplan-language-conventions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to create exam");

      await res.json();
      alert("NAPLAN Language Conventions exam created successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to create exam.");
    }
  };

  /* ============================
     Render
  ============================ */
  return (
    <div className="quiz-setup-container">
      <h2>NAPLAN – LANGUAGE CONVENTIONS</h2>

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

      <h3>Total Questions: {totalQuestions}</h3>

      <button onClick={handleViewQuestionBank}>View Question Bank</button>
      <button
        onClick={handleGenerateExam}
        disabled={!isTotalValid}
      >
        Create Exam
      </button>

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
