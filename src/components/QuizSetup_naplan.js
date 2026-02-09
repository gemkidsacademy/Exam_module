import React, { useState, useEffect } from "react";
import "./QuizSetup.css";

export default function QuizSetup_naplan({ examType }) {
  const [availableTopics, setAvailableTopics] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questionBank, setQuestionBank] = useState([]);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [qbLoading, setQbLoading] = useState(false);
  useEffect(() => {
      if (examType) {
        setQuiz((prev) => ({
          ...prev,
          subject: examType.replace("naplan_", ""),
          topics: [],
        }));
        setAvailableTopics([]);
        setTotalQuestions(0);
        setShowQuestionBank(false);
      }
    }, [examType]);

  const handleViewQuestionBank = async () => {
    try {
      setQbLoading(true);
  
      const res = await fetch(
        `https://web-production-481a5.up.railway.app/api/admin/question-bank?class=naplan&subject=${quiz.subject}`
      );
  
      if (!res.ok) {
        throw new Error("Failed to load question bank");
      }
  
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



  const [quiz, setQuiz] = useState({
    className: "naplan",
    subject: examType?.replace("naplan_", "") || "",
    difficulty: "",
    numTopics: 1,
    topics: [],
  });

  const getUsedTopicNames = (currentIndex) =>
    quiz.topics
      .map((t, i) => (i !== currentIndex ? t.name : null))
      .filter(Boolean);

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
      topics[index].total =
        Number(topics[index].ai || 0) +
        Number(topics[index].db || 0);

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
     Fetch available topics
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
          const res = await fetch(
            `https://web-production-481a5.up.railway.app/api/topics?${params.toString()}`
              );

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
  }, [quiz.className, quiz.subject, quiz.difficulty]);

  /* ============================
     Submit
  ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!quiz.difficulty) {
      alert("Please select difficulty.");
      return;
    }

    if (quiz.topics.length === 0) {
      alert("Please generate topics.");
      return;
    }

    if (totalQuestions !== 40) {
      alert("Total questions must be exactly 40.");
      return;
    }

    const payload = {
      class_name: quiz.className,
      subject: quiz.subject,
      difficulty: quiz.difficulty,
      num_topics: quiz.topics.length,
      topics: quiz.topics.map((t) => ({
        name: t.name,
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

      if (!res.ok) throw new Error("Failed to save NAPLAN quiz");

      alert("NAPLAN exam created successfully!");
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
      <form onSubmit={handleSubmit}>
        <label>Class:</label>
        <input value="NAPLAN" readOnly />

        <label>Subject:</label>
        <input
          value={quiz.subject.replace("_", " ").toUpperCase()}
          readOnly
        />

        <label>Difficulty:</label>
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

        <button
          type="button"
          onClick={handleViewQuestionBank}
          style={{ marginLeft: "10px" }}
        >
          View Question Bank
        </button>
        {showQuestionBank && (
          <div className="question-bank">
            <h3>
              Question Bank (
              {quiz.subject.replace("_", " ").toUpperCase()}
              )
            </h3>
        
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
                <option value="">Select topic</option>
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
        </div>

        <button type="submit" disabled={totalQuestions !== 40}>
          Create NAPLAN Exam
        </button>
      </form>
    </div>
  );
}
