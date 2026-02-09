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
    subject: examType.replace("naplan_", ""), // ✅ SINGLE SOURCE
    year: "",
    difficulty: "",
    numTopics: 1,
    topics: [],
  });

  /* keep subject synced with examType */
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

      console.log("[QB] subject:", quiz.subject);
      console.log("[QB] year:", quiz.year);

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
      <label>Number of Topics:</label>
        <input
          type="number"
          name="numTopics"
          min="1"
          value={quiz.numTopics}
          onChange={handleInputChange}
        />

      <div style={{ marginTop: "15px" }}>
        <button
          type="button"
          onClick={handleViewQuestionBank}
          disabled={!quiz.year}
        >
          View Question Bank
        </button>
      </div>

      {/* ============================
         Question Bank Table
      ============================ */}
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
