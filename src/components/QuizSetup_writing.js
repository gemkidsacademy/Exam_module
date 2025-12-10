import React, { useState } from "react";
import "./QuizSetup_writing.css";

export default function QuizSetup_writing() {
  const [form, setForm] = useState({
    className: "",
    subject: "writing",
    topic: "",
    difficulty: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.className || !form.topic || !form.difficulty) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      class_name: form.className,
      subject: "writing",
      topic: form.topic,
      difficulty: form.difficulty
    };

    console.log("Writing exam setup:", payload);
    alert("Writing exam metadata saved (mock). Backend integration coming later.");
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

        {/* SUBJECT */}
        <label>Subject:</label>
        <input
          type="text"
          value="Writing"
          readOnly
          style={{ background: "#eee" }}
        />

        {/* TOPIC */}
        <label>Topic:</label>
        <input
          type="text"
          name="topic"
          value={form.topic}
          onChange={handleChange}
          placeholder="Narrative / Persuasive / Descriptive"
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
        <button type="submit">Save Writing Exam</button>
      </form>
    </div>
  );
}
