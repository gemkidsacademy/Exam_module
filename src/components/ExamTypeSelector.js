import "./ExamTypeSelector.css";
import UploadWord from "./UploadWord";
import UploadWord_reading from "./UploadWord_reading";
import UploadWord_writing from "./UploadWord_writing";

export default function ExamTypeSelector({ examType, onSelect }) {
  const examOptions = [
    { label: "Thinking Skills Exam", value: "thinkingskills" },
    { label: "Foundational Exam", value: "foundational" },
    { label: "Reading Exam", value: "reading" },
    { label: "Writing Exam", value: "writing" },
  ];

  if (examType === "thinkingskills") return <UploadWord />;
  if (examType === "reading") return <UploadWord_reading />;
  if (examType === "writing") return <UploadWord_writing />;

  return (
    <div className="exam-selector-container">
      <h2 className="exam-selector-title">Select Exam Type</h2>

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
