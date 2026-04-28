import React, { useState, useEffect } from "react";
import "./QuizSetup.css";

//const BACKEND_URL = "http://127.0.0.1:8000";
const BACKEND_URL = "https://web-production-481a5.up.railway.app";

export default function QuizSetup_ThinkingSkills_Simple() {
  const [availableTopics, setAvailableTopics] = useState([]);
  const [questionBank, setQuestionBank] = useState([]);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [qbLoading, setQbLoading] = useState(false);

  const [totalQuestions, setTotalQuestions] = useState(0);

  const [quiz, setQuiz] = useState({
    className: "selective",
    subject: "thinking_skills",
    classYear: "",
    difficulty: "",
    numTopics: 1,
    topics: [],
  });

  /* ============================
     HELPERS
  ============================ */
  const handleHomeworkSubmit_TS = async () => {
  if (!validateQuiz_TS()) return;

  const payload = {
    class_name: quiz.className,
    subject: quiz.subject,
    class_year: helperNormalizeClassYear_TS(quiz.classYear),
    difficulty: quiz.difficulty,
    num_topics: quiz.topics.length,
    topics: quiz.topics.map((t) => ({
      name: t.name.trim(),
      ai: Number(t.ai),
      db: Number(t.db),
      total: Number(t.total),
    })),
  };

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/quizzes-homework`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error(err);
      throw new Error("Failed to create homework");
    }

    alert("Thinking Skills homework created successfully!");
  } catch (error) {
    console.error(error);
    alert("Error creating homework.");
  }
};
  const helperGetUsedTopicNames_TS = (currentIndex) => {
    return quiz.topics
      .map((t, i) => (i !== currentIndex ? t.name : null))
      .filter(Boolean);
  };
  const handleDeleteAllQuestions_TS = async () => {
  const confirmed = window.confirm(
    "Are you sure you want to delete ALL Thinking Skills questions? This cannot be undone."
  );

  if (!confirmed) return;

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/admin/delete-previous-questions-TS`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to delete questions");
    }

    const data = await res.json();
    alert(data.message || "All questions deleted successfully.");
  } catch (error) {
    console.error(error);
    alert("Error deleting questions.");
  }
};

  const helperNormalizeClassYear_TS = (value) => {
    if (typeof value === "string") {
      const match = value.match(/\d+/);
      return match ? Number(match[0]) : null;
    }
    return value;
  };

  /* ============================
     HANDLERS
  ============================ */

  const handleInputChange_TS = (e) => {
    const { name, value } = e.target;
    setQuiz((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateTopics_TS = () => {
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

  const handleTopicChange_TS = (index, field, value) => {
    setQuiz((prev) => {
      const topics = [...prev.topics];
      const numValue = Number(value) || 0;

      topics[index][field] = numValue;

      const total =
        Number(topics[index].ai || 0) +
        Number(topics[index].db || 0);

      topics[index].total = total;

      const globalTotal = topics.reduce(
        (sum, t) => sum + (Number(t.total) || 0),
        0
      );

      setTotalQuestions(globalTotal);

      return { ...prev, topics };
    });
  };

  const handleTopicNameChange_TS = (index, value) => {
    setQuiz((prev) => {
      const topics = [...prev.topics];
      topics[index].name = value;
      return { ...prev, topics };
    });
  };

  /* ============================
     FETCH TOPICS
  ============================ */

  useEffect(() => {
    const fetchTopics_TS = async () => {
      try {
        const classYearValue = helperNormalizeClassYear_TS(
          quiz.classYear
        );

        if (
          !quiz.className ||
          !quiz.subject ||
          !quiz.difficulty ||
          !classYearValue
        ) {
          setAvailableTopics([]);
          return;
        }

        const params = new URLSearchParams({
          class_name: quiz.className,
          subject: quiz.subject,
          class_year: String(classYearValue),
          difficulty: quiz.difficulty,
        });

        const res = await fetch(
          `${BACKEND_URL}/api/topics?${params.toString()}`
        );

        if (!res.ok) {
          throw new Error("Failed to load topics");
        }

        const data = await res.json();
        setAvailableTopics(data);
      } catch (err) {
        console.error("Failed to fetch topics", err);
        setAvailableTopics([]);
      }
    };

    fetchTopics_TS();
  }, [quiz.className, quiz.subject, quiz.classYear, quiz.difficulty]);

  /* ============================
     QUESTION BANK
  ============================ */

  const handleViewQuestionBank_TS = async () => {
    try {
      setQbLoading(true);

      const classYearValue = helperNormalizeClassYear_TS(
        quiz.classYear
      );

      if (!quiz.className || !classYearValue) {
        alert("Please select class and class year.");
        return;
      }

      const params = new URLSearchParams({
        class_name: quiz.className,
        class_year: String(classYearValue),
      });

      const res = await fetch(
        `${BACKEND_URL}/api/admin/question-bank-thinking-skills?${params.toString()}`
      );

      if (!res.ok) throw new Error("Failed to load question bank");

      const data = await res.json();
      console.log("QUESTION BANK RESPONSE:", data);
      setQuestionBank(data);
      setShowQuestionBank(true);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch question bank data.");
    } finally {
      setQbLoading(false);
    }
  };

  /* ============================
     VALIDATION
  ============================ */

  const validateQuiz_TS = () => {
    if (!quiz.classYear || !quiz.difficulty) {
      alert("Please select class year and difficulty.");
      return false;
    }

    if (quiz.topics.length === 0) {
      alert("Please generate topics.");
      return false;
    }

    if (totalQuestions !== 40) {
      alert("Total questions must be 40.");
      return false;
    }

    return true;
  };

  /* ============================
     SUBMIT
  ============================ */

  const handleSubmit_TS = async (e) => {
    e.preventDefault();

    if (!validateQuiz_TS()) return;

    const payload = {
      class_name: quiz.className,
      subject: quiz.subject,
      class_year: helperNormalizeClassYear_TS(quiz.classYear),
      difficulty: quiz.difficulty,
      num_topics: quiz.topics.length,
      topics: quiz.topics.map((t) => ({
        name: t.name.trim(),
        ai: Number(t.ai),
        db: Number(t.db),
        total: Number(t.total),
      })),
    };

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/quizzes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error(err);
        throw new Error("Failed to create exam");
      }

      alert("Thinking Skills exam created successfully!");
    } catch (err) {
      console.error(err);
      alert("Error creating exam.");
    }
  };

  /* ============================
     RENDER
  ============================ */

  return (
    <div className="quiz-setup-container">
      <form onSubmit={handleSubmit_TS}>

        <h2>Thinking Skills Exam Setup</h2>

        <label>Class:</label>
        <input type="text" value="Selective" disabled />

        <label>Subject:</label>
        <input type="text" value="Thinking Skills" disabled />

        <label>Class Year:</label>
        <select
          name="classYear"
          value={quiz.classYear}
          onChange={handleInputChange_TS}
          required
        >
          <option value="">Select Year</option>
          <option value="Year 4">Year 4</option>
          <option value="Year 5">Year 5</option>
          <option value="Year 6">Year 6</option>
        </select>

        <label>Difficulty:</label>
        <select
          name="difficulty"
          value={quiz.difficulty}
          onChange={handleInputChange_TS}
          required
        >
          <option value="">Select Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <label>Number of Topics:</label>
        <input
          type="number"
          name="numTopics"
          min="1"
          value={quiz.numTopics}
          onChange={handleInputChange_TS}
        />

        <button type="button" onClick={handleGenerateTopics_TS}>
          Generate Topics
        </button>

        <button type="button" onClick={handleViewQuestionBank_TS}>
          View Question Bank
        </button>
        <button
          type="button"
          onClick={handleDeleteAllQuestions_TS}
          style={{ backgroundColor: "#dc3545", color: "white" }}
        >
          Delete All Questions
        </button>

        {showQuestionBank && (
          <div className="question-bank">
            <h3>Question Bank</h3>

            {qbLoading ? (
              <p>Loading...</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Difficulty</th>
                    <th>Topic</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {questionBank.map((row, idx) => (
                    <tr key={idx}>
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

        <div className="topics-container">
          {quiz.topics.map((topic, index) => (
            <div key={index} className="topic">

              <h4>Topic {index + 1}</h4>

              <select
                value={topic.name}
                onChange={(e) =>
                  handleTopicNameChange_TS(index, e.target.value)
                }
                required
              >
                <option value="">Select topic</option>

                {availableTopics
                  .filter(
                    (t) =>
                      !helperGetUsedTopicNames_TS(index).includes(t.name)
                  )
                  .map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
              </select>

              <input
                type="number"
                placeholder="AI Questions"
                value={topic.ai}
                onChange={(e) =>
                  handleTopicChange_TS(index, "ai", e.target.value)
                }
              />

              <input
                type="number"
                placeholder="DB Questions"
                value={topic.db}
                onChange={(e) =>
                  handleTopicChange_TS(index, "db", e.target.value)
                }
              />

              <div>Total: {topic.total}</div>
            </div>
          ))}
        </div>

        <h3>Total Questions: {totalQuestions} / 40</h3>

        <button type="submit" disabled={totalQuestions !== 40}>
          Create Thinking Skills Exam
        </button>
        <button
          type="button"
          onClick={handleHomeworkSubmit_TS}
          disabled={totalQuestions !== 40}
          style={{
            marginLeft: "10px",
            backgroundColor: "#28a745",
            color: "white",
          }}
        >
          Create Exam (Homework)
        </button>

      </form>
    </div>
  );
}