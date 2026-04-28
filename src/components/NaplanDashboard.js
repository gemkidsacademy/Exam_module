import React, { useState } from "react";
import { useEffect } from "react";
import "./NaplanDashboard.css";

// NAPLAN EXAM COMPONENTS
import NaplanNumeracy from "./NaplanNumeracy";
import NaplanLanguageConventions from "./NaplanLanguageConventions";
import NaplanReading from "./NaplanReading";
//import NaplanWriting from "./NaplanWriting";

// SHARED SCREENS
import WelcomeScreen from "./WelcomeScreen";
import InstructionsScreen_naplan from "./InstructionsScreen_naplan";
const API_BASE = process.env.REACT_APP_API_URL;


/*
  NAPLAN SUBJECT CONFIG
  - UI label
  - backend subject key
  - exam component
*/
const SUBJECTS = [
  {
    label: "Numeracy",
    key: "numeracy",
    component: NaplanNumeracy,
  },
  {
    label: "Language Conventions",
    key: "language_conventions",
    component: NaplanLanguageConventions,
  },

  
   {
     label: "Reading",
     key: "reading",
     component: NaplanReading,
   },
  // Temporarily disabled
  // {
  //   label: "Writing",
  //   key: "writing",
  //   component: NaplanWriting,
  // },
];

const NaplanDashboard = () => {
  const [activeSubject, setActiveSubject] = useState(null);
  const [examInProgress, setExamInProgress] = useState(false);
  const [examPhase, setExamPhase] = useState("modeSelection"); 
  const [reportVariant, setReportVariant] = useState(null);
  const [subjectAvailability, setSubjectAvailability] = useState({});
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [examMode, setExamMode] = useState(null); // 🔥 NEW
  // phases: selection → welcome → instructions → exam

  const studentId = sessionStorage.getItem("student_id");
  const ActiveComponent = activeSubject?.component;
  
  useEffect(() => {
  if (examPhase !== "selection") return;
  if (!studentId) return;

  setSubjectAvailability({}); // reset stale data

  const fetchAvailabilityNaplan = async () => {
  try {
    setIsLoadingAvailability(true);

    const res = await fetch(
      `${API_BASE}/api/student/available-subjects-naplan?student_id=${studentId}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch availability");
    }

    const data = await res.json();
    setSubjectAvailability(data);
  } catch (err) {
    console.error("Failed to fetch subject availability", err);
  } finally {
    setIsLoadingAvailability(false);
  }

  };

  fetchAvailabilityNaplan();
}, [examPhase, studentId]);

  const handleSubjectSelect = (subject) => {
  if (examInProgress) {
    alert("Please submit your current exam before switching subjects.");
    return;
  }

  setActiveSubject(subject);

  if (examMode === "exam" || examMode === "homework") {
    setExamPhase("welcome");
  } else if (examMode === "report") {
    setExamPhase("exam");
  }
};

  return (
    <div className="naplan-dashboard">
    {/* 🆕 0️⃣ MODE SELECTION (ADD HERE) */}
    {examPhase === "modeSelection" && (
      <div className="subject-selection-wrapper">

        <img
          src="https://gemkidsacademy.com.au/wp-content/uploads/2024/10/cropped-logo-4-1.png"
          alt="Gem Kids Academy"
          className="dashboard-logo"
        />

        <div className="subject-selection-card">
          <h1 className="dashboard-title">
            NAPLAN Practice Test
          </h1>
          <div className="title-divider" />

          <div className="subject-buttons">

            <button
              className="subject-button"
              onClick={() => {
                setExamMode("exam");
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
                setExamMode("homework");
                setExamPhase("selection");
              }}
            >
              Homework Exams
            </button>

          </div>
        </div>
      </div>
    )}
      {examPhase === "report_type_selection" && (
  <div className="subject-selection-wrapper">

    <div className="subject-selection-card">
      <h1 className="dashboard-title">
        Select Report Type
      </h1>

      <div className="subject-buttons">

        <button
          className="subject-button"
          onClick={() => {
            setReportVariant("actual");
            setExamPhase("selection");
          }}
        >
          Actual Exams
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

          <img
            src="https://gemkidsacademy.com.au/wp-content/uploads/2024/10/cropped-logo-4-1.png"
            alt="Gem Kids Academy"
            className="dashboard-logo"
          />

          <div className="subject-selection-card">
            <h1 className="dashboard-title">
              NAPLAN Practice Test
            </h1>
            <div className="title-divider" />

            <div className="subject-buttons">
              {SUBJECTS.map((subject) => {
                const subjectData = subjectAvailability[subject.key];

                let isEnabled = true;

                if (subjectData) {
                  if (examMode === "exam") {
                    isEnabled = subjectData.exam;
                  } else if (examMode === "homework") {
                    isEnabled = subjectData.homework;
                  } else if (examMode === "report") {
                    isEnabled = true;
                  }
                }

                const isDisabled = isLoadingAvailability || isEnabled === false;

                return (
                  <button
                    key={subject.key}
                    className="subject-button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && handleSubjectSelect(subject)}
                    style={{
                      opacity: isDisabled ? 0.5 : 1,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                    }}
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
        <InstructionsScreen_naplan
          subject={activeSubject.key}
          onNext={() => setExamPhase("exam")}
        />
      )}

      {/* 4️⃣ EXAM */}
        {examPhase === "exam" && (
        <div className="exam-fullscreen-root exam-mode">
          <ActiveComponent
            key={`naplan-${activeSubject.key}-${examMode}-${reportVariant}`}
            studentId={studentId}
            subject={activeSubject.key}
            difficulty="naplan"
            mode={examMode === "report" ? reportVariant : examMode}
            onExamStart={() => setExamInProgress(true)}
            onExamFinish={() => setExamInProgress(false)}
          />
        </div>
      )}

        

    </div>
  );
};

export default NaplanDashboard;
