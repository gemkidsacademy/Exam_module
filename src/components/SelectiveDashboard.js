import React, { useState, useEffect } from "react";
import "./SelectiveDashboard.css";

// IMPORT THE TAB COMPONENTS HERE
import ThinkingSkills from "./ThinkingSkills";
import MathematicalReasoning from "./MathematicalReasoning";
import ReadingComponent from "./ReadingComponent";
import WritingComponent from "./WritingComponent";

const SUBJECT_KEY_MAP = {
  "Thinking skills": "thinking_skills",
  "Mathematical reasoning": "mathematical_reasoning",
  "Reading": "reading",
  "Writing": "writing",
};

// MAP TABS TO COMPONENTS
const COMPONENT_MAP = {
  "Thinking skills": ThinkingSkills,
  "Mathematical reasoning": MathematicalReasoning,
  "Reading": ReadingComponent,
  "Writing": WritingComponent,
};

const SelectiveDashboard = () => {
  const [activeTab, setActiveTab] = useState("Thinking skills");
  const [examData, setExamData] = useState(null);

  const studentId = sessionStorage.getItem("student_id");

  const tabs = Object.keys(SUBJECT_KEY_MAP);

  useEffect(() => {
    const fetchExamStatus = async () => {
      const subjectKey = SUBJECT_KEY_MAP[activeTab];

      try {
        const res = await fetch(
          `https://web-production-481a5.up.railway.app/api/student/exam-status?student_id=${studentId}&subject=${subjectKey}`
        );

        if (!res.ok) {
          setExamData(null);
          return;
        }

        const data = await res.json();
        setExamData(data);
      } catch (err) {
        console.error(err);
        setExamData(null);
      }
    };

    fetchExamStatus();
  }, [activeTab]);

  // Choose the correct component dynamically
  const ActiveComponent = COMPONENT_MAP[activeTab];

  return (
    <div className="selective-dashboard">
      
      {/* Sidebar */}
      <aside className="sidebar">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`tab-item ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </aside>

      {/* Content area */}
      <main className="content-area">
        <h2>{activeTab}</h2>

        {!examData ? (
          <p>Loading exam information...</p>
        ) : (
          <>
            {/* Top green header */}
            <div className="quiz-card">
              <div className="quiz-header">
                <h3 className="quiz-title">
                  NSW Selective {activeTab} Skills Test – Free Trial 1
                </h3>
              </div>

              {/* Difficulty + Attempts Row */}
              <div className="quiz-meta-row">
                <span className="difficulty-pill">Advanced Level</span>
                <span className="attempts-pill">
                  Attempts: {examData.attempts_used} / {examData.attempts_allowed}
                </span>
              </div>

              {/* Question count */}
              <div className="questions-row">
                <span className="questions-icon">📘</span>
                <span className="questions-text">
                  {examData.total_questions} Questions
                </span>
              </div>

              {/* Buttons */}
              <div className="quiz-buttons">
                <button className="results-btn">Results</button>

                {examData.started && !examData.completed ? (
                  <button className="resume-btn">Resume</button>
                ) : (
                  <button className="start-btn">Start Quiz</button>
                )}
              </div>
            </div>

            {/* Render the tab-specific component */}
            <ActiveComponent examData={examData} studentId={studentId} />
          </>
        )}
      </main>
    </div>
  );
};

export default SelectiveDashboard;
