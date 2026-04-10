import React, { useState, useEffect } from "react";
import "./QuizSetup.css";

/* ============================
   Setup OC Thinking Skills
============================ */

export default function QuizSetupOCThinkingSkills() {
  const [availableTopics, setAvailableTopics] = useState([]);
  const MAX_QUESTIONS = 30;
  const [questionBank, setQuestionBank] = useState([]);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [qbLoading, setQbLoading] = useState(false);

  const [totalQuestions, setTotalQuestions] = useState(0);

  const [quiz, setQuiz] = useState({
    className: "oc",
    classYear: "", // ✅ NEW
    subject: "thinking_skills",
    difficulty: "",
    numTopics: 1,
    topics: [],
  });

  /* ============================
     HELPERS
  ============================ */
  const handleCreateHomeworkExam = async () => {
    if (!quiz.classYear) {
      alert("Please select class year.");
      return;
    }

    if (!quiz.difficulty) {
      alert("Please select difficulty.");
      return;
    }

    if (quiz.topics.length === 0) {
      alert("Generate topics first.");
      return;
    }

    if (totalQuestions !== MAX_QUESTIONS) {
      alert(`Total must be exactly ${MAX_QUESTIONS}.`);
      return;
    }

    const payload = {
      class_name: quiz.className,
      class_year: quiz.classYear,
      subject: quiz.subject,
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
        "https://web-production-481a5.up.railway.app/api/quizzes/oc-thinking-skills-homework", // ✅ NEW ENDPOINT
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save homework exam");

      alert("Homework Exam created successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving homework exam.");
    }
  };

  const getUsedTopicNames = (currentIndex) => {
    return quiz.topics
      .map((t, i) => (i !== currentIndex ? t.name : null))
      .filter(Boolean);
  };

  /* ============================
     HANDLERS
  ============================ */

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuiz((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleTopicChange = (index, field, value) => {
    setQuiz((prev) => {
      const topics = [...prev.topics];

      const numValue = Number(value) || 0;
      topics[index][field] = numValue;

      const total =
        Number(topics[index].ai || 0) +
        Number(topics[index].db || 0);

      topics[index].total = total;
      topics[index].warning = total > MAX_QUESTIONS;

      const globalTotal = topics.reduce(
        (sum, t) => sum + (Number(t.total) || 0),
        0
      );

      setTotalQuestions(globalTotal);

      return { ...prev, topics };
    });
  };

  const handleTopicNameChange = (index, value) => {
    setQuiz((prev) => {
      const topics = [...prev.topics];
      topics[index].name = value;
      return { ...prev, topics };
    });
  };

  /* ============================
     QUESTION BANK
  ============================ */

  const handleViewQuestionBank = async () => {
    try {
      setQbLoading(true);

      const res = await fetch(
        "https://web-production-481a5.up.railway.app/api/admin/question-bank-oc-thinking-skills"
      );

      if (!res.ok) throw new Error("Failed to load question bank");

      const data = await res.json();
      setQuestionBank(data);
      setShowQuestionBank(true);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch question bank data.");
    } finally {
      setQbLoading(false);
    }
  };

  const handleDeletePreviousQuestions = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete all previous OC Thinking Skills questions?"
    );

    if (!confirmDelete) return;

    fetch(
      "https://web-production-481a5.up.railway.app/api/admin/delete-previous-questions-OC-TS",
      { method: "DELETE" }
    )
      .then((res) => res.json())
      .then(() => {
        alert("Previous questions deleted successfully.");
      })
      .catch((err) => {
        console.error(err);
        alert("Error deleting questions.");
      });
  };

  /* ============================
     FETCH TOPICS
  ============================ */

  useEffect(() => {
    if (!quiz.className || !quiz.subject || !quiz.difficulty) {
      setAvailableTopics([]);
      return;
    }

    const fetchTopics = async () => {
      try {
        const params = new URLSearchParams({
          class_name: quiz.className,
          subject: quiz.subject,
          difficulty: quiz.difficulty,
        });

        const res = await fetch(
          `https://web-production-481a5.up.railway.app/api/topics?${params.toString()}`
        );

        if (!res.ok) throw new Error("Failed to load topics");

        const data = await res.json();
        setAvailableTopics(data);
      } catch (err) {
        console.error(err);
        setAvailableTopics([]);
      }
    };

    fetchTopics();
  }, [quiz.className, quiz.subject, quiz.difficulty]);

  /* ============================
     SUBMIT
  ============================ */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!quiz.difficulty) {
      alert("Please select difficulty.");
      return;
    }

    if (quiz.topics.length === 0) {
      alert("Generate topics first.");
      return;
    }

    if (totalQuestions !== MAX_QUESTIONS) {
     alert(`Total must be exactly ${MAX_QUESTIONS}.`);
     return;
   }
    

    const payload = {
      class_name: quiz.className,
      subject: quiz.subject,
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
        "https://web-production-481a5.up.railway.app/api/quizzes/oc-thinking-skills",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save quiz");

      alert("OC Thinking Skills Quiz created!");
    } catch (err) {
      console.error(err);
      alert("Error saving quiz.");
    }
  };

  /* ============================
     UI
  ============================ */

  return (
    <div className="quiz-setup-container">
      <form onSubmit={handleSubmit}>
        <label>Class:</label>
        <input type="text" value="OC" readOnly />
        <label>Class Year:</label>
        <select
          name="classYear"
          value={quiz.classYear}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Year</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
          
        </select>

        <label>Subject:</label>
        <input type="text" value="Thinking Skills" readOnly />

        <label>Difficulty:</label>
        <select
          name="difficulty"
          value={quiz.difficulty}
          onChange={handleInputChange}
          required
        >
          <option value="">Select</option>
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

        <button type="button" onClick={generateTopics}>
          Generate Topics
        </button>

        <button type="button" onClick={handleViewQuestionBank}>
          View Question Bank
        </button>

        <button type="button" onClick={handleDeletePreviousQuestions}>
          Delete Previous
        </button>

        {/* Question Bank */}
        {showQuestionBank && (
          <div className="question-bank">
            <h3>OC Thinking Skills Question Bank</h3>

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

        {/* Topics */}
        <div className="topics-container">
          {quiz.topics.map((topic, index) => (
            <div key={index} className="topic">
              <h4>Topic {index + 1}</h4>

              <select
                value={topic.name}
                onChange={(e) =>
                  handleTopicNameChange(index, e.target.value)
                }
              >
                <option value="">Select topic</option>

                {availableTopics
                  .filter(
                    (t) =>
                      !getUsedTopicNames(index).includes(t.name)
                  )
                  .map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
              </select>

              <input
                type="number"
                placeholder="AI"
                value={topic.ai}
                onChange={(e) =>
                  handleTopicChange(index, "ai", e.target.value)
                }
              />

              <input
                type="number"
                placeholder="DB"
                value={topic.db}
                onChange={(e) =>
                  handleTopicChange(index, "db", e.target.value)
                }
              />
            </div>
          ))}
        </div>

        <h3>
           Total: {totalQuestions} / {MAX_QUESTIONS}
         </h3>

        <button type="submit" disabled={totalQuestions > MAX_QUESTIONS}>
          Create Exam
        </button>
        <button
          type="button"
          onClick={handleCreateHomeworkExam}
          disabled={totalQuestions > MAX_QUESTIONS}
        >
          Create Exam (Homework)
        </button>
      </form>
    </div>
  );
}
