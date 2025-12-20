import React, { useState } from "react";
import "./SelectiveDashboard.css";

// IMPORT COMPONENT
import ExamPageFoundational from "./ExamPageFoundational";
import WelcomeScreen from "./WelcomeScreen";

const Foundational_dashboard = () => {
  const [activeTab, setActiveTab] = useState(null);

  const studentId = sessionStorage.getItem("student_id");

  // Only one allowed tab
  const tabs = ["Foundational"];

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
        {activeTab === "Foundational" ? (
          <div className="exam-root">
            <ExamPageFoundational
              studentId={studentId}
              subject="mathematical_reasoning"
              difficulty="foundational"
            />
          </div>
        ) : (
          <WelcomeScreen />
        )}
      </main>

    </div>
  );
};

export default Foundational_dashboard;
