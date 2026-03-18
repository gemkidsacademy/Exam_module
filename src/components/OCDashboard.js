import React, { useState } from "react";
import "./SelectiveDashboard.css"; // you can reuse same CSS

// EXAM COMPONENTS
import ExamPageOcThinkingSkills from "./ExamPageOcThinkingSkills";
import ExamPageOCMathematicalReasoning from "./ExamPageOCMathematicalReasoning";

//import ReadingComponent from "./ReadingComponent";

import WelcomeScreenOC from "./WelcomeScreenOC";
import InstructionsScreenOC from "./InstructionsScreenOC";

/*
  SUBJECT CONFIG (OC)
*/
const SUBJECTS = [
  {
    label: "Thinking Skills",
    key: "oc_thinking_skills",
    component: ExamPageOcThinkingSkills,
  },
  {
    label: "Mathematical Reasoning",
    key: "mathematical_reasoning",
    component: ExamPageOCMathematicalReasoning.js,
  },
  //{
   // label: "Reading",
   // key: "reading",
    //component: ReadingComponent,
  //},
  
];

const OCDashboard = () => {
  const [activeSubject, setActiveSubject] = useState(null);
  const [examInProgress, setExamInProgress] = useState(false);
  const [examPhase, setExamPhase] = useState("selection");

  const studentId = sessionStorage.getItem("student_id");
  const ActiveComponent = activeSubject?.component;

  const handleSubjectSelect = (subject) => {
    if (examInProgress) {
      alert("Please submit your current exam before switching subjects.");
      return;
    }
    setActiveSubject(subject);
    setExamPhase("welcome");
  };

  return (
    <div className="selective-dashboard">

      {/* 1️⃣ SUBJECT SELECTION */}
      {examPhase === "selection" && (
        <div className="subject-selection-wrapper">

          <img
            src="https://gemkidsacademy.com.au/wp-content/uploads/2024/10/cropped-logo-4-1.png"
            alt="Gem Kids Academy"
            className="dashboard-logo"
          />

          <div className="subject-selection-card">
            <h1 className="dashboard-title">
              OC Placement Practice Test
            </h1>

            <div className="title-divider" />

            <div className="subject-buttons">
              {SUBJECTS.map((subject) => (
                <button
                  key={subject.key}
                  className="subject-button"
                  onClick={() => handleSubjectSelect(subject)}
                >
                  {subject.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2️⃣ WELCOME */}
      {examPhase === "welcome" && (
        <WelcomeScreenOC
          onNext={() => setExamPhase("instructions")}
        />
      )}

      {/* 3️⃣ INSTRUCTIONS */}
      {examPhase === "instructions" && (
        <InstructionsScreenOC
          subject={activeSubject.key}
          onNext={() => setExamPhase("exam")}
        />
      )}

      {/* 4️⃣ EXAM */}
      {examPhase === "exam" && (
        <main className="content-area">
          <div className="exam-root">
            <ActiveComponent
              key={`exam-${activeSubject.key}`} // 🔑 important
              studentId={studentId}
              subject={activeSubject.key}
              difficulty="advanced"
              onExamStart={() => setExamInProgress(true)}
              onExamFinish={() => setExamInProgress(false)}
            />
          </div>
        </main>
      )}

    </div>
  );
};

export default OCDashboard;
