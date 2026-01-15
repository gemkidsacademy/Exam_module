import "./ExamTypeSelector.css";

import UploadWord from "./UploadWord";
import ReadingUploadPanel from "./ReadingUploadPanel";
import UploadWord_writing from "./UploadWord_writing";
import ThinkingSkillsUploadPanel from "./ThinkingSkillsUploadPanel";


export default function ExamTypeSelector({ examType, onSelect }) {
  // --------------------------------------
  // Exam selection options
  // --------------------------------------
  const examOptions = [
    { label: "Thinking Skills Exam", value: "thinkingskills" },
    { label: "Mathematical Reasoning", value: "mathematical-reasoning" },
    { label: "Reading Exam", value: "reading" },
    { label: "Writing Exam", value: "writing" },
    { label: "Foundational", value: "foundational" }, // ✅ NEW
  ];

  // --------------------------------------
  // Render selected exam panel
  // --------------------------------------
  const renderExamPanel = () => {
    switch (examType) {
      
      case "mathematical-reasoning":
      case "foundational": // ✅ NEW
        return <UploadWord />;

      case "thinkingskills":
        return <UploadWord />;

      case "reading":
        return <ReadingUploadPanel />;

      case "writing":
        return <UploadWord_writing />;

      default:
        return null;
    }
  };

  // --------------------------------------
  // If an exam is selected, render its panel
  // --------------------------------------
  if (examType) {
    return renderExamPanel();
  }

  // --------------------------------------
  // Render exam type selector buttons
  // --------------------------------------
  return (
    <div className="exam-selector-container">
      <div className="exam-selector-grid">
        {examOptions.map((item) => (
          <button
            key={item.value}
            className="exam-selector-card"
            onClick={() => onSelect(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
