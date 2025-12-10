import React, { useState } from "react";
import "./ExamPage.css";
const quiz40 = [
  // Set 1 — Money (1–10)
  { question: "Which extract claims that a positive outcome of the development of ‘money’ was that trade could be done much more quickly?", correct: "C" },
  { question: "Which extract best describes the transition from bartering to currency?", correct: "C" },
  { question: "Which extract uses examples of trade from a prehistoric setting?", correct: "A" },
  { question: "Which extract uses a colloquial term which means distant or remote communities?", correct: "A" },
  { question: "Which extract describes in detail why coins became so popular as a form of currency?", correct: "B" },
  { question: "Which extract lists several definitions of what humans call ‘currency’?", correct: "A" },
  { question: "Which extract explains that an historical event led to the creation of new coins?", correct: "D" },
  { question: "Which extract says that money fosters the practice of exchanging things with others for mutual benefit yet also encourages stratified ranking?", correct: "B" },
  { question: "Which extract explains that money printed by state banks became illegal and this became the responsibility of the federal government?", correct: "D" },
  { question: "Which extract mentions that things not found in large numbers were likely used as a form of currency?", correct: "B" },

  // Set 2 — Birds (11–16)
  { question: "Paragraph 1 – Which option summarises the paragraph?", correct: "F" },
  { question: "Paragraph 2 – Which option summarises the paragraph?", correct: "B" },
  { question: "Paragraph 3 – Which option summarises the paragraph?", correct: "D" },
  { question: "Paragraph 4 – Which option summarises the paragraph?", correct: "A" },
  { question: "Paragraph 5 – Which option summarises the paragraph?", correct: "E" },
  { question: "Paragraph 6 – Which option summarises the paragraph?", correct: "G" },

  // Set 3 — Lord of the Flies (17–26)
  { question: "Which extract describes how characterisation drives plot movement?", correct: "B" },
  { question: "Which extract includes commentary from a secondary source close to the author?", correct: "D" },
  { question: "Which extract employs a third-person omniscient narrator to portray the character’s experience?", correct: "A" },
  { question: "Which extract suggests that a prop in the story brings people to a more advanced stage of civilisation?", correct: "C" },
  { question: "Which extract mentions the arrival of an unexpected character?", correct: "A" },
  { question: "Which extract suggests that William Golding did not jump to conclusions?", correct: "D" },
  { question: "Which extract comments on the psychology of the narrative’s stereotyped adversary?", correct: "B" },
  { question: "Which extract gives key examples of how a motif is utilised throughout a narrative?", correct: "C" },
  { question: "Which extract suggests that one’s born position in life dictates one's fate?", correct: "B" },
  { question: "Which extract discusses a character who returns to the primitive condition of being cruel and uncivilised?", correct: "B" },

  // Set 4 — Gift Wrapping (27–31)
  { question: "Paragraph 1 – Which option summarises the paragraph?", correct: "E" },
  { question: "Paragraph 2 – Which option summarises the paragraph?", correct: "A" },
  { question: "Paragraph 3 – Which option summarises the paragraph?", correct: "G" },
  { question: "Paragraph 4 – Which option summarises the paragraph?", correct: "C" },
  { question: "Paragraph 5 – Which option summarises the paragraph?", correct: "D" },

  // Set 5 — Antarctica (32–37)
  { question: "Paragraph 1 – Which option summarises the paragraph?", correct: "E" },
  { question: "Paragraph 2 – Which option summarises the paragraph?", correct: "G" },
  { question: "Paragraph 3 – Which option summarises the paragraph?", correct: "A" },
  { question: "Paragraph 4 – Which option summarises the paragraph?", correct: "B" },
  { question: "Paragraph 5 – Which option summarises the paragraph?", correct: "F" },
  { question: "Paragraph 6 – Which option summarises the paragraph?", correct: "D" },

  // Set 6 — Memory (38–46)
  { question: "Which extract reports that the timing of an auditory stimulus affects short-term memory?", correct: "B" },
  { question: "Which extract compares a type of memory with digital technology?", correct: "C" },
  { question: "Which extract introduces a deeper analysis linking learning and memory?", correct: "A" },
  { question: "Which extract references the ‘founding father’ of psychoanalysis?", correct: "D" },
  { question: "Which extract suggests that without reaffirming, this type of memory fades?", correct: "B" },
  { question: "Which extract states that dreaming is common to all humans?", correct: "D" },
  { question: "Which extract explains the memory used for automatic physical actions?", correct: "C" },
  { question: "Which extract claims this type of memory is limited by accessibility?", correct: "C" },
  { question: "Which extract says this concept is omnipresent in psychology?", correct: "A" }
];

export default function ReadingComponent() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);

  const current = quiz40[index];

  const handleSelect = (choice) => {
    setAnswers({ ...answers, [index]: choice });
  };

  const score = Object.keys(answers).reduce((acc, i) => {
    return acc + (answers[i] === quiz40[i].correct ? 1 : 0);
  }, 0);

  if (finished) {
    return (
      <div className="completed-screen">
        <h1>Quiz Completed</h1>
        <h2>Your Score: {score} / {quiz40.length}</h2>
      </div>
    );
  }

  return (
    <div className="exam-container">

      {/* HEADER */}
      <div className="exam-header">
        <div>Reading Exam</div>
        <div className="counter">
          Question {index + 1} / {quiz40.length}
        </div>
      </div>

      {/* QUESTION NUMBER CIRCLES */}
      <div className="index-row">
        {quiz40.map((_, i) => (
          <div
            key={i}
            className={
              "index-circle " +
              (answers[i] ? "index-answered" : index === i ? "index-visited" : "")
            }
            onClick={() => setIndex(i)}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* QUESTION CARD */}
      <div className="question-card">
        <p className="question-text">{current.question}</p>

        {["A", "B", "C", "D"].map((opt) => (
          <button
            key={opt}
            className={
              "option-btn " +
              (answers[index] === opt ? "selected" : "")
            }
            onClick={() => handleSelect(opt)}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* NAVIGATION */}
      <div className="nav-buttons">
        <button
          className="nav-btn prev"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          Previous
        </button>

        {index < quiz40.length - 1 ? (
          <button
            className="nav-btn next"
            onClick={() => setIndex(index + 1)}
          >
            Next
          </button>
        ) : (
          <button
            className="nav-btn finish"
            onClick={() => setFinished(true)}
          >
            Finish
          </button>
        )}
      </div>

    </div>
  );
}
