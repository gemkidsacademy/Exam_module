import { useState } from "react";

import UploadWord from "./UploadWord";
import UploadWord_ImageOptions from "./UploadWord_ImageOptions";
import ReadingUploadPanel from "./ReadingUploadPanel";
import UploadWord_writing from "./UploadWord_writing";
import QuestionTypeSelector from "./QuestionTypeSelector";

export default function ExamTypeSelector({ examType, onSelect }) {
  const [questionType, setQuestionType] = useState(null);

  const examOptions = [
    { label: "Thinking Skills Exam", value: "thinkingskills" },
    { label: "Mathematical Reasoning", value: "mathematical-reasoning" },
    { label: "Reading Exam", value: "reading" },
    { label: "Writing Exam", value: "writing" },
    { label: "Foundational", value: "foundational" },
  ];

  const requiresQuestionType = [
    "thinkingskills",
    "mathematical-reasoning",
    "foundational",
  ].includes(examType);

  const renderUploadPanel = () => {
    if (!requiresQuestionType) {
      if (examType === "reading") return <ReadingUploadPanel />;
      if (examType === "writing") return <UploadWord_writing />;
      return null;
    }

    if (!questionType) {
      return <QuestionTypeSelector onSelect={setQuestionType} />;
    }

    if (questionType === "standard") {
      return <UploadWord />;
    }

    if (questionType === "image-options") {
      return <UploadWord_ImageOptions />;
    }

    return null;
  };

  if (examType) {
    return renderUploadPanel();
  }

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
