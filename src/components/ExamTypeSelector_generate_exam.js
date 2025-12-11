import React from "react";
import UploadWord from "./UploadWord";
import UploadWord_reading from "./UploadWord_reading";

export default function ExamTypeSelector_generate_exam({ examType, onSelect }) {
  const examOptions = [
    { label: "Thinking Skills Exam", value: "thinkingskills" },
    { label: "Foundational Exam", value: "foundational" },
    { label: "Reading Exam", value: "reading" },
    { label: "Writing Exam", value: "writing" },
  ];

  // → If Thinking Skills selected → render UploadWord
  if (examType === "thinkingskills") {
    return <UploadWord />;
  }

  // → If Reading selected → render UploadWord_reading
  if (examType === "reading") {
    return <UploadWord_reading />;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        maxWidth: "350px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      {examOptions.map((item) => (
        <button
          key={item.value}
          onClick={() => onSelect(item.value)}
          style={{
            padding: "14px 20px",
            background: "#f8f9fa",
            border: "1px solid #ddd",
            borderRadius: "10px",
            fontSize: "18px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "0.2s",
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
