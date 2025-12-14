import React from "react";
import GenerateExam from "./GenerateExam";
import GenerateExam_reading from "./GenerateExam_reading";
import GenerateExam_foundational from "./GenerateExam_foundational";
import GenerateExam_writing from "./GenerateExam_writing";
import "./ExamTypeSelectorGenerate.css";

export default function ExamTypeSelector_generate_exam({ examType, onSelect }) {
  const examOptions = [
    { label: "Thinking Skills Exam", value: "thinkingskills" },
    { label: "Foundational Exam", value: "foundational" },
    { label: "Reading Exam", value: "reading" },
    { label: "Writing Exam", value: "writing" },
  ];

  if (examType === "thinkingskills") return <GenerateExam />;
  if (examType === "foundational") return <GenerateExam_foundational />;
  if (examType === "reading") return <GenerateExam_reading />;
  if (examType === "writing") return <GenerateExam_writing />;

  return (
    <div className="exam-generate-selector">
      {examOptions.map((item) => (
        <button
          key={item.value}
          className="exam-generate-button"
          onClick={() => onSelect(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
