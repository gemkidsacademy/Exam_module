import React from "react";
import "./InstructionsScreen.css";

const InstructionsScreen = ({ subject, onNext }) => {
  const subjectLabel = subject
    .replace("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="instructions-wrapper">
      <div className="instructions-card">
        <h1 className="instructions-title">
          Selective High School Placement Practice Test
        </h1>

        <h2 className="instructions-subject">{subjectLabel}</h2>

        <h3 className="instructions-heading">Instructions</h3>

        <ul className="instructions-list">
          <li>You have 40 minutes to complete 40 questions in this test.</li>
          <li>
            For each question there are four possible answers. Choose the one
            correct answer.
          </li>
          <li>
            You will not lose marks for incorrect answers, so you should attempt
            all questions.
          </li>
          <li>Calculators and dictionaries are not allowed.</li>
        </ul>

        <button className="primary-btn" onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  );
};

export default InstructionsScreen;
