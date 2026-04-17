import React, { useState, useEffect } from "react";

import "./QuizSetup_writing.css";

const BACKEND_URL = "https://web-production-481a5.up.railway.app";

export default function QuizSetup_writing() {
  const [form, setForm] = useState({
    className: "selective",
    classYear: "",
    topic: "",
    difficulty: ""
  });

  const [loading, setLoading] = useState(false);
  const [availableTopics, setAvailableTopics] = useState([]);
  const handleDeleteAllWritingHomework = async () => {
  if (!window.confirm("⚠️ Are you sure you want to delete ALL writing homework questions?")) {
    return;
  }

  try {
    setLoading(true);

    const res = await fetch(
      `${BACKEND_URL}/api/admin/delete-writing-homework-questions`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Failed to delete questions");
    }

    alert("✅ All writing homework questions deleted successfully!");
  } catch (err) {
    console.error(err);
    alert("❌ Failed to delete questions.");
  } finally {
    setLoading(false);
  }
};
  const handleHomeworkSubmit = async (e) => {
    e.preventDefault();

    if (!form.className || !form.classYear || !form.topic.trim() || !form.difficulty) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      class_name: form.className,
      class_year: form.classYear,
      subject: "writing",
      topic: form.topic.trim(),
      difficulty: form.difficulty
    };

    try {
      setLoading(true);

      const res = await fetch(
        `${BACKEND_URL}/api/quizzes-writing-homework`, // ✅ DIFFERENT ENDPOINT
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to save writing homework exam");
      }

      alert("✅ Writing Homework exam saved!");

    } catch (err) {
      console.error(err);
      alert("❌ Error saving writing homework exam.");
    } finally {
      setLoading(false);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

     if (!form.className || !form.classYear || !form.topic.trim() || !form.difficulty) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      class_name: form.className,
      class_year: form.classYear,   // ✅ already included
      subject: "writing",
      topic: form.topic.trim(),
      difficulty: form.difficulty
    };


    try {
      setLoading(true);

      const res = await fetch(
        `${BACKEND_URL}/api/quizzes-writing`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to save writing exam");
      }

      alert("✅ Writing exam setup saved successfully!");

      setForm({
      className: "selective",
      classYear: "",
      topic: "",
      difficulty: ""
    });
    } catch (err) {
      console.error(err);
      alert("❌ Error saving writing exam setup.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  if (!form.difficulty) {
    setAvailableTopics([]);
    return;
  }

  const fetchWritingTopics = async () => {
    try {
      const params = new URLSearchParams({
        difficulty: form.difficulty,
      });

      const res = await fetch(
        `${BACKEND_URL}/api/writing/topics?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error("Failed to load writing topics");
      }

      const data = await res.json();
      setAvailableTopics(data);
    } catch (err) {
      console.error("Failed to fetch writing topics", err);
      setAvailableTopics([]);
    }
  };

  fetchWritingTopics();
}, [form.difficulty]);


  return (
    <div className="quiz-setup-container">
      <form onSubmit={handleSubmit}>

        {/* CLASS */}
        <label>Class:</label>
        <input
          type="text"
          value="Selective"
          readOnly
          style={{ backgroundColor: "#f0f0f0" }}
        />
        {/* CLASS YEAR */}
        <label>Class Year:</label>
        <select
          name="classYear"
          value={form.classYear}
          onChange={handleChange}
          required
        >
          <option value="">Select Year</option>
          <option value="Year 4">Year 4</option>
          <option value="Year 5">Year 5</option>
          <option value="Year 6">Year 6</option>
          
        </select>
        {/* SUBJECT (LOCKED) */}
        <label>Subject:</label>
        <input
          type="text"
          value="Writing"
          readOnly
          style={{ backgroundColor: "#f0f0f0" }}
        />

        {/* TOPIC (FULLY EDITABLE) */}
        <label>Topic:</label>
        <select
          name="topic"
          value={form.topic}
          onChange={handleChange}
          required
        >
          <option value="">Select Topic</option>
        
          {availableTopics.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>


        {/* DIFFICULTY */}
        <label>Difficulty Level:</label>
        <select
          name="difficulty"
          value={form.difficulty}
          onChange={handleChange}
          required
        >
          <option value="">Select Difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        {/* SUBMIT */}
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Writing Exam"}
        </button>
        <button
          type="button"
          onClick={handleHomeworkSubmit}
          disabled={loading}
          style={{ marginTop: "10px", backgroundColor: "#6c63ff", color: "white" }}
        >
          {loading ? "Saving..." : "Save Writing Exam (Homework)"}
        </button>
        <button
          type="button"
          onClick={handleDeleteAllWritingHomework}
          disabled={loading}
          style={{
            marginTop: "10px",
            backgroundColor: "#ff4d4f",
            color: "white"
          }}
        >
          {loading ? "Deleting..." : "Delete All Writing Questions"}
        </button>
      </form>
    </div>
  );
}
