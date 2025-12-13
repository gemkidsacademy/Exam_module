import React, { useState } from "react";
import "./QuizSetup_writing.css";

const BACKEND_URL = "https://web-production-481a5.up.railway.app";

export default function QuizSetup_writing() {
  const [form, setForm] = useState({
    className: "",
    topic: "",
    difficulty: ""
  });

  const [loading, setLoading] = useState(false);

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
      subject: "Writing",
      topic: form.topic.trim(),   // fully editable text
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

  return (
    <div className="quiz-setup-container">
      <form onSubmit={handleSubmit}>

        {/* CLASS */}
        <label>Class:</label>
        <select
          name="className"
          value={form.className}
          onChange={handleChange}
          required
        >
          <option value="">Select Class</option>
          <option value="selective">Selective</option>
          <option value="year5">Year 5</option>
          <option value="year6">Year 6</option>
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
        <input
          type="text"
          name="topic"
          value={form.topic}
          onChange={handleChange}
          placeholder="e.g. Narrative, Persuasive, Descriptive, Argumentative"
          required
        />

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
