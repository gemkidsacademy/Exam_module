import React, { useState } from "react";
import "./SelectiveDashboard.css";

// EXAM COMPONENTS (UNCHANGED)
import ExamPageThinkingSkills from "./ExamPageThinkingSkills";
import ExamPageMathematicalReasoning from "./ExamPageMathematicalReasoning";
import ReadingComponent from "./ReadingComponent";
import ExamPageWriting from "./ExamPageWriting";

import WelcomeScreen from "./WelcomeScreen";
import InstructionsScreen from "./InstructionsScreen";

/*
  SUBJECT CONFIG
  - UI label
  - backend subject key
  - exam component
*/
const SUBJECTS = [
  {
    label: "Thinking Skills",
    key: "thinking_skills",
    component: ExamPageThinkingSkills,
  },
  {
    label: "Mathematical Reasoning",
    key: "mathematical_reasoning",
    component: ExamPageMathematicalReasoning,
  },
  {
    label: "Reading",
    key: "reading",
    component: ReadingComponent,
  },
  {
    label: "Writing",
    key: "writing",
    component: ExamPageWriting,
  },
];

const SelectiveDashboard = () => {
  const [activeSubject, setActiveSubject] = useState(null);
  const [examInProgress, setExamInProgress] = useState(false);
  const [examPhase, setExamPhase] = useState("selection");
  // phases: selection → welcome → instructions → exam

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
      
          {/* ⭐ GEM KIDS ACADEMY LOGO ⭐ */}
          <img
            src="https://gemkidsacademy.com.au/wp-content/uploads/2024/10/cropped-logo-4-1.png"
            alt="Gem Kids Academy"
            className="dashboard-logo"
          />
      
          <div className="subject-selection-card">
            <h1 className="dashboard-title">
              Selective High School Placement Practice Test
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

      {/* 2️⃣ WELCOME SCREEN */}
      {examPhase === "welcome" && (
        <WelcomeScreen
          onNext={() => setExamPhase("instructions")}
        />
      )}

      {/* 3️⃣ INSTRUCTIONS SCREEN */}
      {examPhase === "instructions" && (
        <InstructionsScreen
          subject={activeSubject.key}
          onNext={() => setExamPhase("exam")}
        />
      )}

      {/* 4️⃣ EXAM */}
      {examPhase === "exam" && (
        <main className="content-area">
          <div className="exam-root">
            <ActiveComponent
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

export default SelectiveDashboard;
