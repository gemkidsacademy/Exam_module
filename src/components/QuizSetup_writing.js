import React, { useState, useEffect } from "react";

import "./QuizSetup_writing.css";

const BACKEND_URL = "https://web-production-481a5.up.railway.app";

export default function QuizSetup_writing() {
  const [form, setForm] = useState({
    className: "selective",
    topic: "",
    difficulty: ""
  });

  const [loading, setLoading] = useState(false);
  const [availableTopics, setAvailableTopics] = useState([]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.className || !form.topic.trim() || !form.difficulty) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      class_name: form.className,
      subject: "writing",   // canonical API key
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
        className: "",
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
      </form>
    </div>
  );
}
