import React from "react";
import "./InstructionsScreen.css";

/*
  Subject-specific instructions
  Keys MUST match backend subject keys
*/
const INSTRUCTIONS_BY_SUBJECT = {
  thinking_skills: [
  "Please read these instructions carefully.",
  "You have 40 minutes to complete 40 questions in this test.",
  "For each question there are four possible answers. Choose the one correct answer.",
  "You will not lose marks for incorrect answers, so you should attempt all questions.",
  "Calculators and dictionaries are not allowed.",
],
  mathematical_reasoning: [
  "Please read these instructions carefully.",
  "You have 40 minutes to complete 35 questions in this test.",
  "For each question there are five possible answers. Choose the one correct answer.",
  "You will not lose marks for incorrect answers, so you should attempt all questions.",
  "Calculators and dictionaries are not allowed.",
],

  reading: [
  "Please read these instructions carefully.",
  "You have 45 minutes to complete 17 questions in this test.",
  "For Questions 1–8, choose one correct answer to each question.",
  "For Question 9, choose the eight correct answers.",
  "For Questions 10–15, choose one correct answer to each question.",
  "For Question 16, choose the six correct answers.",
  "For Question 17, choose the ten correct answers.",
  "You will not lose marks for incorrect answers, so you should attempt all questions.",
  "Some words and phrases are in bold in the texts as they are referred to in some questions.",
  "Calculators and dictionaries are not allowed.",
],


  writing: [
  "Please read these instructions carefully.",
  "You have 30 minutes to complete this test.",
  "This test contains one writing task.",
  "The task provides an opportunity for you to show how well you can choose, develop, and organise ideas and communicate them effectively in writing.",
  "Before you begin writing, take time to think carefully about what you need to say and how the organisation and layout of your response might help express your message.",
  "You will receive a higher mark if you produce an original and engaging response to the writing task.",
  "You will receive a lower mark if your writing does not address the topic outlined in the writing task.",
  "Calculators and dictionaries are not allowed.",
  "This test will not be marked.",
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

    {/* ⭐ GEM KIDS ACADEMY LOGO ⭐ */}
    <img
      src="https://gemkidsacademy.com.au/wp-content/uploads/2024/10/cropped-logo-4-1.png"
      alt="Gem Kids Academy"
      className="dashboard-logo"
    />

    <div className="instructions-card">
      <h1 className="instructions-title">
        Naplan High School Placement Practice Test
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
