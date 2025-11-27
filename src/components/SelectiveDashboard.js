// SelectiveDashboard.js
import React, { useState } from "react";
import "./SelectiveDashboard.css";

const SelectiveDashboard = () => {
  const [activeTab, setActiveTab] = useState("Thinking skills");

  const tabs = ["Thinking skills", "Mathematical reasoning", "Reading", "Writing"];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`tab-item ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="main-content">
        <h2>{activeTab}</h2>
        <p>Content for {activeTab} goes here...</p>
      </div>
    </div>
  );
};

export default SelectiveDashboard;
