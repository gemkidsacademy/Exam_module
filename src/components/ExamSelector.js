import React, { useState } from "react";
import "./ExamSelector.css";
import ExamTypeSelector from "./ExamTypeSelector";

const ExamSelector = ({ onSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSelectiveClick = () => {
    setSelectedCategory("selective");
    onSelect?.("selective"); // optional, keeps parent in sync
  };

  const handleFoundationalClick = () => {
    setSelectedCategory("foundational");
    onSelect?.("foundational");
  };

  return (
    <div className="exam-selector-container">
      {/* STEP 1: CATEGORY BUTTONS */}
      {!selectedCategory && (
        <>
          <button
            className="dashboard-button"
            onClick={handleSelectiveClick}
          >
            Selective Exam
          </button>

          <button
            className="dashboard-button"
            onClick={handleFoundationalClick}
          >
            NAPLAN
          </button>
        </>
      )}

      {/* STEP 2: SHOW EXAM TYPE SELECTOR */}
      {selectedCategory === "selective" && (
        <ExamTypeSelector />
      )}
    </div>
  );
};

export default ExamSelector;
