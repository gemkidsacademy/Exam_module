import React, { useState } from "react";
import "./SelectiveDashboard.css";

// IMPORT COMPONENTS
import ExamPageThinkingSkills from "./ExamPageThinkingSkills";
import ExamPageMathematicalReasoning from "./ExamPageMathematicalReasoning";
import ReadingComponent from "./ReadingComponent";
import ExamPageWriting from "./ExamPageWriting";

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

  const studentId = sessionStorage.getItem("student_id");
  const ActiveComponent = activeSubject?.component;

  const handleSubjectClick = (subject) => {
    if (examInProgress) {
      alert("Please submit your current exam before switching subjects.");
      return;
    }
    setActiveSubject(subject);
  };

  return (
    <div className="selective-dashboard">
      {!activeSubject ? (
        /* SUBJECT SELECTION SCREEN */
        <div className="subject-selection">
          <h1 className="dashboard-title">
            Selective High School Placement Practice Test
          </h1>

          <div className="subject-buttons">
            {SUBJECTS.map((subject) => (
              <button
                key={subject.key}
                className="subject-button"
                onClick={() => handleSubjectClick(subject)}
              >
                {subject.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* EXAM SCREEN */
        <main className="content-area">
          <div className="exam-root">
            <ActiveComponent
              studentId={studentId}
              subject={activeSubject.key}
              difficulty="advanced"
              onExamStart={() => setExamInProgress(true)}
              onExamFinish={() => {
                setExamInProgress(false);
                setActiveSubject(null);
              }}
            />
          </div>
        </main>
      )}
    </div>
  );
};

export default SelectiveDashboard;
