import React from "react";
import "./InstructionsScreen.css";

/*
  Subject-specific instructions
  Keys MUST match backend subject keys
*/
const INSTRUCTIONS_BY_SUBJECT = {
  thinking_skills: [
    "You have 40 minutes to complete 40 questions.",
    "Some questions may include diagrams or patterns.",
    "Choose the option that best completes the pattern or sequence.",
    "Calculators and dictionaries are not allowed.",
  ],

  mathematical_reasoning: [
    "You have 40 minutes to complete 40 questions.",
    "Each question tests numerical and logical reasoning.",
    "Rough working may be done on the provided paper.",
    "Calculators are not allowed.",
  ],

  reading: [
    "You will read several passages in this test.",
    "Answer each question based only on the information in the passage.",
    "Some questions may require comparing information across texts.",
    "You have 40 minutes to complete this section.",
  ],

  writing: [
    "This test assesses spelling, grammar, and written expression.",
    "Read each question carefully before answering.",
    "Some questions require selecting the best sentence or word choice.",
    "You have 40 minutes to complete this test.",
  ],
};

const DEFAULT_INSTRUCTIONS = [
  "You have 40 minutes to complete this test.",
  "Read each question carefully before answering.",
];

const InstructionsScreen = ({ subject, onNext }) => {
  const subjectLabel = subject
    .replace("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const instructions =
    INSTRUCTIONS_BY_SUBJECT[subject] || DEFAULT_INSTRUCTIONS;

  return (
    <div className="instructions-wrapper">
      <div className="instructions-card">
        <h1 className="instructions-title">
          Selective High School Placement Practice Test
        </h1>

        <h2 className="instructions-subject">{subjectLabel}</h2>

        <h3 className="instructions-heading">Instructions</h3>

        <ul className="instructions-list">
          {instructions.map((text, index) => (
            <li key={index}>{text}</li>
          ))}
        </ul>

        <button className="primary-btn" onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  );
};

export default InstructionsScreen;
