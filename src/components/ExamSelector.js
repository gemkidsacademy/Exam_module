import React from "react";
import "./ExamSelector.css";

const ExamSelector = ({ onSelect }) => {
  return (
    <div className="exam-selector-container">
      <button
        className="dashboard-button"
        onClick={() => onSelect?.("selective")}
      >
        Selective Exam
      </button>

      <button
        className="dashboard-button"
        onClick={() => onSelect?.("foundational")}
      >
        Foundational Exam
      </button>
    </div>
  );
};

export default ExamSelector;
