  import React, { useState, useEffect } from "react";
  
  import "./QuizSetup.css";

  const BACKEND_URL = process.env.REACT_APP_API_URL;


  export default function QuizSetup_MathematicalReasoning() {
    const [availableTopics, setAvailableTopics] = useState([]);
    const [questionBank, setQuestionBank] = useState([]);
    const [showQuestionBank, setShowQuestionBank] = useState(false);
    const [qbLoading, setQbLoading] = useState(false);
    const [availableCounts, setAvailableCounts] = useState({});
    const toggleDifficulty = (index, level) => {
  setQuiz((prev) => {
    const topics = [...prev.topics];
    const currentTopic = topics[index];
    const currentLevel = currentTopic[level];

    const newEnabled = !currentLevel.enabled;

    topics[index] = {
      ...currentTopic,
      [level]: {
        ...currentLevel,
        enabled: newEnabled,
        ai: newEnabled ? currentLevel.ai : 0,
        db: newEnabled ? currentLevel.db : 0
      }
    };

    if (newEnabled && currentTopic.name) {
      fetchQuestionCounts(currentTopic.name);
    }

    return { ...prev, topics };
  });
};

    const [quiz, setQuiz] = useState({
      className: "selective",
      subject: "mathematical_reasoning",
      classYear: "",   // 👈 ADD THIS
      numTopics: 1,
      topics: [],
    });
    const getUsedTopicNames = (currentIndex) => {
    return quiz.topics
      .map((t, i) => (i !== currentIndex ? t.name : null))
      .filter(Boolean);
  };
  
  
    const [totalQuestions, setTotalQuestions] = useState(0);
    
  
    /* ============================
       HANDLERS
    ============================ */
    const handleResetUsedQuestions_MR = async () => {
  const confirmReset = window.confirm("Reset used questions?");
  if (!confirmReset) return;

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/admin/reset-used-questions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_name: quiz.className,
          subject: quiz.subject,
          class_year: quiz.classYear,
        }),
      }
    );

    if (!res.ok) throw new Error("Failed");

    const data = await res.json();
    alert(`Reset successful! ${data.updated_count} updated.`);
  } catch (err) {
    console.error(err);
    alert("Error resetting.");
  }
};
    const validateQuizBeforeSubmit_MR = () => {
      if (quiz.topics.length === 0) {
        alert("Please generate at least one topic.");
        return false;
      }
      if (!quiz.className || !quiz.subject || !quiz.classYear) {
        alert("Please select class, subject, and year.");
        return false;
      }

  

  for (const topic of quiz.topics) {
    const hasDifficulty =
      topic.easy.enabled ||
      topic.medium.enabled ||
      topic.hard.enabled;

    if (!hasDifficulty) {
      alert(`Select at least one difficulty for topic: ${topic.name || "Unnamed"}`);
      return false;
    }
  }

  if (totalQuestions !== 35) {
    alert("Total questions must be 35.");
    return false;
  }

  return true;
};
    
    
    const fetchQuestionCounts = async (topicName) => {
  try {
    const params = new URLSearchParams({
      topic: topicName,
      class_year: quiz.classYear,
      class_name: quiz.className,
      subject: quiz.subject
    });

    const response = await fetch(
      `${BACKEND_URL}/api/question-count?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch counts (status: ${response.status})`);
    }

    const data = await response.json();

    setAvailableCounts((prevCounts) => ({
      ...prevCounts,
      [topicName]: data
    }));

  } catch (error) {
    console.error("Error fetching question counts:", error);
  }
};
    const handleHomeworkSubmit = async (e) => {
      if (!validateQuizBeforeSubmit_MR()) return;
  e.preventDefault();

  

  

  

  const payload = {
    class_name: quiz.className,
    subject: quiz.subject,
    class_year: quiz.classYear,
    difficulty: "mixed",
    num_topics: quiz.topics.length,
    topics: quiz.topics.map((t) => ({
      name: t.name.trim(),
      easy: {
        enabled: t.easy.enabled,
        ai: Number(t.easy.ai),
        db: Number(t.easy.db)
      },
      medium: {
        enabled: t.medium.enabled,
        ai: Number(t.medium.ai),
        db: Number(t.medium.db)
      },
      hard: {
        enabled: t.hard.enabled,
        ai: Number(t.hard.ai),
        db: Number(t.hard.db)
      },
      total: Number(t.total)
    })),
  };

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/quizzes/mathematical-reasoning/homework`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error("Backend returned:", err);
      throw new Error("Failed to save homework quiz");
    }

    await res.json();
    alert("Mathematical Reasoning Homework created successfully!");
  } catch (error) {
    console.error(error);
    alert("Error saving homework exam. Please try again.");
  }
};
  const handleDifficultyChange = (index, level, field, value) => {
  setQuiz((prev) => {
    const topics = [...prev.topics];
    const num = Number(value) || 0;

    const topic = topics[index];

    topics[index] = {
      ...topic,
      [level]: {
        ...topic[level],
        [field]: num
      }
    };

    const t = topics[index];

    // ✅ Recalculate topic total
    t.total =
      t.easy.ai + t.easy.db +
      t.medium.ai + t.medium.db +
      t.hard.ai + t.hard.db;

    // ✅ Recalculate global total
    const grandTotal = topics.reduce(
      (sum, item) => sum + item.total,
      0
    );

    setTotalQuestions(grandTotal);

    return { ...prev, topics };
  });
};
    const handleDeleteAllQuestions = async () => {
  const confirmed = window.confirm(
    "Are you sure you want to delete ALL questions? This cannot be undone."
  );

  if (!confirmed) return;

  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/delete-all-questions-MR`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete questions");
    }

    const data = await response.json();
    alert(data.message || "All questions deleted successfully.");
  } catch (error) {
    console.error("Error deleting questions:", error);
    alert("Something went wrong while deleting the questions.");
  }
};
    const handleViewQuestionBank = async () => {
  try {
    setQbLoading(true);

    if (!quiz.className || !quiz.classYear) {
      alert("Please select class and class year.");
      return;
    }

    // ✅ Normalize classYear safely (handles "Year 5" OR 5)
    let classYearValue = quiz.classYear;

    if (typeof classYearValue === "string") {
      const match = classYearValue.match(/\d+/);
      classYearValue = match ? Number(match[0]) : null;
    }

    if (!classYearValue) {
      alert("Invalid class year.");
      return;
    }

    const params = new URLSearchParams({
      class_name: quiz.className,
      class_year: String(classYearValue),
    });

    const res = await fetch(
      `${BACKEND_URL}/api/admin/question-bank-mathematical-reasoning?${params.toString()}`
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

    const handleInputChange = (e) => {
      const { name, value } = e.target;

      setQuiz((prev) => ({
        ...prev,
        [name]: name === "classYear" ? Number(value) : value
      }));
    };
  
    const generateTopics = () => {
      const num = parseInt(quiz.numTopics) || 1;

      const topicsArray = Array.from({ length: num }, () => ({
        name: "",
        easy: { enabled: false, ai: 0, db: 0 },
        medium: { enabled: false, ai: 0, db: 0 },
        hard: { enabled: false, ai: 0, db: 0 },
        total: 0
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

      if (value) {
        fetchQuestionCounts(value);
      }
    };
    useEffect(() => {
    // Do not fetch until difficulty is selected
    if (!quiz.classYear) {
      setAvailableTopics([]);
      return;
    }
  
    const fetchTopics = async () => {
  try {
    // ✅ Normalize classYear safely
    let classYearValue = quiz.classYear;

    if (typeof classYearValue === "string") {
      const match = classYearValue.match(/\d+/);
      classYearValue = match ? Number(match[0]) : null;
    }

    if (!quiz.className || !quiz.subject || !classYearValue) {
      setAvailableTopics([]);
      return;
    }

    const params = new URLSearchParams({
      class_name: quiz.className,
      subject: quiz.subject,
      class_year: String(classYearValue),   // ✅ NEW
      
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

fetchTopics();

}, [quiz.className, quiz.subject, quiz.classYear]);  // ✅ added classYear dependency

    /* ============================
       SUBMIT
    ============================ */
    const handleSubmit = async (e) => {
      if (!validateQuizBeforeSubmit_MR()) return;
      e.preventDefault();
  
      
  
      
  
      
  
      const payload = {
        class_name: quiz.className,
        subject: quiz.subject,
        class_year: quiz.classYear,   
        num_topics: quiz.topics.length,
        topics: quiz.topics.map((t) => ({
          name: t.name.trim(),
          easy: {
            enabled: t.easy.enabled,
            ai: Number(t.easy.ai),
            db: Number(t.easy.db)
          },
          medium: {
            enabled: t.medium.enabled,
            ai: Number(t.medium.ai),
            db: Number(t.medium.db)
          },
          hard: {
            enabled: t.hard.enabled,
            ai: Number(t.hard.ai),
            db: Number(t.hard.db)
          },
          total: Number(t.total)
        })),
      };
  
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/quizzes/mathematical-reasoning`,
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
          <label>Class Year:</label>
          <select
            name="classYear"
            value={quiz.classYear}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Year</option>
            <option value={4}>Year 4</option>
            <option value={5}>Year 5</option>
            <option value={6}>Year 6</option>
          </select>
  
          {/* CONFIGURABLE */}
          
  
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
          <button type="button" onClick={handleResetUsedQuestions_MR}>
            Reset Used Questions
          </button>
          <button
            type="button"
            onClick={handleDeleteAllQuestions}
            style={{ marginLeft: "10px" }}
          >
            Delete All Questions
          </button>
          {showQuestionBank && (
            <div className="question-bank">
              <h3>Question Bank (Mathematical Reasoning)</h3>
          
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

  
          {/* TOPICS */}
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
                      (t) => !getUsedTopicNames(index).includes(t.name)
                    )
                    .map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name}
                      </option>
                    ))}
  
                </select>
  
                <div className="difficulty-block">

                {/* EASY */}
                <label>
                  <input
                    type="checkbox"
                    checked={topic.easy.enabled}
                    onChange={() => toggleDifficulty(index, "easy")}
                  />
                  Easy
                </label>

                {topic.easy.enabled && (
                  <div className="grid-2">
                    <div>
                      <label>AI Questions:</label>
                      <input
                        type="number"
                        min="0"
                        value={topic.easy.ai}
                        onChange={(e) =>
                          handleDifficultyChange(index, "easy", "ai", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label>
                        DB Questions
                        <div style={{ color: "blue", fontSize: "12px" }}>
                          Available: {availableCounts[topic.name]?.easy ?? "-"}
                        </div>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={topic.easy.db}
                        onChange={(e) =>
                          handleDifficultyChange(index, "easy", "db", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}

                {/* MEDIUM */}
                <label style={{ marginTop: "10px" }}>
                  <input
                    type="checkbox"
                    checked={topic.medium.enabled}
                    onChange={() => toggleDifficulty(index, "medium")}
                  />
                  Medium
                </label>

                {topic.medium.enabled && (
                  <div className="grid-2">
                    <div>
                      <label>AI Questions:</label>
                      <input
                        type="number"
                        min="0"
                        value={topic.medium.ai}
                        onChange={(e) =>
                          handleDifficultyChange(index, "medium", "ai", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label>
                        DB Questions
                        <div style={{ color: "blue", fontSize: "12px" }}>
                          Available: {availableCounts[topic.name]?.medium ?? "-"}
                        </div>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={topic.medium.db}
                        onChange={(e) =>
                          handleDifficultyChange(index, "medium", "db", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}

                {/* HARD */}
                <label style={{ marginTop: "10px" }}>
                  <input
                    type="checkbox"
                    checked={topic.hard.enabled}
                    onChange={() => toggleDifficulty(index, "hard")}
                  />
                  Hard
                </label>

                {topic.hard.enabled && (
                  <div className="grid-2">
                    <div>
                      <label>AI Questions:</label>
                      <input
                        type="number"
                        min="0"
                        value={topic.hard.ai}
                        onChange={(e) =>
                          handleDifficultyChange(index, "hard", "ai", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label>
                        DB Questions
                        <div style={{ color: "blue", fontSize: "12px" }}>
                          Available: {availableCounts[topic.name]?.hard ?? "-"}
                        </div>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={topic.hard.db}
                        onChange={(e) =>
                          handleDifficultyChange(index, "hard", "db", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}

              </div>
              </div>
            ))}
          </div>
          <div className="summary-box">
            <div>Total Questions: {totalQuestions} / 35</div>

            {totalQuestions === 35 && (
              <div className="ready-text">✔ Ready to Create Exam</div>
            )}

            {totalQuestions > 35 && (
              <div className="warning">Total cannot exceed 35!</div>
            )}
          </div>
  
          
  
          <button type="submit" disabled={totalQuestions !== 35}>
            Create Mathematical Reasoning Exam
          </button>
          

          <button
            type="button"
            onClick={handleHomeworkSubmit}
            disabled={totalQuestions !== 35}
            style={{ marginLeft: "10px", backgroundColor: "#28a745", color: "white" }}
          >
            Create Homework Exam
          </button>

        </form>
      </div>
    );
  }
