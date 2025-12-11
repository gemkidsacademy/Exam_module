import React, { useState } from "react";
import "./QuizSetup.css";

export default function QuizSetup_reading() {
  const [quiz, setQuiz] = useState({
    className: "",
    subject: "Reading Comprehension",  // MUST MATCH DATABASE EXACTLY
    difficulty: "",
    numTopics: 1,
    topics: [],
  });

  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(false);

  // ---------------------------------------
  // HANDLE FORM INPUTS
  // ---------------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuiz((prev) => ({ ...prev, [name]: value }));
  };

  const generateTopics = () => {
    const num = parseInt(quiz.numTopics) || 1;

    const topicsArray = Array.from({ length: num }, () => ({
      topic_id: "",     // Admin will select from dropdown later
      name: "",
      num_questions: 0,
    }));

    setQuiz((prev) => ({ ...prev, topics: topicsArray }));
    setTotalQuestions(0);
  };

  const handleTopicNameChange = (index, value) => {
    setQuiz((prev) => {
      const topics = [...prev.topics];
      topics[index].name = value;
      return { ...prev, topics };
    });
  };

  const handleTopicTotalChange = (index, value) => {
    const numValue = Number(value) || 0;

    setQuiz((prev) => {
      const topics = [...prev.topics];
      topics[index].num_questions = numValue;

      const globalTotal = topics.reduce(
        (sum, t) => sum + (Number(t.num_questions) || 0),
        0
      );

      setTotalQuestions(globalTotal);

      return { ...prev, topics };
    });
  };

  // ---------------------------------------
  // SUBMIT TO BACKEND
  // ---------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!quiz.className || !quiz.subject || !quiz.difficulty) {
      alert("Please select class, subject, and difficulty.");
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
      class_name: quiz.className.trim(),
      subject: quiz.subject,
      difficulty: quiz.difficulty,
      topics: quiz.topics.map((t) => ({
        name: t.name.trim(),
        num_questions: Number(t.num_questions),
      })),
    };

    try {
      setLoading(true);

      const response = await fetch("https://web-production-481a5.up.railway.app/api/admin/create-reading-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        alert("Error: " + data.detail);
        return;
      }

      alert(
        `Reading Exam Created!\nConfig ID: ${data.config_id}\nCreated At: ${data.created_at}`
      );

    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Failed to create exam. Check console for details.");
    }
  };

  // ---------------------------------------
  // RENDER
  // ---------------------------------------
  return (
    <div className="quiz-setup-container">
      <form onSubmit={handleSubmit}>
        
        {/* CLASS */}
        <label>Class:</label>
        <select
          name="className"
          value={quiz.className}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Class</option>
          <option value="selective">Selective</option>
          <option value="year3">Year 3</option>
          <option value="year4">Year 4</option>
          <option value="year5">Year 5</option>
          <option value="year6">Year 6</option>
        </select>

        {/* SUBJECT */}
        <label>Subject:</label>
        <input
          type="text"
          value="Reading Comprehension"
          readOnly
          style={{ backgroundColor: "#f3f3f3", cursor: "not-allowed" }}
        />

        {/* DIFFICULTY */}
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

        {/* NUMBER OF TOPICS */}
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

        {/* TOPIC CARDS */}
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

              <label>Total Questions for this Topic:</label>
              <input
                type="number"
                min="0"
                value={topic.num_questions}
                onChange={(e) =>
                  handleTopicTotalChange(index, e.target.value)
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

        <button type="submit" disabled={loading || totalQuestions > 40}>
          {loading ? "Saving..." : "Create Reading Exam"}
        </button>
      </form>
    </div>
  );
}
