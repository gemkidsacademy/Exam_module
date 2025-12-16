import "./ExamTypeSelector.css";
import UploadWord from "./UploadWord";
import UploadWord_reading from "./UploadWord_reading";
import UploadWord_writing from "./UploadWord_writing";
import ReadingUploadPanel from "./ReadingUploadPanel";


export default function ExamTypeSelector({ examType, onSelect }) {
  const examOptions = [
    { label: "Thinking Skills Exam", value: "thinkingskills" },
    { label: "Foundational Exam", value: "foundational" },
    { label: "Reading Exam", value: "reading" },
    { label: "Writing Exam", value: "writing" },
  ];

  if (examType === "thinkingskills") return <UploadWord />;
  if (examType === "reading") return <ReadingUploadPanel />;
  if (examType === "writing") return <UploadWord_writing />;

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
