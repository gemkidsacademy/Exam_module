import React, { useState } from "react";
import "./QuizSetup_foundational.css";

export default function QuizSetup_foundational() {
  const [quiz, setQuiz] = useState({
    className: "",
    subject: "",
    sections: [
      { name: "", ai: 0, db: 0, total: 0, time: 0, intro: "" },
      { name: "", ai: 0, db: 0, total: 0, time: 0, intro: "" },
      { name: "", ai: "", db: "", total: 0, time: "", intro: "" },
    ],
  });

  React.useEffect(() => {
    setQuiz((prev) => ({
      ...prev,
      sections: prev.sections.map((sec, i) => ({
        ...sec,
        name: i === 0 ? "Easy" : i === 1 ? "Medium" : "Hard",
      })),
    }));
  }, []);

  const [totalQuestions, setTotalQuestions] = useState(0);

  const isSection3Empty = () => {
    const s = quiz.sections[2];
    return (
      (s.ai === "" || s.ai === 0) &&
      (s.db === "" || s.db === 0) &&
      (s.time === "" || s.time === 0) &&
      (!s.intro || s.intro.trim() === "")
    );
  };

  const handleSectionChange = (index, field, value) => {
    const sections = [...quiz.sections];
    const numeric = field === "intro" ? value : value === "" ? "" : Number(value);

    sections[index][field] = numeric;

    if (field === "ai" || field === "db") {
      const ai = Number(sections[index].ai) || 0;
      const db = Number(sections[index].db) || 0;
      sections[index].total = ai + db;

      const globalTotal = sections.reduce(
        (sum, sec) => sum + (Number(sec.total) || 0),
        0
      );

      setTotalQuestions(globalTotal);
    }

    setQuiz((prev) => ({ ...prev, sections }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!quiz.className || !quiz.subject) {
      alert("Please select class and subject.");
      return;
    }

    if (!quiz.sections[0].name.trim() || !quiz.sections[1].name.trim()) {
      alert("Section 1 and Section 2 must have names.");
      return;
    }

    // SECTION 3 RULES
    const section3Empty = isSection3Empty();

    if (
      !section3Empty &&
      (
        !quiz.sections[2].name.trim() ||
        quiz.sections[2].ai === "" ||
        quiz.sections[2].db === "" ||
        quiz.sections[2].time === "" ||
        quiz.sections[2].intro.trim() === ""
      )
    ) {
      alert("Section 3 is optional, but if any field is filled, ALL fields must be filled including intro text.");
      return;
    }

    if (section3Empty && totalQuestions > 40) {
      alert("Total questions cannot exceed 40 when only 2 sections are used.");
      return;
    }

    if (!section3Empty && totalQuestions > 50) {
      alert("Total questions cannot exceed 50 when all 3 sections are used.");
      return;
    }

    const finalSections = quiz.sections.filter((_, i) => !(i === 2 && section3Empty));

    const payload = {
      class_name: quiz.className,
      subject: quiz.subject,
      sections: finalSections.map((s) => ({
        name: s.name.trim(),
        ai: Number(s.ai) || 0,
        db: Number(s.db) || 0,
        total: Number(s.total) || 0,
        time: Number(s.time) || 0,
        intro: s.intro.trim(),
      })),
    };

    try {
      const res = await fetch(
        "https://web-production-481a5.up.railway.app/api/quizzes-foundational",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save quiz setup");

      alert("Quiz setup saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving quiz setup. Please try again.");
    }
  };

  return (
    <div className="quiz-setup-container">
      <form onSubmit={handleSubmit}>

        {/* ---------- TOP ROW ---------- */}
        <div className="top-row-grid">
          <div className="top-row-item">
            <label>Class:</label>
            <select
              value={quiz.className}
              onChange={(e) => setQuiz((prev) => ({ ...prev, className: e.target.value }))}
            >
              <option value="">Select Class</option>
              <option value="selective">Selective</option>
              <option value="year3">Year 3</option>
              <option value="year4">Year 4</option>
              <option value="year5">Year 5</option>
              <option value="year6">Year 6</option>
            </select>
          </div>

          <div className="top-row-item">
            <label>Subject:</label>
            <select
              value={quiz.subject}
              onChange={(e) => setQuiz((prev) => ({ ...prev, subject: e.target.value }))}
            >
              <option value="">Select Subject</option>
              <option value="thinking_skills">Thinking Skills</option>
              <option value="maths">Foundational</option>
              <option value="reading">Reading</option>
              <option value="writing">Writing</option>
            </select>
          </div>
        </div>

        {/* ---------- SECTIONS GRID ---------- */}
        <div className="sections-grid">
          {quiz.sections.map((sec, index) => (
            <div className="section" key={index}>
              <h3>Section {index + 1} {index === 2 && "(Optional)"}</h3>

              <label>Difficulty Level:</label>
              <input
                type="text"
                value={index === 0 ? "Easy" : index === 1 ? "Medium" : "Hard"}
                readOnly
                style={{ backgroundColor: "#f3f3f3", cursor: "not-allowed" }}
              />

              <label>Intro Text (Displayed Before Sections):</label>
              <textarea
                className="intro-textarea"
                value={sec.intro}
                onChange={(e) =>
                  handleSectionChange(index, "intro", e.target.value)
                }
                placeholder="Enter intro/instructions for this section"
                rows={4}
              />


              <label>AI Questions:</label>
              <input
                type="number"
                min="0"
                value={sec.ai}
                onChange={(e) => handleSectionChange(index, "ai", e.target.value)}
                required={index !== 2}
              />

              <label>Database Questions:</label>
              <input
                type="number"
                min="0"
                value={sec.db}
                onChange={(e) => handleSectionChange(index, "db", e.target.value)}
                required={index !== 2}
              />

              <label>Total Questions:</label>
              <input type="number" value={sec.total} readOnly />

              <label>Time Allowed (Minutes):</label>
              <input
                type="number"
                min="0"
                value={sec.time}
                onChange={(e) => handleSectionChange(index, "time", e.target.value)}
                required={index !== 2}
              />
            </div>
          ))}
        </div>

        {/* ---------- TOTAL SUMMARY ---------- */}
        <div className="total-section">
          <h3>Total Questions: {totalQuestions}</h3>

          {isSection3Empty() && totalQuestions > 40 && (
            <div className="warning">Total cannot exceed 40 when only 2 sections are used.</div>
          )}

          {!isSection3Empty() && totalQuestions > 50 && (
            <div className="warning">Total cannot exceed 50 when all 3 sections are used.</div>
          )}
        </div>

        <button
          type="submit"
          disabled={
            (isSection3Empty() && totalQuestions > 40) ||
            (!isSection3Empty() && totalQuestions > 50)
          }
        >
          Create Exam
        </button>
      </form>
    </div>
  );
}
