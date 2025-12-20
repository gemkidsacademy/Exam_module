import React, { useState } from "react";
import "./QuizSetup.css";

export default function QuizSetup_MathematicalReasoning() {
  const [quiz, setQuiz] = useState({
    className: "selective",
    subject: "mathematical_reasoning",
    difficulty: "",
    numTopics: 1,
    topics: [],
  });

  const [totalQuestions, setTotalQuestions] = useState(0);

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
      topics[index].warning = total > 35;

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
     SUBMIT
  ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!quiz.difficulty) {
      alert("Please select difficulty level.");
      return;
    }

    if (quiz.topics.length === 0) {
      alert("Please generate at least one topic.");
      return;
    }

    if (totalQuestions > 40) {
      alert("Total questions cannot exceed 40.");
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
        "https://web-production-481a5.up.railway.app/api/quizzes/mathematical-reasoning",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error("Backend returned:", err);
        throw new Error("Failed to save Mathematical Reasoning quiz");
      }

      await res.json();
      alert("Mathematical Reasoning exam created successfully!");
    } catch (error) {
      console.error(error);
      alert("Error saving exam. Please try again.");
    }
  };

  /* ============================
     RENDER
  ============================ */
  return (
    <div className="quiz-setup-container">
      <form onSubmit={handleSubmit}>

        {/* FIXED FIELDS */}
        <label>Class:</label>
        <input type="text" value="Selective" disabled />

        <label>Subject:</label>
        <input type="text" value="Mathematical Reasoning" disabled />

        {/* CONFIGURABLE */}
        <label>Difficulty Level:</label>
        <select
          name="difficulty"
          value={quiz.difficulty}
          onChange={handleInputChange}
          required
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

        <button type="button" onClick={generateTopics}>
          Generate Topics
        </button>

        {/* TOPICS */}
        <div className="topics-container">
          {quiz.topics.map((topic, index) => (
            <div className="topic" key={index}>
              <h4>Topic {index + 1}</h4>

              <label>Topic Name:</label>
              <input
                type="text"
                value={topic.name}
                onChange={(e) =>
                  handleTopicNameChange(index, e.target.value)
                }
                required
              />

              <label>AI Questions:</label>
              <input
                type="number"
                min="0"
                value={topic.ai}
                onChange={(e) =>
                  handleTopicChange(index, "ai", e.target.value)
                }
                required
              />

              <label>DB Questions:</label>
              <input
                type="number"
                min="0"
                value={topic.db}
                onChange={(e) =>
                  handleTopicChange(index, "db", e.target.value)
                }
                required
              />
            </div>
          ))}
        </div>

        {/* TOTAL */}
        <div className="total-section">
          <h3>Total Questions: {totalQuestions}</h3>
          {totalQuestions > 40 && (
            <div className="warning">Total cannot exceed 40!</div>
          )}
        </div>

        <button type="submit" disabled={totalQuestions > 40}>
          Create Mathematical Reasoning Exam
        </button>
      </form>
    </div>
  );
}
