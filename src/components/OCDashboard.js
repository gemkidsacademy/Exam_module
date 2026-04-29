import React, { useState, useEffect } from "react";
import "./SelectiveDashboard.css"; // you can reuse same CSS

// EXAM COMPONENTS
import ExamPageOcThinkingSkills from "./ExamPageOcThinkingSkills";
import ExamPageOCMathematicalReasoning from "./ExamPageOCMathematicalReasoning";
import ReadingComponentOC from "./ReadingComponentOC";


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
    component: ExamPageOCMathematicalReasoning,
  },
  {
    label: "Reading",
    key: "reading",
    component: ReadingComponentOC,
  },
  
];

const OCDashboard = () => {
  const [activeSubject, setActiveSubject] = useState(null);
  const [examInProgress, setExamInProgress] = useState(false);
  const [examPhase, setExamPhase] = useState("mode_selection");
  const [examMode, setExamMode] = useState(null);
  const studentId = sessionStorage.getItem("student_id");
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const API_BASE = process.env.REACT_APP_API_URL;
  const [subjectAvailability, setSubjectAvailability] = useState({});
  const ActiveComponent = activeSubject?.component;

  const handleSubjectSelect = (subject) => {
  if (examInProgress) {
    alert("Please submit your current exam before switching subjects.");
    return;
  }

  setActiveSubject(subject);

  if (examMode?.startsWith("report")) {
    setExamPhase("exam"); // skip welcome/instructions
  } else {
    setExamPhase("welcome");
  }
};
useEffect(() => {
  if (examPhase === "selection" && studentId && examMode) {
    const normalizedMode =
      examMode?.includes("homework")
        ? "homework"
        : examMode?.includes("report")
        ? "report"
        : "exam";

    setAvailabilityLoading(true);

    fetch(
      `${API_BASE}/api/student/oc-available-subjects?mode=${normalizedMode}&student_id=${studentId}`
    )
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error("❌ Non-JSON response:", text);
          throw new Error("Failed to fetch availability");
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ OC Availability:", data);
        setSubjectAvailability(data);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch OC availability", err);
      })
      .finally(() => {
        setAvailabilityLoading(false); // 🔥 THIS WAS MISSING
      });
  }
}, [examPhase, examMode, studentId]);
  return (
    <div className="selective-dashboard">
       {/* 0️⃣ MODE SELECTION (ADD HERE) */}
    {examPhase === "mode_selection" && (
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

            <button
              className="subject-button"
              onClick={() => {
                setExamMode("exam");
                setSubjectAvailability({});
                setExamPhase("selection");
              }}
            >
              Active exams
            </button>

            <button
              className="subject-button"
              onClick={() => {
                setExamMode("report");
                setSubjectAvailability({});
                setExamPhase("report_mode_selection");
              }}
            >
              Historical reports
            </button>
            <button
              className="subject-button"
              onClick={() => {
                setExamMode("homework");   // ✅ NEW MODE
                setSubjectAvailability({});
                setExamPhase("selection");
              }}
            >
              Homework exams
            </button>

          </div>
        </div>
      </div>
    )}
    {examPhase === "report_mode_selection" && (
  <div className="subject-selection-wrapper">

    <img
      src="https://gemkidsacademy.com.au/wp-content/uploads/2024/10/cropped-logo-4-1.png"
      alt="Gem Kids Academy"
      className="dashboard-logo"
    />

    <div className="subject-selection-card">
      <h1 className="dashboard-title">
        Select Report Type
      </h1>

      <div className="title-divider" />

      <div className="subject-buttons">

        <button
          className="subject-button"
          onClick={() => {
            setExamMode("report_actual");
            setExamPhase("selection");
          }}
        >
          Actual exams
        </button>

        <button
          className="subject-button"
          onClick={() => {
            setExamMode("report_homework");
            setExamPhase("selection");
          }}
        >
          Homework exams
        </button>

      </div>
    </div>
  </div>
)}
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
              {SUBJECTS.map((subject) => {
                const subjectData = subjectAvailability[subject.key];

                const isEnabled =
                  availabilityLoading
                    ? false
                    : examMode?.startsWith("report")
                    ? true
                    : subjectData
                    ? examMode === "exam"
                      ? subjectData.exam === true
                      : subjectData.homework === true
                    : false;

                return (
                  <button
                    key={subject.key}
                    className={`subject-button ${!isEnabled ? "disabled" : ""}`}
                    disabled={!isEnabled}
                    onClick={() => isEnabled && handleSubjectSelect(subject)}
                  >
                    {subject.label}
                  </button>
                );
              })}
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
      {examPhase === "exam" && examMode !== null && (
        <main className="content-area">
          <div className="exam-root">
            <ActiveComponent
              key={`exam-${activeSubject.key}-${examMode}`}// 🔑 important
              studentId={studentId}
              mode={examMode} 
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
