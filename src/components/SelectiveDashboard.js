import React, { useState } from "react";
import "./SelectiveDashboard.css";

const SelectiveDashboard = () => {
  const [activeTab, setActiveTab] = useState("Thinking skills");

  const tabs = ["Thinking skills", "Mathematical reasoning", "Reading", "Writing"];

  return (
    <div className="selective-dashboard">
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

      {/* Content area */}
      <div className="content-area">
        <h2>{activeTab}</h2>
        <p>Here you can add all components or actions related to <strong>{activeTab}</strong>.</p>
      </div>
    </div>
  );
};

export default SelectiveDashboard;
