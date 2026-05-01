import React, { useState, useEffect } from "react";
import "./SelectiveDashboard.css";
import { useLocation } from "react-router-dom";
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
  const [examPhase, setExamPhase] = useState("mode_selection");
  const [examMode, setExamMode] = useState(null);
  const [subjectAvailability, setSubjectAvailability] = useState({});
  const location = useLocation();
  const [reportVariant, setReportVariant] = useState(null);
  const BACKEND_URL = process.env.REACT_APP_API_URL;
  // phases: selection → welcome → instructions → exam

  const studentId = sessionStorage.getItem("student_id");
  
  const ActiveComponent = activeSubject?.component;

  const handleSubjectSelect = (subject) => {
  if (examInProgress) {
    alert("Please submit your current exam before switching subjects.");
    return;
  }

  setActiveSubject(subject);

  if (examMode === "report") {
    setExamPhase("exam"); // go directly to reports
  } else {
    setExamPhase("welcome");
  }
};
  
  const handleStartExam = () => {
  
  setExamPhase("exam");
};

const handleViewResults = () => {
  setExamMode("report");
  setExamPhase("exam");
};
useEffect(() => {
  if (location.state?.tab === "historical") {
    const writingSubject = SUBJECTS.find(
      (item) => item.key === "writing"
    );

    setExamMode("report");
    setActiveSubject(writingSubject);
    setExamPhase("exam");
  }
}, [location.state]);

useEffect(() => {
  if (examPhase === "selection" && studentId && examMode) {
    fetch(`${BACKEND_URL}/api/student/available-subjects?mode=${examMode}&student_id=${studentId}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error("❌ Non-JSON response:", text);
          throw new Error("Failed to fetch availability");
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Availability response:", data);
        setSubjectAvailability(data);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch availability", err);
      });
  }
}, [examPhase, examMode, studentId]);

  return (
    <div className="selective-dashboard">
    {/* 0️⃣ MODE SELECTION */}
{examPhase === "mode_selection" && (
  <div className="subject-selection-wrapper">
    
    <img
      src="https://gemkidsacademy.com.au/wp-content/uploads/2024/10/cropped-logo-4-1.png"
      alt="Gem Kids Academy"
      className="dashboard-logo"
    />

    <div className="subject-selection-card">
      <h1 className="dashboard-title">
        Selective High School Practice Test
      </h1>
      <div className="title-divider" />

      <div className="subject-buttons">
        
        <button
          className="subject-button"
          onClick={() => {
            setExamMode("exam");
            setReportVariant("actual");   // ✅ ADD THIS
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
            setExamPhase("report_type_selection");
          }}
        >
          Historical reports
        </button>
        <button
          className="subject-button"
          onClick={() => {
            setExamMode("exam");
            setReportVariant("homework");
            setExamPhase("selection");
          }}
        >
          Homework
        </button>

      </div>
    </div>
  </div>
)}
{/* 🆕 REPORT TYPE SELECTION */}
{examPhase === "report_type_selection" && (
  <div className="subject-selection-wrapper">
    
    <div className="subject-selection-card">
      <h1 className="dashboard-title">
        Select Report Type
      </h1>
      <div className="title-divider" />

      <div className="subject-buttons">
        
        <button
          className="subject-button"
          onClick={() => {
            setReportVariant("actual");
            setExamPhase("selection");
          }}
        >
          Actual Exam
        </button>

        <button
          className="subject-button"
          onClick={() => {
            setReportVariant("homework");
            setExamPhase("selection");
          }}
        >
          Homework
        </button>

      </div>
    </div>
  </div>
)}
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
              {SUBJECTS.map((subject) => {
                const subjectData = subjectAvailability[subject.key];

                let isEnabled = true;

                  if (examMode === "report") {
                    isEnabled = true;   // ✅ always enabled
                  } else if (typeof subjectData === "object" && subjectData !== null) {
                    isEnabled =
                      examMode === "exam"
                        ? subjectData.exam
                        : subjectData.homework;
                  } else {
                    isEnabled = subjectData ?? true;
                  }

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
          onNext={handleStartExam}          // ✅ updated
          onViewResults={handleViewResults} // ✅ NEW
        />
      )}

      {/* 4️⃣ EXAM */}
      {examPhase === "exam" && examMode !== null && (
        <main className="content-area">
          <div className="exam-root">
            <ActiveComponent
            key={`exam-${activeSubject.key}-${examMode}-${reportVariant}`}  // 🔑 THIS LINE FIXES IT
            type={examMode}
            studentId={studentId}
            subject={activeSubject.key}
            difficulty="advanced"
            mode={examMode} 
            variant={reportVariant}
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
