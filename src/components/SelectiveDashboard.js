import React, { useState } from "react";
import "./SelectiveDashboard.css";

const SelectiveDashboard = () => {
  const [activeTab, setActiveTab] = useState("Thinking skills");

  const tabs = ["Thinking skills", "Mathematical reasoning", "Reading", "Writing"];

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
        <p>
          Quiz will be available here once generated 
        </p>
      </main>
    </div>
  );
};

export default SelectiveDashboard;
