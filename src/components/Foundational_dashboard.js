import React, { useState } from "react";
import "./SelectiveDashboard.css";

// EXAM COMPONENT
import ExamPageFoundational from "./ExamPageFoundational";

// SCREENS
import WelcomeScreen from "./WelcomeScreen";
import InstructionsScreen from "./InstructionsScreen";

const FoundationalDashboard = () => {
  const [examPhase, setExamPhase] = useState("selection");
  // phases: selection → welcome → instructions → exam

  const studentId = sessionStorage.getItem("student_id");

  return (
    <div className="selective-dashboard">

      {/* 1️⃣ ENTRY / SELECTION (SINGLE EXAM) */}
      {examPhase === "selection" && (
        <div className="subject-selection-wrapper">

          <img
            src="https://gemkidsacademy.com.au/wp-content/uploads/2024/10/cropped-logo-4-1.png"
            alt="Gem Kids Academy"
            className="dashboard-logo"
          />

          <div className="subject-selection-card">
            <h1 className="dashboard-title">
              Foundational Practice Test
            </h1>
            <div className="title-divider" />

            <button
              className="subject-button"
              onClick={() => setExamPhase("welcome")}
            >
              Start Foundational Exam
            </button>
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
          subject="mathematical_reasoning"
          onNext={() => setExamPhase("exam")}
        />
      )}

      {/* 4️⃣ EXAM */}
      {examPhase === "exam" && (
        <main className="content-area">
          <div className="exam-root">
            <ExamPageFoundational
              studentId={studentId}
              subject="mathematical_reasoning"
              difficulty="foundational"
            />
          </div>
        </main>
      )}

    </div>
  );
};

export default FoundationalDashboard;
