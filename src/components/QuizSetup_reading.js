import React, { useState } from "react";
import "./QuizSetup.css";

export default function QuizSetup_reading() {
  const [quiz, setQuiz] = useState({
    className: "",
    subject: "reading",
    difficulty: "",
    numTopics: 1,
    topics: [],
  });

  const [totalQuestions, setTotalQuestions] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuiz((prev) => ({ ...prev, [name]: value }));
  };

  const generateTopics = () => {
    const num = parseInt(quiz.numTopics) || 1;

    const topicsArray = Array.from({ length: num }, () => ({
      name: "",
      total: 0,
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
      topics[index].total = numValue;

      const globalTotal = topics.reduce(
        (sum, t) => sum + (Number(t.total) || 0),
        0
      );

      setTotalQuestions(globalTotal);

      return { ...prev, topics };
    });
  };

  const handleSubmit = (e) => {
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
      subject: "reading",
      difficulty: quiz.difficulty,
      num_topics: quiz.topics.length,
      topics: quiz.topics.map((t) => ({
        name: t.name.trim(),
        total: Number(t.total),
      })),
      total_questions: totalQuestions,
    };

    console.log("Reading Exam Setup:", payload);
    alert("Reading Exam Setup Saved (frontend only). Backend pending.");
  };

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
          value="Reading"
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

        {/* GENERATE BUTTON */}
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
                value={topic.total}
                onChange={(e) =>
                  handleTopicTotalChange(index, e.target.value)
                }
                required
              />
            </div>
          ))}
        </div>

        {/* TOTAL SECTION */}
        <div className="total-section">
          <h3>Total Questions: {totalQuestions}</h3>
          {totalQuestions > 40 && (
            <div className="warning">Total cannot exceed 40!</div>
          )}
        </div>

        <button type="submit" disabled={totalQuestions > 40}>
          Create Reading Exam
        </button>
      </form>
    </div>
  );
}
