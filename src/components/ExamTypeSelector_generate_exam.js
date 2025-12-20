import React from "react";
import GenerateExam from "./GenerateExam";
import GenerateExam_reading from "./GenerateExam_reading";
import GenerateExam_math_reasoning from "./GenerateExam_math_reasoning";
import GenerateExam_writing from "./GenerateExam_writing";
import "./ExamTypeSelectorGenerate.css";

export default function ExamTypeSelector_generate_exam({ examType, onSelect }) {
  const examOptions = [
    { label: "Thinking Skills Exam", value: "thinkingskills" },
    { label: "Mathematical Reasoning Exam", value: "math_reasoning" },
    { label: "Reading Exam", value: "reading" },
    { label: "Writing Exam", value: "writing" },
  ];

  if (examType === "thinkingskills") return <GenerateExam />;
  if (examType === "math_reasoning") return <GenerateExam_math_reasoning />;
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
