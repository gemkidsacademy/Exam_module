import React, { useState, useEffect } from "react";
import "./QuizSetup.css";

export default function QuizSetup_naplan({ examType }) {
  const [availableTopics, setAvailableTopics] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questionBank, setQuestionBank] = useState([]);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [qbLoading, setQbLoading] = useState(false);

  const [quiz, setQuiz] = useState({
    className: "naplan",
    subject: examType.replace("naplan_", ""), // ✅ RESTORED
    year: "",
    difficulty: "",
    numTopics: 1,
    topics: [],
  });

  /* keep subject in sync with examType */
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
          class_name: "naplan",
          subject: quiz.subject,
          year: quiz.year,
          difficulty: quiz.difficulty,
        });

        const res = await fetch(
          `https://web-production-481a5.up.railway.app/api/topics?${params.toString()}`
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
        <option value="1">Year 1</option>
        <option value="3">Year 3</option>
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

      <button
        type="button"
        onClick={generateTopics}
        disabled={!quiz.year || !quiz.difficulty}
      >
        Generate Topics
      </button>
    </div>
  );
}
