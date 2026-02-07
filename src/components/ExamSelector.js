import React, { useState } from "react";
import "./ExamSelector.css";
import ExamTypeSelector from "./ExamTypeSelector";
import ExamTypeSelector_naplan from "./ExamTypeSelector_naplan";

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

      {selectedCategory === "foundational" && (
        <ExamTypeSelector_naplan
          examType={examType}
          onSelect={onSelect}
        />
      )}
    </div>
  );
};

export default ExamSelector;
