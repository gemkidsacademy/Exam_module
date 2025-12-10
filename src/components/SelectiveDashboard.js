import React, { useState } from "react";
import "./SelectiveDashboard.css";

// IMPORT COMPONENTS
import ExamPageThinkingSkills from "./ExamPageThinkingSkills";
import ExamPageFoundational from "./ExamPageFoundational";
import ReadingComponent from "./ReadingComponent";
import WritingComponent from "./WritingComponent";
import WelcomeScreen from "./WelcomeScreen";
import QuizSetup from "./QuizSetup";

const SUBJECT_KEY_MAP = {
  "Thinking skills": "thinking_skills",
  "Foundational": "mathematical_reasoning",
  "Reading": "reading",
  "Writing": "writing",
};

// Tab → Component mapping
const COMPONENT_MAP = {
  "Thinking skills": ExamPageThinkingSkills,
  "Foundational": ExamPageFoundational,
  "Reading": ReadingComponent,
  "Writing": WritingComponent,
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
          <ActiveComponent
            studentId={studentId}
            subject={subjectKey}
            difficulty="advanced"
          />
        ) : (
          <QuizSetup />
        )}
      </main>

    </div>
  );
};

export default SelectiveDashboard;
