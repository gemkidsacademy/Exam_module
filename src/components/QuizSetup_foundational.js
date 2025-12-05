import React, { useState } from "react";
import "./QuizSetup_foundational.css";

export default function QuizSetup_foundational() {
  const [quiz, setQuiz] = useState({
    className: "",
    subject: "",
    difficulty: "",
    sections: [
      { name: "", ai: 0, db: 0, total: 0, time: 0 }, // Required section
      { name: "", ai: 0, db: 0, total: 0, time: 0 }, // Required section
      { name: "", ai: "", db: "", total: 0, time: "" }, // Optional section
    ],
  });

  const [totalQuestions, setTotalQuestions] = useState(0);

  /** Check if optional Section 3 is completely empty */
  const isSection3Empty = () => {
    const s = quiz.sections[2];
    return (
      s.name.trim() === "" &&
      (s.ai === "" || s.ai === 0) &&
      (s.db === "" || s.db === 0) &&
      (s.time === "" || s.time === 0)
    );
  };

  /** Update section name */
  const handleSectionNameChange = (index, value) => {
    const sections = [...quiz.sections];
    sections[index].name = value;
    setQuiz((prev) => ({ ...prev, sections }));
  };

  /** Update AI/DB/Time fields */
  const handleSectionChange = (index, field, value) => {
    const sections = [...quiz.sections];
    const numValue = value === "" ? "" : Number(value);

    sections[index][field] = numValue;

    // Calculate totals
    const ai = Number(sections[index].ai) || 0;
    const db = Number(sections[index].db) || 0;
    sections[index].total = ai + db;

    // Recalculate entire quiz total
    const finalTotal = sections.reduce(
      (sum, sec) => sum + (Number(sec.total) || 0),
      0
    );

    setTotalQuestions(finalTotal);
    setQuiz((prev) => ({ ...prev, sections }));
  };

  /** Handle submit */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!quiz.className || !quiz.subject || !quiz.difficulty) {
      alert("Please select class, subject, and difficulty.");
      return;
    }

    if (!quiz.sections[0].name.trim() || !quiz.sections[1].name.trim()) {
      alert("Section 1 and Section 2 must have names.");
      return;
    }

    const section3Empty = isSection3Empty();

    if (
      !section3Empty &&
      (!quiz.sections[2].name.trim() ||
        quiz.sections[2].ai === "" ||
        quiz.sections[2].db === "" ||
        quiz.sections[2].time === "")
    ) {
      alert(
        "Section 3 is optional, but if you fill any field then ALL fields in Section 3 must be completed."
      );
      return;
    }

    if (totalQuestions > 40) {
      alert("Total questions cannot exceed 40.");
      return;
    }

    // Automatically remove Section 3 if empty
    const filteredSections = quiz.sections.filter((sec, i) => {
      if (i === 2 && section3Empty) return false;
      return true;
    });

    const payload = {
      class_name: quiz.className,
      subject: quiz.subject,
      difficulty: quiz.difficulty,
      sections: filteredSections.map((s) => ({
        name: s.name,
        ai: Number(s.ai) || 0,
        db: Number(s.db) || 0,
        total: Number(s.total) || 0,
        time: Number(s.time) || 0,
      })),
    };

    try {
      const res = await fetch(
        "https://web-production-481a5.up.railway.app/api/quizzes",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error("Backend error:", err);
        throw new Error("Failed to save quiz setup");
      }

      alert("Quiz setup saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Error saving quiz setup. Please try again.");
    }
  };

  return (
    <div className="quiz-setup-container">
      <form onSubmit={handleSubmit}>

        <label>Class:</label>
        <select
          value={quiz.className}
          onChange={(e) =>
            setQuiz((prev) => ({ ...prev, className: e.target.value }))
          }
          required
        >
          <option value="">Select Class</option>
          <option value="selective">Selective</option>
          <option value="year3">Year 3</option>
          <option value="year4">Year 4</option>
          <option value="year5">Year 5</option>
          <option value="year6">Year 6</option>
        </select>

        <label>Subject:</label>
        <select
          value={quiz.subject}
          onChange={(e) =>
            setQuiz((prev) => ({ ...prev, subject: e.target.value }))
          }
          required
        >
          <option value="">Select Subject</option>
          <option value="thinking_skills">Thinking Skills</option>
          <option value="maths">Mathematical Reasoning</option>
          <option value="reading">Reading</option>
          <option value="writing">Writing</option>
        </select>

        <label>Difficulty:</label>
        <select
          value={quiz.difficulty}
          onChange={(e) =>
            setQuiz((prev) => ({ ...prev, difficulty: e.target.value }))
          }
          required
        >
          <option value="">Select Difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        {/* NEW 3-COLUMN LAYOUT */}
        <div className="sections-grid">
          {quiz.sections.map((sec, index) => (
            <div className="section" key={index}>
              <h3>
                Section {index + 1} {index === 2 && "(Optional)"}
              </h3>

              <label>Section Name:</label>
              <input
                type="text"
                value={sec.name}
                onChange={(e) =>
                  handleSectionNameChange(index, e.target.value)
                }
                required={index !== 2}
              />

              <label>AI Questions:</label>
              <input
                type="number"
                min="0"
                value={sec.ai}
                onChange={(e) =>
                  handleSectionChange(index, "ai", e.target.value)
                }
                required={index !== 2}
              />

              <label>Database Questions:</label>
              <input
                type="number"
                min="0"
                value={sec.db}
                onChange={(e) =>
                  handleSectionChange(index, "db", e.target.value)
                }
                required={index !== 2}
              />

              <label>Total Questions:</label>
              <input type="number" value={sec.total} readOnly />

              <label>Time Allowed (Minutes):</label>
              <input
                type="number"
                min="0"
                value={sec.time}
                onChange={(e) =>
                  handleSectionChange(index, "time", e.target.value)
                }
                required={index !== 2}
              />
            </div>
          ))}
        </div>

        <div className="total-section">
          <h3>Total Questions: {totalQuestions}</h3>
          {totalQuestions > 40 && (
            <div className="warning">Total cannot exceed 40!</div>
          )}
        </div>

        <button type="submit" disabled={totalQuestions > 40}>
          Submit Quiz Setup
        </button>
      </form>
    </div>
  );
}
