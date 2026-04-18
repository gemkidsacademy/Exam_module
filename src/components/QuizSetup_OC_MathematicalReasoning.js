import React, { useState, useEffect } from "react";
import "./QuizSetup.css";

export default function QuizSetup_OC_MathematicalReasoning() {
  const [availableTopics, setAvailableTopics] = useState([]);
  const [questionBank, setQuestionBank] = useState([]);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [qbLoading, setQbLoading] = useState(false);

  const [quiz, setQuiz] = useState({
    className: "oc", // ✅ OC
    subject: "mathematical_reasoning", // ⚠️ keep consistent with backend
    classYear: "",
    difficulty: "",
    numTopics: 1,
    topics: [],
  });

  const [totalQuestions, setTotalQuestions] = useState(0);

  const getUsedTopicNames_OC_MR = (currentIndex) => {
    return quiz.topics
      .map((t, i) => (i !== currentIndex ? t.name : null))
      .filter(Boolean);
  };

  /* ============================
     HANDLERS
  ============================ */

  const handleDeleteAllQuestions_OC_MR = async () => {
    const confirmed = window.confirm(
      "Delete ALL OC Mathematical Reasoning questions?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        "https://web-production-481a5.up.railway.app/api/admin/delete-all-questions-OC-MR",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      alert(data.message || "Deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Error deleting questions");
    }
  };

  const handleViewQuestionBank_OC_MR = async () => {
  try {
    if (!quiz.classYear) {
      alert("Please select class year first");
      return;
    }

    setQbLoading(true);

    const params = new URLSearchParams({
      class_year: quiz.classYear, // ✅ ADD THIS
    });

    const res = await fetch(
      `https://web-production-481a5.up.railway.app/api/admin/question-bank-oc-mathematical-reasoning?${params.toString()}`
    );

    if (!res.ok) throw new Error("Failed");

    const data = await res.json();
    setQuestionBank(data);
    setShowQuestionBank(true);
  } catch (err) {
    console.error(err);
    alert("Failed to fetch question bank");
  } finally {
    setQbLoading(false);
  }
};
  const handleInputChange_OC_MR = (e) => {
    const { name, value } = e.target;
    setQuiz((prev) => ({ ...prev, [name]: value }));
  };

  const generateTopics_OC_MR = () => {
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

  const handleTopicChange_OC_MR = (index, field, value) => {
    setQuiz((prev) => {
      const topics = [...prev.topics];
      const numValue = Number(value) || 0;

      topics[index][field] = numValue;

      const total =
        Number(topics[index].ai || 0) +
        Number(topics[index].db || 0);

      topics[index].total = total;
      topics[index].warning = total > 35;

      const globalTotal = topics.reduce(
        (sum, t) => sum + (Number(t.total) || 0),
        0
      );

      setTotalQuestions(globalTotal);
      return { ...prev, topics };
    });
  };

  const handleTopicNameChange_OC_MR = (index, value) => {
    setQuiz((prev) => {
      const topics = [...prev.topics];
      topics[index].name = value;
      return { ...prev, topics };
    });
  };

  /* ============================
     FETCH TOPICS
  ============================ */

  useEffect(() => {
    if (!quiz.difficulty) {
      setAvailableTopics([]);
      return;
    }

    const fetchTopics_OC_MR = async () => {
      try {
        const params = new URLSearchParams({
          class_name: quiz.className,
          subject: quiz.subject,
          difficulty: quiz.difficulty,
        });

        const res = await fetch(
          `https://web-production-481a5.up.railway.app/api/topic/oc/math?${params.toString()}`
        );

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();
        setAvailableTopics(data);
      } catch (err) {
        console.error(err);
        setAvailableTopics([]);
      }
    };

    fetchTopics_OC_MR();
  }, [quiz.className, quiz.subject, quiz.difficulty]);

  /* ============================
     SUBMIT
  ============================ */
  const handleSubmitHomework_OC_MR = async () => {
  if (!quiz.difficulty) {
    alert("Select difficulty");
    return;
  }

  if (!quiz.classYear) {
    alert("Select class year");
    return;
  }

  if (quiz.topics.length === 0) {
    alert("Generate topics first");
    return;
  }

  if (totalQuestions !== 35) {
    alert("Total must be 35");
    return;
  }

  const payload = {
    class_name: quiz.className,
    subject: quiz.subject,
    class_year: quiz.classYear, // ✅ included
    difficulty: quiz.difficulty,
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
      "https://web-production-481a5.up.railway.app/api/quizzes/oc-mathematical-reasoning-homework", // ✅ NEW ENDPOINT
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error(err);
      throw new Error("Failed");
    }

    await res.json();
    alert("OC Mathematical Reasoning Homework created!");
  } catch (err) {
    console.error(err);
    alert("Error saving homework");
  }
};
  const handleSubmit_OC_MR = async (e) => {
    e.preventDefault();

    if (!quiz.difficulty) {
      alert("Select difficulty");
      return;
    }

    if (quiz.topics.length === 0) {
      alert("Generate topics first");
      return;
    }

    if (totalQuestions !== 35) {
      alert("Total must be 35");
      return;
    }

    const payload = {
      class_name: quiz.className,
      subject: quiz.subject,
      difficulty: quiz.difficulty,
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
        "https://web-production-481a5.up.railway.app/api/quizzes/oc-mathematical-reasoning",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error(err);
        throw new Error("Failed");
      }

      await res.json();
      alert("OC Mathematical Reasoning exam created!");
    } catch (err) {
      console.error(err);
      alert("Error saving exam");
    }
  };

  /* ============================
     RENDER
  ============================ */

  return (
    <div className="quiz-setup-container">
      <form onSubmit={handleSubmit_OC_MR}>

        <label>Class:</label>
        <input type="text" value="OC" disabled />

        <label>Subject:</label>
        <input type="text" value="Mathematical Reasoning" disabled />
        <label>Class Year:</label>
        <select
          name="classYear"
          value={quiz.classYear || ""}
          onChange={handleInputChange_OC_MR}
          required
        >
          <option value="">Select Class Year</option>
          <option value="Year 3">Year 3</option>
          <option value="Year 4">Year 4</option>
          
        </select>

        <label>Difficulty Level:</label>
        <select
          name="difficulty"
          value={quiz.difficulty}
          onChange={handleInputChange_OC_MR}
          required
        >
          <option value="">Select Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <label>Number of Topics:</label>
        <input
          type="number"
          name="numTopics"
          min="1"
          value={quiz.numTopics}
          onChange={handleInputChange_OC_MR}
        />

        <button type="button" onClick={generateTopics_OC_MR}>
          Generate Topics
        </button>

        <button
          type="button"
          onClick={handleViewQuestionBank_OC_MR}
          style={{ marginLeft: "10px" }}
        >
          View Question Bank
        </button>

        <button
          type="button"
          onClick={handleDeleteAllQuestions_OC_MR}
          style={{ marginLeft: "10px" }}
        >
          Delete All Questions
        </button>

        {showQuestionBank && (
          <div className="question-bank">
            <h3>OC Mathematical Reasoning Question Bank</h3>

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

        <div className="topics-container">
          {quiz.topics.map((topic, index) => (
            <div className="topic" key={index}>
              <h4>Topic {index + 1}</h4>

              <select
                value={topic.name}
                onChange={(e) =>
                  handleTopicNameChange_OC_MR(index, e.target.value)
                }
                required
              >
                <option value="">Select topic</option>
                {availableTopics
                  .filter(
                    (t) =>
                      !getUsedTopicNames_OC_MR(index).includes(t.name)
                  )
                  .map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
              </select>

              <input
                type="number"
                min="0"
                value={topic.ai}
                onChange={(e) =>
                  handleTopicChange_OC_MR(index, "ai", e.target.value)
                }
              />

              <input
                type="number"
                min="0"
                value={topic.db}
                onChange={(e) =>
                  handleTopicChange_OC_MR(index, "db", e.target.value)
                }
              />
            </div>
          ))}
        </div>

        <h3>Total Questions: {totalQuestions}</h3>

        <button type="submit">
          Create OC Mathematical Reasoning Exam
        </button>
        <button
          type="button"
          onClick={handleSubmitHomework_OC_MR}
          style={{ marginTop: "10px", backgroundColor: "#28a745", color: "white" }}
        >
          Create OC Mathematical Reasoning (Homework)
        </button>
      </form>
    </div>
  );
}
