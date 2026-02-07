import React, { useState } from "react";
import "./ExamSelector.css";
import ExamTypeSelector from "./ExamTypeSelector";

const ExamSelector = ({ examType, onSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="exam-selector-container">
      {!selectedCategory && (
        <>
          <button
            className="dashboard-button"
            onClick={() => setSelectedCategory("selective")}
          >
            Selective Exam
          </button>

          <button
            className="dashboard-button"
            onClick={() => setSelectedCategory("foundational")}
          >
            NAPLAN
          </button>
        </>
      )}

      {selectedCategory === "selective" && (
        <ExamTypeSelector
          examType={examType}
          onSelect={onSelect}
        />
      )}
    </div>
  );
};

export default ExamSelector;
