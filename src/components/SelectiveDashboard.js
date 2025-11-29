import React, { useState, useEffect } from "react";
import "./SelectiveDashboard.css";

const SUBJECT_KEY_MAP = {
  "Thinking skills": "thinking_skills",
  "Mathematical reasoning": "mathematical_reasoning",
  "Reading": "reading",
  "Writing": "writing"
};

const SelectiveDashboard = () => {
  const [activeTab, setActiveTab] = useState("Thinking skills");
  const [examData, setExamData] = useState(null);
  const studentId = sessionStorage.getItem("student_id"); // or however you store it

  const tabs = ["Thinking skills", "Mathematical reasoning", "Reading", "Writing"];

  useEffect(() => {
    const fetchExamStatus = async () => {
      const subjectKey = SUBJECT_KEY_MAP[activeTab];

      try {
        const res = await fetch(
          `https://web-production-481a5.up.railway.app/api/student/exam-status?student_id=${studentId}&subject=${subjectKey}`
        );

        if (!res.ok) {
          setExamData(null);
          return;
        }

        const data = await res.json();
        setExamData(data);

      } catch (err) {
        console.error(err);
        setExamData(null);
      }
    };

    fetchExamStatus();
  }, [activeTab]);

  return (
    <div className="selective-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`tab-item ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </aside>

      {/* Content area */}
      <main className="content-area">
        <h2>{activeTab}</h2>

        {!examData ? (
          <p>Loading exam information...</p>
        ) : (
          <div className="quiz-card">
            <div className="quiz-header">
              <h3 className="quiz-title">NSW Selective {activeTab} Test - Free Trial 1</h3>
            </div>
          
            <div className="quiz-meta-row">
              <span className="difficulty-pill">Advanced Level</span>
              <span className="attempts-pill">Attempts: {examData.attempts_used} / {examData.attempts_allowed}</span>
            </div>
          
            <div className="questions-row">
              <span className="questions-icon">📘</span>
              <span className="questions-text">{examData.total_questions} Questions</span>
            </div>
          
            <div className="quiz-buttons">
              <button className="results-btn">Results</button>
          
              {examData.started && !examData.completed ? (
                <button className="resume-btn">Resume</button>
              ) : (
                <button className="start-btn">Start Quiz</button>
              )}
            </div>
          </div>

        )}
      </main>
    </div>
  );
};

export default SelectiveDashboard;
