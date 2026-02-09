import React, { useState } from "react";

const LABELS = {
  naplan_numeracy: "NAPLAN – Numeracy",
  naplan_language_conventions: "NAPLAN – Language Conventions",
  naplan_reading: "NAPLAN – Reading",
  naplan_writing: "NAPLAN – Writing",
};

const QuizSetup_naplan = ({ examType }) => {
  const [examName, setExamName] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [totalQuestions, setTotalQuestions] = useState("");

  if (!examType) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      category: "naplan",
      examType,
      examName,
      yearLevel,
      timeLimit,
      totalQuestions,
    };

    console.log("Creating NAPLAN exam:", payload);

    // later:
    // POST /api/exams
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>{LABELS[examType]}</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <input
          type="text"
          placeholder="Exam name"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          required
        />

        <select
          value={yearLevel}
          onChange={(e) => setYearLevel(e.target.value)}
          required
        >
          <option value="">Select year level</option>
          <option value="3">Year 3</option>
          <option value="5">Year 5</option>
          <option value="7">Year 7</option>
          <option value="9">Year 9</option>
        </select>

        <input
          type="number"
          placeholder="Time limit (minutes)"
          value={timeLimit}
          onChange={(e) => setTimeLimit(e.target.value)}
          min="1"
          required
        />

        <input
          type="number"
          placeholder="Total questions"
          value={totalQuestions}
          onChange={(e) => setTotalQuestions(e.target.value)}
          min="1"
          required
        />

        <button type="submit" className="dashboard-button">
          Create NAPLAN Exam
        </button>
      </form>
    </div>
  );
};

export default QuizSetup_naplan;
