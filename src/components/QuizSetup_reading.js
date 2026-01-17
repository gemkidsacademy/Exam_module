import React, { useState, useEffect } from "react";
import "./QuizSetup.css";

export default function QuizSetup_reading() {
  const [quiz, setQuiz] = useState({
    className: "selective",
    subject: "reading_comprehension",
    difficulty: "",
    numTopics: 1,
    topics: [],
  });
  const ALLOW_DUPLICATE_TOPICS = ["Comparative analysis"];
  const MAX_TOPIC_USAGE = {
    "Comparative analysis": 3
  };



  const FIXED_TOPIC_QUESTION_RULES = {
    "Main Idea and Summary": 6,
    "Gapped Text": 6,
  };
  
  const CHOICE_TOPIC_QUESTION_RULES = {
    "Comparative analysis": [8, 10],
  };


  const [availableTopics, setAvailableTopics] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [questionBank, setQuestionBank] = useState([]);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  

  const handleViewQuestionBank = async () => {
  if (!quiz.difficulty) {
    alert("Please select difficulty first.");
    return;
  }

  try {
    setLoadingQuestions(true);
    setShowQuestionBank(false);

    const params = new URLSearchParams({
      subject: quiz.subject,
      class_name: quiz.className, // ✅ correct
    });

    const res = await fetch(
      `https://web-production-481a5.up.railway.app/api/reading/question-bank?${params.toString()}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch question bank");
    }

    const data = await res.json();
    setQuestionBank(data.rows || []);
    setShowQuestionBank(true);
  } catch (err) {
    console.error(err);
    alert("Failed to load question bank");
  } finally {
    setLoadingQuestions(false);
  }
};


  const getUsedTopicNames = (currentIndex) =>
    quiz.topics
      .map((t, i) => (i !== currentIndex ? t.name : null))
      .filter(Boolean);

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
      name: "",
      num_questions: 0,
    }));

    setQuiz((prev) => ({ ...prev, topics: topicsArray }));
    setTotalQuestions(0);
  };

  const handleTopicSelect = (index, value) => {
  setQuiz((prev) => {
    const topics = [...prev.topics];
    topics[index].name = value;

    // Fixed topics → auto set
    if (FIXED_TOPIC_QUESTION_RULES[value] !== undefined) {
      topics[index].num_questions = FIXED_TOPIC_QUESTION_RULES[value];
    }

    // Choice-based topics → default to first option
    if (CHOICE_TOPIC_QUESTION_RULES[value]) {
      topics[index].num_questions = CHOICE_TOPIC_QUESTION_RULES[value][0];
    }

    const globalTotal = topics.reduce(
      (sum, t) => sum + (Number(t.num_questions) || 0),
      0
    );

    setTotalQuestions(globalTotal);
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
  // FETCH TOPICS
  // ---------------------------------------
  useEffect(() => {
    if (!quiz.difficulty) {
      setAvailableTopics([]);
      return;
    }

    const fetchReadingTopics = async () => {
      try {
        const params = new URLSearchParams({
          difficulty: quiz.difficulty,
        });

        const res = await fetch(
          `https://web-production-481a5.up.railway.app/api/reading/topics?${params.toString()}`
        );

        if (!res.ok) throw new Error("Failed to load reading topics");

        const data = await res.json();
        setAvailableTopics(data);
      } catch (err) {
        console.error(err);
        setAvailableTopics([]);
      }
    };

    fetchReadingTopics();
  }, [quiz.difficulty]);

  // ---------------------------------------
  // SUBMIT
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

    // ✅ QUESTION COUNT ENFORCEMENT (RESTORED)
    if (totalQuestions < 30 || totalQuestions > 38) {
      alert(
        `Reading exam must contain between 30 and 38 questions. Currently selected: ${totalQuestions}.`
      );
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

      const response = await fetch(
        "https://web-production-481a5.up.railway.app/api/admin/create-reading-config",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

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
        <label>Class:</label>
        <input value="Selective" readOnly />

        <label>Subject:</label>
        <input value="Reading Comprehension" readOnly />

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
        <button
          type="button"
          onClick={handleViewQuestionBank}
          disabled={!quiz.difficulty}
        >
          View Question Bank
        </button>

        <div className="topics-container">
          {quiz.topics.map((topic, index) => (
            <div className="topic" key={index}>
              <h4>Topic {index + 1}</h4>

              <label>Topic Name:</label>
              <select
                value={topic.name}
                onChange={(e) =>
                  handleTopicSelect(index, e.target.value)
                }
                required
              >
                <option value="">Select Topic</option>
                {availableTopics
                  .filter((t) => {
                    const usedNames = getUsedTopicNames(index);
                    const usageCount = usedNames.filter(name => name === t.name).length;
                
                    // Enforce max usage if defined
                    if (MAX_TOPIC_USAGE[t.name] !== undefined) {
                      return usageCount < MAX_TOPIC_USAGE[t.name];
                    }
                
                    // Default: allow only once
                    return !usedNames.includes(t.name);
                  })
                  .map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}

              </select>

              <label>Total Questions for this Topic:</label>
              
              {/* Comparative Analysis → dropdown */}
              {CHOICE_TOPIC_QUESTION_RULES[topic.name] ? (
                <select
                  value={topic.num_questions}
                  onChange={(e) =>
                    handleTopicTotalChange(index, e.target.value)
                  }
                >
                  {CHOICE_TOPIC_QUESTION_RULES[topic.name].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                /* Fixed or free numeric input */
                <input
                  type="number"
                  min="0"
                  value={topic.num_questions}
                  onChange={(e) =>
                    handleTopicTotalChange(index, e.target.value)
                  }
                  disabled={FIXED_TOPIC_QUESTION_RULES[topic.name] !== undefined}
                  style={
                    FIXED_TOPIC_QUESTION_RULES[topic.name] !== undefined
                      ? { backgroundColor: "#f3f3f3", cursor: "not-allowed" }
                      : {}
                  }
                  required
                />
              )}

            </div>
          ))}
        </div>
        {/* ---------------------------- */}
          {/* QUESTION BANK PREVIEW */}
          {/* ---------------------------- */}
          {/* ---------------------------- */}
{/* QUESTION BANK SUMMARY */}
{/* ---------------------------- */}
{showQuestionBank && (
  <div className="question-bank">
    <h3>Question Bank Summary</h3>

    {loadingQuestions ? (
      <p>Loading summary...</p>
    ) : questionBank.length === 0 ? (
      <p>No questions found.</p>
    ) : (
      <table className="question-bank-table">
        <thead>
          <tr>
            <th>Difficulty</th>
            <th>Topic</th>
            <th>Total Questions</th>
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

        <div className="total-section">
          <h3>Total Questions: {totalQuestions}</h3>

          {(totalQuestions < 30 || totalQuestions > 38) && (
            <div className="warning">
              Total must be between 30 and 38 questions.
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={
            loading || totalQuestions < 30 || totalQuestions > 38
          }
        >
          {loading ? "Saving..." : "Create Reading Exam"}
        </button>
      </form>
    </div>
  );
}
