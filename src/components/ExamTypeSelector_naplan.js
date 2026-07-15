import React from "react";
import "./ExamTypeSelector_naplan.css";

const ExamTypeSelector_naplan = ({ examType, onSelect }) => {
  console.log("ExamTypeSelector_naplan rendered");
  console.log("examType:", examType);

  // If an exam type has already been selected, don't show the buttons
  if (examType) {
    return null;
  }

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

      <button
        className="dashboard-button"
        onClick={() => onSelect("naplan_reading")}
      >
        Reading
      </button>

      <button
        className="dashboard-button"
        onClick={() => onSelect("naplan_writing")}
      >
        Writing
      </button>
    </div>
  );
};

export default ExamTypeSelector_naplan;