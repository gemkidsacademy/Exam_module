import React from "react";
import "./WelcomeScreen.css";

const WelcomeScreen = ({ onNext }) => {
  // This can later come from backend/session
  const accessCode = ["X", "M", "M", "K", "B", "W", "L", "X"];

  return (
    <div className="welcome-wrapper">
      <div className="welcome-card">
        <h1 className="welcome-title">Welcome</h1>

        <p className="welcome-text">
          In the online practice tests, a student access code has been
          automatically generated for you. On test day, students will be
          required to enter the student access code that is on their Test
          Admission Ticket (TAT).
        </p>

        <div className="access-code">
          {accessCode.map((char, index) => (
            <span key={index} className="access-code-box">
              {char}
            </span>
          ))}
        </div>

        <button className="primary-btn" onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
