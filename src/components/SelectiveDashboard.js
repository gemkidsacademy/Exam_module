import React, { useState } from "react";
import "./SelectiveDashboard.css";

// IMPORT COMPONENTS
import ExamPageThinkingSkills from "./ExamPageThinkingSkills";
import ExamPageMathematicalReasoning from "./ExamPageMathematicalReasoning";
import ReadingComponent from "./ReadingComponent";
import ExamPageWriting from "./ExamPageWriting";



import WelcomeScreen from "./WelcomeScreen";

const SUBJECT_KEY_MAP = {
  "Thinking skills": "thinking_skills",
  "Mathematical Reasoning": "mathematical_reasoning",
  "Reading": "reading",
  "Writing": "writing",
};

const COMPONENT_MAP = {
  "Thinking skills": ExamPageThinkingSkills,
  "Mathematical Reasoning": ExamPageMathematicalReasoning,
  "Reading": ReadingComponent,
  "Writing": ExamPageWriting,
};

const SelectiveDashboard = () => {
  const [activeTab, setActiveTab] = useState(null);

  const studentId = sessionStorage.getItem("student_id");
  const tabs = Object.keys(SUBJECT_KEY_MAP);

  const ActiveComponent = COMPONENT_MAP[activeTab];
  const subjectKey = SUBJECT_KEY_MAP[activeTab];

  return (
    <div className="selective-dashboard">

      {/* Horizontal Menu */}
      <nav className="horizontal-menu">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`menu-item ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </nav>

      {/* Content */}
      <main className="content-area">

        {ActiveComponent ? (
          <div className="exam-root">
            {activeTab === "Reading" ? (
              <div className="reading-mode">
                <ActiveComponent
                  studentId={studentId}
                  subject={subjectKey}
                  difficulty="advanced"
                />
              </div>
            ) : (
              <ActiveComponent
                studentId={studentId}
                subject={subjectKey}
                difficulty="advanced"
              />
            )}
          </div>
        ) : (
          <WelcomeScreen />
        )}
      
      </main>



    </div>
  );
};

export default SelectiveDashboard;
