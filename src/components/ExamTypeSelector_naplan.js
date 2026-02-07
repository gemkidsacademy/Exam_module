import React from "react";
import "./ExamTypeSelector_naplan.css";

const ExamTypeSelector_naplan = ({ onSelect }) => {
  return (
    <div className="exam-selector-container">
      <button
        className="dashboard-button"
        onClick={() => onSelect("naplan_numeracy")}
      >
        Numeracy
      </button>

      <button
        className="dashboard-button"
        onClick={() => onSelect("naplan_language_conventions")}
      >
        Language Conventions
      </button>
    </div>
  );
};

export default ExamTypeSelector_naplan;
