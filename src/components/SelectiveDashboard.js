import React, { useState } from "react";
import "./SelectiveDashboard.css";

// IMPORT COMPONENTS
import ExamPageThinkingSkills from "./ExamPageThinkingSkills";
import MathematicalReasoning from "./MathematicalReasoning";
import ReadingComponent from "./ReadingComponent";
import WritingComponent from "./WritingComponent";

const SUBJECT_KEY_MAP = {
  "Thinking skills": "thinking_skills",
  "Mathematical reasoning": "mathematical_reasoning",
  "Reading": "reading",
  "Writing": "writing",
};

// Tab → Component mapping
const COMPONENT_MAP = {
  "Thinking skills": ExamPageThinkingSkills,
  "Mathematical reasoning": MathematicalReasoning,
  "Reading": ReadingComponent,
  "Writing": WritingComponent,
};

const SelectiveDashboard = () => {
  const [activeTab, setActiveTab] = useState("Thinking skills");

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
        <h2 className="subject-title">{activeTab}</h2>

        <ActiveComponent
          studentId={studentId}
          subject={subjectKey}
          difficulty="advanced"
        />
      </main>
    </div>
  );
};

export default SelectiveDashboard;
