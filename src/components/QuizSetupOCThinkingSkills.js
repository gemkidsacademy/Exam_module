import React, { useState, useEffect } from "react";
import "./QuizSetup.css";


const BACKEND_URL = process.env.REACT_APP_API_URL;


/* ============================
   Setup OC Thinking Skills
============================ */

export default function QuizSetupOCThinkingSkills() {
  const [availableTopics, setAvailableTopics] = useState([]);
  const MAX_QUESTIONS = 40;
  const [questionBank, setQuestionBank] = useState([]);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [qbLoading, setQbLoading] = useState(false);
  const [availableCounts, setAvailableCounts] = useState({});

  const [totalQuestions, setTotalQuestions] = useState(0);
  const fetchQuestionCounts = async (topicName) => {
  try {
    const params = new URLSearchParams({
      topic: topicName,
      class_year: quiz.classYear,
      class_name: quiz.className,
      subject: quiz.subject
    });

    const res = await fetch(
      `${BACKEND_URL}/api/question-count?${params.toString()}`
    );

    const data = await res.json();

    setAvailableCounts(prev => ({
      ...prev,
      [topicName]: data
    }));

  } catch (err) {
    console.error(err);
  }
};

  const [quiz, setQuiz] = useState({
    className: "oc",
    classYear: "", // ✅ NEW
    subject: "thinking_skills",
    difficulty: "mixed",
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
      difficulty: "mixed",
      num_topics: quiz.topics.length,
      topics: quiz.topics.map((t) => ({
        name: t.name.trim(),
        easy: t.easy,
        medium: t.medium,
        hard: t.hard,
        total: t.total
      })),
    };

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/quizzes/oc-thinking-skills-homework`, // ✅ NEW ENDPOINT
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
      easy: { enabled: false, ai: 0, db: 0 },
      medium: { enabled: false, ai: 0, db: 0 },
      hard: { enabled: false, ai: 0, db: 0 },
      total: 0,
    }));;

    setQuiz((prev) => ({ ...prev, topics: topicsArray }));
    setTotalQuestions(0);
  };

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

    return { ...prev, topics };
  });
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

    t.total =
      t.easy.ai + t.easy.db +
      t.medium.ai + t.medium.db +
      t.hard.ai + t.hard.db;

    const grandTotal = topics.reduce(
      (sum, item) => sum + item.total,
      0
    );

    setTotalQuestions(grandTotal);

    return { ...prev, topics };
  });
};

  const handleTopicNameChange = (index, value) => {
    setQuiz((prev) => {
      const topics = [...prev.topics];
      topics[index].name = value;

      // fetch counts when topic selected
      if (value) {
        fetchQuestionCounts(value);
      }
      return { ...prev, topics };
    });
  };

  /* ============================
     QUESTION BANK
  ============================ */

  const handleViewQuestionBank = async () => {
  if (!quiz.classYear || quiz.classYear.toString().trim() === "") {
    alert("Please select class year first.");
    return;
  }

  try {
    setQbLoading(true);

    console.log("🚨 DEBUG PARAMS:");
    console.log("class_name:", quiz.className);
    console.log("class_year:", quiz.classYear);
    console.log("subject:", quiz.subject);

    const params = new URLSearchParams({
      class_name: quiz.className?.trim() || "",
      class_year: quiz.classYear?.toString().trim() || "",
      subject: quiz.subject?.trim() || "",
    });

    const url = `${BACKEND_URL}/api/admin/question-bank-oc-thinking-skills?${params.toString()}`;

    console.log("🌐 FINAL URL:", url);

    const res = await fetch(url);

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ API ERROR RESPONSE:", errText);
      throw new Error("Failed to load question bank");
    }

    const data = await res.json();

    console.log("📚 Question Bank Response:", data);

    setQuestionBank(data);
    setShowQuestionBank(true);
  } catch (err) {
    console.error("❌ Question bank fetch error:", err);
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
      `${BACKEND_URL}/api/admin/delete-previous-questions-OC-TS`,
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
  console.log("TOPIC useEffect triggered");
  console.log("className:", quiz.className);
  console.log("classYear:", quiz.classYear);
  console.log("subject:", quiz.subject);
  console.log("difficulty:", quiz.difficulty);

  if (
    !quiz.className ||
    !quiz.classYear ||
    !quiz.subject 
    
  ) {
    console.log("Blocked: missing required values");
    setAvailableTopics([]);
    return;
  }

  const fetchTopics = async () => {
    try {
      const params = new URLSearchParams({
        class_name: quiz.className,
        class_year: quiz.classYear,
        subject: quiz.subject,
        
      });

      const url = `${BACKEND_URL}/api/topics?${params.toString()}`;

      console.log("Calling:", url);

      const res = await fetch(url);

      console.log("Status:", res.status);

      const data = await res.json();

      console.log("Topics:", data);

      setAvailableTopics(data);
    } catch (error) {
      console.error(error);
      setAvailableTopics([]);
    }
  };

  fetchTopics();
}, [
  quiz.className,
  quiz.classYear,
  quiz.subject,
  
]);

  /* ============================
     SUBMIT
  ============================ */

  const handleSubmit = async (e) => {
    e.preventDefault();

    

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
      class_year: quiz.classYear,   // ✅ ADD HERE
      subject: quiz.subject,
      difficulty: "mixed",
      num_topics: quiz.topics.length,
      topics: quiz.topics.map((t) => ({
        name: t.name.trim(),
        easy: t.easy,
        medium: t.medium,
        hard: t.hard,
        total: t.total
      })),
    };

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/quizzes/oc-thinking-skills`,
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

              {/* EASY */}
              <div className="difficulty-block">
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
                    <input
                      type="number"
                      min="0"
                      placeholder="AI"
                      value={topic.easy.ai}
                      onChange={(e) =>
                        handleDifficultyChange(index, "easy", "ai", e.target.value)
                      }
                    />

                    <div>
                      <label>
                        DB
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
              </div>

              {/* MEDIUM */}
              <div className="difficulty-block">
                <label>
                  <input
                    type="checkbox"
                    checked={topic.medium.enabled}
                    onChange={() => toggleDifficulty(index, "medium")}
                  />
                  Medium
                </label>

                {topic.medium.enabled && (
                  <div className="grid-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="AI"
                      value={topic.medium.ai}
                      onChange={(e) =>
                        handleDifficultyChange(index, "medium", "ai", e.target.value)
                      }
                    />
                    <div>
                      <label>
                        DB
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
              </div>

              {/* HARD */}
              <div className="difficulty-block">
                <label>
                  <input
                    type="checkbox"
                    checked={topic.hard.enabled}
                    onChange={() => toggleDifficulty(index, "hard")}
                  />
                  Hard
                </label>

                {topic.hard.enabled && (
                  <div className="grid-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="AI"
                      value={topic.hard.ai}
                      onChange={(e) =>
                        handleDifficultyChange(index, "hard", "ai", e.target.value)
                      }
                    />

                   <div>
                    <label>
                      DB
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

              {/* TOPIC TOTAL */}
              <div style={{ marginTop: "8px", fontWeight: "bold" }}>
                Topic Total: {topic.total}
              </div>
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
