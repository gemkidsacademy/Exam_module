import React, { useState, useEffect } from "react";

import "./QuizSetup.css";

/* ============================
     this is helping setup Mathematical Reasoning
  ============================ */


export default function QuizSetup() {
  const [availableTopics, setAvailableTopics] = useState([]);
  const getUsedTopicNames = (currentIndex) => {
  return quiz.topics
    .map((t, i) => (i !== currentIndex ? t.name : null))
    .filter(Boolean);
};


  

  const [totalQuestions, setTotalQuestions] = useState(0);
  const [quiz, setQuiz] = useState({
       className: "selective",
       subject: "thinking_skills",
       difficulty: "",
       numTopics: 1,
       topics: [],
     });

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
      total: 0
    }));


    setQuiz((prev) => ({ ...prev, topics: topicsArray }));
    setTotalQuestions(0);
  };

  const handleTopicChange = (index, field, value) => {
    setQuiz((prev) => {
      const topics = [...prev.topics];

      // Convert input to number safely
      const numValue = Number(value) || 0;

      // Update the ai/db field
      topics[index][field] = numValue;

      // Recalculate per-topic total
      const total =
        Number(topics[index].ai || 0) +
        Number(topics[index].db || 0);

      topics[index].total = total;
      topics[index].warning = total > 35;

      // After updating topics, recalc global total
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

  useEffect(() => {
  // Do not fetch until difficulty is selected
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

  fetchTopics();
}, [quiz.className, quiz.subject, quiz.difficulty]);

     
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

    if (totalQuestions !== 40) {
      alert("Total questions across all topics must be 40.");
      return;
    }

    const payload = {
      class_name: quiz.className.trim(),
      subject: quiz.subject.trim(),
      difficulty: quiz.difficulty.trim(),
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
        "https://web-production-481a5.up.railway.app/api/quizzes",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error("Backend returned:", err);
        throw new Error("Failed to save quiz setup");
      }

      const data = await res.json();
      console.log("Quiz saved:", data);
      alert("Quiz setup saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Error saving quiz setup. Please try again.");
    }
  };

  return (
    <div className="quiz-setup-container">
      <form onSubmit={handleSubmit}>
        <label>Class:</label>
          <input
            type="text"
            value="Selective"
            readOnly
          />

        <label>Subject:</label>
          <input
            type="text"
            value="Thinking Skills"
            readOnly
          />

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
                 required
               >
                 <option value="">Select a topic</option>
               
                 {availableTopics
                   .filter(
                     (t) =>
                       !getUsedTopicNames(index).includes(t.name)
                   )
                   .map((t) => (
                     <option key={t.id || t.name} value={t.name}>
                       {t.name}
                     </option>
                   ))}
               </select>


              <label>Questions Generated by AI:</label>
              <input
                type="number"
                min="0"
                value={topic.ai}
                onChange={(e) =>
                  handleTopicChange(index, "ai", e.target.value)
                }
                required
              />

              <label>Questions from Database:</label>
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

        <div className="total-section">
          <h3>Total Questions: {totalQuestions}</h3>
          {totalQuestions > 40 && (
            <div className="warning">Total cannot exceed 40!</div>
          )}
        </div>

        <button type="submit" disabled={totalQuestions > 40}>
          Create Exam
        </button>
      </form>
    </div>
  );
}
