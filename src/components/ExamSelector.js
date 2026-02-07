import React, { useState } from "react";
import "./ExamSelector.css";
import ExamTypeSelector from "./ExamTypeSelector";

const ExamSelector = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="exam-selector-container">
      {/* STEP 1: CATEGORY BUTTONS */}
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

      {/* STEP 2: SHOW EXAM TYPE SELECTOR */}
      {selectedCategory === "selective" && (
        <ExamTypeSelector />
      )}
    </div>
  );
};

export default ExamSelector;
