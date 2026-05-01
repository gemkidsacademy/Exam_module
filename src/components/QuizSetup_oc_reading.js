import React, { useState, useEffect } from "react";
import "./QuizSetup.css";

const BACKEND_URL = process.env.REACT_APP_API_URL;

export default function QuizSetup_oc_reading() {
  const [quiz, setQuiz] = useState({
    className: "oc",
    subject: "reading_comprehension",
    classYear: "",
    numTopics: 1,
    topics: [],
  });

  // ---------------------------------------
  // CONFIG RULES (OC SPECIFIC)
  // ---------------------------------------

  const FIXED_TOPIC_QUESTION_RULES_OC = {
    "Main Idea and Summary": 6,
    "Gapped Text": 6,
  };

  const CHOICE_TOPIC_QUESTION_RULES_OC = {
    "Comparative Analysis": [8, 10],
  };

  const MAX_TOPIC_USAGE_OC = {
    "Comparative Analysis": 2,
  };

  // ---------------------------------------
  // STATE
  // ---------------------------------------

  const [availableTopics, setAvailableTopics] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [questionBank, setQuestionBank] = useState([]);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const handleDeleteAllQuestions = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all reading questions?"
    );
  
    if (!confirmed) return;
  
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/delete-all-questions-oc-reading`, {
        method: "DELETE",
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete questions");
      }
  
      alert(data.message || "All Reading questions deleted.");
    } catch (error) {
      console.error("Error deleting questions:", error);
      alert("Something went wrong while deleting the questions.");
    }
  };
  // ---------------------------------------
  // HELPERS
  // ---------------------------------------

  const getUsedTopicNames_oc = (currentIndex) =>
    quiz.topics
      .map((t, i) => (i !== currentIndex ? t.name : null))
      .filter(Boolean);

  // ---------------------------------------
  // INPUT HANDLERS
  // ---------------------------------------

  const handleInputChange_oc = (e) => {
    const { name, value } = e.target;
    setQuiz((prev) => ({ ...prev, [name]: value }));
  };

  const generateTopics_oc = () => {
    const num = parseInt(quiz.numTopics) || 1;

    const topicsArray = Array.from({ length: num }, () => ({
      name: "",
      difficulty: "",
      available_difficulties: [],
      num_questions: 0,
    }));

    setQuiz((prev) => ({ ...prev, topics: topicsArray }));
    setTotalQuestions(0);
  };

  const handleTopicSelect_oc = async (index, value) => {
  try {
    // Step 1: update topic basic state
    setQuiz((prev) => {
      const topics = [...prev.topics];

      topics[index] = {
        ...topics[index],
        name: value,
        difficulty: "",
        available_difficulties: [],
        num_questions: 0,
      };

      return { ...prev, topics };
    });

    // Step 2: fetch difficulties from backend
    const params = new URLSearchParams({
      class_year: quiz.classYear,
      topic: value,
    });

    const res = await fetch(
      `${BACKEND_URL}/api/reading-oc/topic-difficulties?${params}`
    );

    const data = await res.json();

    // Step 3: update available difficulties
    setQuiz((prev) => {
      const topics = [...prev.topics];

      topics[index] = {
        ...topics[index],
        available_difficulties: data || [],
      };

      return { ...prev, topics };
    });

  } catch (error) {
    console.error("Error fetching difficulties:", error);
  }
};

  const handleTopicTotalChange_oc = (index, value) => {
    const numValue = Number(value) || 0;

    setQuiz((prev) => {
      const topics = [...prev.topics];
      topics[index].num_questions = numValue;

      const total = topics.reduce(
        (sum, t) => sum + (Number(t.num_questions) || 0),
        0
      );

      setTotalQuestions(total);
      return { ...prev, topics };
    });
  };

  // ---------------------------------------
  // FETCH TOPICS
  // ---------------------------------------

  useEffect(() => {
    

    const fetchTopics_oc = async () => {
      try {
        const params = new URLSearchParams({
          class_year: quiz.classYear,
        });

        const res = await fetch(
          `${BACKEND_URL}/api/reading/topics-oc?${params}`
        );

        if (!res.ok) throw new Error("Failed to load topics");

        const data = await res.json();
        setAvailableTopics(data);
      } catch (err) {
        console.error(err);
        setAvailableTopics([]);
      }
    };

    fetchTopics_oc();
  }, [quiz.classYear]);

  // ---------------------------------------
  // VIEW QUESTION BANK
  // ---------------------------------------

  const handleViewQuestionBank_oc = async () => {
  try {
    setLoadingQuestions(true);
    setShowQuestionBank(true);

    const params = new URLSearchParams({
      class_year: quiz.classYear,
    });

    const res = await fetch(
      `${BACKEND_URL}/api/reading/question-bank-oc?${params}`
    );

    if (!res.ok) throw new Error("Failed");

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
  // ---------------------------------------
  // SUBMIT
  // ---------------------------------------

  const handleSubmit_oc = async (e) => {
    e.preventDefault();

    

    if (quiz.topics.length === 0) {
      alert("Generate topics first.");
      return;
    }

    // OC RANGE (adjust if needed)
    if (totalQuestions < 25 || totalQuestions > 35) {
      alert(
        `OC Reading must be between 25 and 35 questions. Current: ${totalQuestions}`
      );
      return;
    }

    const payload = {
      class_name: "oc",
      class_year: quiz.classYear,
      subject: quiz.subject,
      difficulty: "mixed",   // ✅ ADD THIS
      topics: quiz.topics.map((t) => ({
        name: t.name.trim(),
        difficulty: t.difficulty,
        num_questions: Number(t.num_questions),
      })),
    };

    try {
      setLoading(true);

      const res = await fetch(
        `${BACKEND_URL}/api/admin/create-reading-config`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.detail);
        return;
      }

      alert(`OC Reading Exam Created! ID: ${data.config_id}`);
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Error creating exam");
    }
  };

  // ---------------------------------------
  // UI
  // ---------------------------------------

  return (
    <div className="quiz-setup-container">
      <form onSubmit={handleSubmit_oc}>
        <label>Class:</label>
        <input value="OC" readOnly />

        <label>Subject:</label>
        <input value="Reading Comprehension" readOnly />
        <label>Class Year:</label>
        <select
          name="classYear"
          value={quiz.classYear}
          onChange={handleInputChange_oc}
          required
        >
          <option value="">Select</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
        </select>

        

        <label>Number of Topics:</label>
        <input
          type="number"
          name="numTopics"
          value={quiz.numTopics}
          onChange={handleInputChange_oc}
        />

        <button type="button" onClick={generateTopics_oc}>
          Generate Topics
        </button>

        <button
          type="button"
          onClick={handleViewQuestionBank_oc}
          disabled={!quiz.classYear}
        >
          View Question Bank
        </button>
        <button
          type="button"
          onClick={handleDeleteAllQuestions}
          
        >
          Delete All Questions
        </button>

        {/* Topics */}
        <div className="topics-container">
          {quiz.topics.map((topic, index) => (
            <div key={index} className="topic">
              <h4>Topic {index + 1}</h4>

              <select
                value={topic.name}
                onChange={(e) =>
                  handleTopicSelect_oc(index, e.target.value)
                }
              >
                <option value="">Select Topic</option>
                {availableTopics
                  .filter((t) => {
                    const used = getUsedTopicNames_oc(index);
                    const count = used.filter(n => n === t.name).length;

                    if (MAX_TOPIC_USAGE_OC[t.name] !== undefined) {
                      return count < MAX_TOPIC_USAGE_OC[t.name];
                    }

                    return !used.includes(t.name);
                  })
                  .map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
              </select>
              <label>Difficulty:</label>
                <select
                  value={topic.difficulty || ""}
                  onChange={(e) => {
                    const selectedDifficulty = e.target.value;

                    setQuiz((prev) => {
                      const updatedTopics = [...prev.topics];

                      const topicName = updatedTopics[index].name;

                      let questionCount = 0;

                      if (FIXED_TOPIC_QUESTION_RULES_OC[topicName] !== undefined) {
                        questionCount = FIXED_TOPIC_QUESTION_RULES_OC[topicName];
                      } else if (CHOICE_TOPIC_QUESTION_RULES_OC[topicName]) {
                        questionCount = CHOICE_TOPIC_QUESTION_RULES_OC[topicName][0];
                      }

                      updatedTopics[index] = {
                        ...updatedTopics[index],
                        difficulty: selectedDifficulty,
                        num_questions: questionCount,
                      };

                      const total = updatedTopics.reduce(
                        (sum, t) => sum + (Number(t.num_questions) || 0),
                        0
                      );

                      setTotalQuestions(total);

                      const finalTotal = updatedTopics.reduce(
                        (sum, t) => sum + (Number(t.num_questions) || 0),
                        0
                      );

                      setTotalQuestions(finalTotal);

                      return { ...prev, topics: updatedTopics };
                    });
                  }}
                  required
                  >
                    <option value="">Select Difficulty</option>

                    {topic.available_difficulties.map((difficultyOption) => (
                      <option key={difficultyOption} value={difficultyOption}>
                        {difficultyOption.charAt(0).toUpperCase() + difficultyOption.slice(1)}
                      </option>
                    ))}
                </select>
              {/* Question Input */}
              {CHOICE_TOPIC_QUESTION_RULES_OC[topic.name] ? (
                <select
                  value={topic.num_questions}
                  onChange={(e) =>
                    handleTopicTotalChange_oc(index, e.target.value)
                  }
                >
                  {CHOICE_TOPIC_QUESTION_RULES_OC[topic.name].map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  value={topic.num_questions}
                  onChange={(e) =>
                    handleTopicTotalChange_oc(index, e.target.value)
                  }
                  disabled={
                    FIXED_TOPIC_QUESTION_RULES_OC[topic.name] !== undefined
                  }
                />
              )}
            </div>
          ))}
        </div>
          {/* QUESTION BANK */}
          {showQuestionBank && (
            <div className="question-bank">
              <h3>Question Bank Summary</h3>
          
              {loadingQuestions ? (
                <p>Loading...</p>
              ) : questionBank.length === 0 ? (
                <p>No questions found.</p>
              ) : (
                <table className="question-bank-table">
                  <thead>
                    <tr>
                      <th>Difficulty</th>
                      <th>Topic</th>
                      <th>Set Size</th>
                      <th>Sets Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questionBank.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.difficulty}</td>
                        <td>{row.topic}</td>
                        <td>{row.set_size}</td>
                        <td>{row.sets_available}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}  

        <h3>Total Questions: {totalQuestions}</h3>
        {(totalQuestions < 29 || totalQuestions > 38) && (
          <div style={{ color: "red", fontWeight: "bold" }}>
            Total must be between 29 and 38 questions.
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create OC Reading Exam"}
        </button>
        <button
        type="button"
        onClick={async () => {
          

          if (!quiz.classYear) {
            alert("Please select class year.");
            return;
          }

          if (quiz.topics.length === 0) {
            alert("Generate topics first.");
            return;
          }

          if (totalQuestions < 29 || totalQuestions > 38) {
            alert(
              `OC Reading must be between 29 and 38 questions. Current: ${totalQuestions}`
            );
            return;
          }

          const payload = {
            class_name: "oc",
            subject: quiz.subject,
            class_year: quiz.classYear,
            difficulty: "mixed",   // ✅ REQUIRED
            topics: quiz.topics.map((t) => ({
              name: t.name.trim(),
              difficulty: t.difficulty,
              num_questions: Number(t.num_questions),
            })),
          };

          try {
            setLoading(true);

            const res = await fetch(
              `${BACKEND_URL}/api/admin/create-reading-homework-config`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              }
            );

            const data = await res.json();
            setLoading(false);

            if (!res.ok) {
              alert(data.detail);
              return;
            }

            alert(`OC Reading Homework Created! ID: ${data.config_id}`);
          } catch (err) {
            setLoading(false);
            console.error(err);
            alert("Error creating homework");
          }
        }}
      >
        {loading ? "Saving..." : "Create OC Reading Exam (Homework)"}
      </button>
      </form>
    </div>
  );
}
