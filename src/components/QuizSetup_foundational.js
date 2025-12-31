import React, { useState } from "react";
import "./QuizSetup_foundational.css";

export default function QuizSetup_foundational() {
 
  const [quiz, setQuiz] = useState({
    className: "",
    subject: "",
    sections: [
      { name: "", topic: "", availableTopics: [], ai: 0, db: 0, total: 0, time: 0, intro: "" },
      { name: "", topic: "", availableTopics: [], ai: 0, db: 0, total: 0, time: 0, intro: "" },
      { name: "", topic: "", availableTopics: [], ai: "", db: "", total: 0, time: "", intro: "" },
    ],
  });
  React.useEffect(() => {
  console.log("🔄 Class or Subject changed. Resetting topics.");

  setQuiz((prev) => ({
    ...prev,
    sections: prev.sections.map((sec) => ({
      ...sec,
      topic: "",
      availableTopics: [],
    })),
  }));
}, [quiz.className, quiz.subject]);

  React.useEffect(() => {
  if (!quiz.className || !quiz.subject) return;

  quiz.sections.forEach((section, index) => {
    const difficulty =
      index === 0 ? "Easy" : index === 1 ? "Medium" : "Hard";

    const url =
      `https://web-production-481a5.up.railway.app/api/topics-exam-setup` +
      `?class_name=${quiz.className}` +
      `&subject=${quiz.subject}` +
      `&difficulty=${difficulty}`;

    console.log("🌐 Fetching topics for:", difficulty, url);

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log(`✅ Topics for ${difficulty}:`, data);
        setQuiz((prev) => {
          const sections = [...prev.sections];
          sections[index] = {
            ...sections[index],
            availableTopics: data,
          };
          return { ...prev, sections };
        });
      })
      .catch((err) => {
        console.error(`❌ Error fetching topics for ${difficulty}`, err);
      });
  });
}, [quiz.className, quiz.subject]);





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
      (!s.intro || s.intro.trim() === "") &&
      (!s.topic || s.topic.trim() === "")
    );
  };

  const handleSectionChange = (index, field, value) => {
    const sections = [...quiz.sections];
    const numeric =
      field === "intro" || field === "topic"
        ? value
        : value === ""
        ? ""
        : Number(value);


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

  console.log("🟢 SUBMIT: Quiz setup initiated");

  if (!quiz.className || !quiz.subject) {
    alert("Please select class and subject.");
    return;
  }

  if (!quiz.sections[0].name.trim() || !quiz.sections[1].name.trim()) {
    alert("Section 1 and Section 2 must have names.");
    return;
  }

  const section3Empty = isSection3Empty();

  // Validate optional section 3
  if (
    !section3Empty &&
    (
      !quiz.sections[2].name.trim() ||
      quiz.sections[2].ai === "" ||
      quiz.sections[2].db === "" ||
      quiz.sections[2].time === "" ||
      quiz.sections[2].intro.trim() === "" ||
      quiz.sections[2].topic.trim() === ""
    )
  ) {
    alert(
      "Section 3 is optional, but if any field is filled, ALL fields must be filled including intro text and topic."
    );
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

  const finalSections = quiz.sections.filter(
    (_, i) => !(i === 2 && section3Empty)
  );

  const payload = {
    class_name: quiz.className,
    subject: quiz.subject,
    sections: finalSections.map((s, index) => {
      const sectionPayload = {
        name: s.name.trim(),
        topic: s.topic.trim(),              // ✅ EXPLICIT topic inclusion
        ai: Number(s.ai) || 0,
        db: Number(s.db) || 0,
        total: Number(s.total) || 0,
        time: Number(s.time) || 0,
        intro: s.intro.trim(),
      };

      console.log(`📦 Section ${index + 1} payload:`, sectionPayload);
      return sectionPayload;
    }),
  };

  console.log("🚀 Final payload sent to backend:");
  console.log(JSON.stringify(payload, null, 2));

  try {
    const res = await fetch(
      "https://web-production-481a5.up.railway.app/api/quizzes-foundational",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      console.error("❌ Backend response not OK:", res.status);
      throw new Error("Failed to save quiz setup");
    }

    const data = await res.json();
    console.log("✅ Backend success response:", data);

    alert("Exam setup saved successfully!");
  } catch (err) {
    console.error("❌ Error saving quiz setup:", err);
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
              onChange={(e) =>
                setQuiz((prev) => ({ ...prev, className: e.target.value }))
              }
            >
              <option value="">Select Class</option>
              <option value="kindergarten">Kindergarten</option>
              <option value="year1">Year 1</option>
              <option value="year2">Year 2</option>
              <option value="year3">Year 3</option>
              <option value="year4">Year 4</option>
              <option value="year5">Year 5</option>
              <option value="year6">Year 6</option>
              <option value="year7">Year 7</option>
              <option value="year8">Year 8</option>
              <option value="year9">Year 9</option>
              <option value="year10">Year 10</option>
            </select>
          </div>


          <div className="top-row-item">
            <label>Subject:</label>
            <select
              value={quiz.subject}
              onChange={(e) =>
                setQuiz((prev) => ({ ...prev, subject: e.target.value }))
              }
            >
              <option value="">Select Subject</option>
              <option value="english">English</option>
              <option value="maths">Maths</option>
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
              <label>Topic(s):</label>
              <select
                value={sec.topic}
                onChange={(e) =>
                  handleSectionChange(index, "topic", e.target.value)
                }
                required={index !== 2}
              >
                <option value="">Select Topic</option>
              
                {sec.availableTopics.map((topic, i) => (
                  <option key={i} value={topic}>
                    {topic}
                  </option>
                ))}

              </select>

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
