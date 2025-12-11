import React, { useState } from "react";
import "./ExamPage_reading.css";


/* -------------------------------------------------------
   QUIZ QUESTIONS (same as before)
---------------------------------------------------------*/
const quiz40 = [
  // Money (1–10)
  { question: "Which extract claims that a positive outcome of the development of ‘money’ was that trade could be done much more quickly?", correct: "C" },
  { question: "Which extract best describes the transition from bartering to currency?", correct: "C" },
  { question: "Which extract uses examples of trade from a prehistoric setting?", correct: "A" },
  { question: "Which extract uses a colloquial term which means distant or remote communities?", correct: "A" },
  { question: "Which extract describes in detail why coins became so popular as a form of currency?", correct: "B" },
  { question: "Which extract lists several definitions of what humans call ‘currency’?", correct: "A" },
  { question: "Which extract explains that an historical event led to the creation of new coins?", correct: "D" },
  { question: "Which extract says that money fosters mutual exchange yet also encourages social ranking?", correct: "B" },
  { question: "Which extract explains that money printed by state banks became illegal and federalised?", correct: "D" },
  { question: "Which extract mentions that rare natural objects were likely used as currency?", correct: "B" },

  // Birds (11–16)
  { question: "Paragraph 1 – Which option summarises the paragraph?", correct: "F" },
  { question: "Paragraph 2 – Which option summarises the paragraph?", correct: "B" },
  { question: "Paragraph 3 – Which option summarises the paragraph?", correct: "D" },
  { question: "Paragraph 4 – Which option summarises the paragraph?", correct: "A" },
  { question: "Paragraph 5 – Which option summarises the paragraph?", correct: "E" },
  { question: "Paragraph 6 – Which option summarises the paragraph?", correct: "G" },

  // Lord of the Flies (17–26)
  { question: "Which extract describes how characterisation drives plot movement?", correct: "B" },
  { question: "Which extract includes commentary from a secondary source close to the author?", correct: "D" },
  { question: "Which extract employs a third-person omniscient narrator?", correct: "A" },
  { question: "Which extract suggests that a prop brings civilisation?", correct: "C" },
  { question: "Which extract mentions the arrival of an unexpected character?", correct: "A" },
  { question: "Which extract suggests that Golding did not jump to conclusions?", correct: "D" },
  { question: "Which extract comments on the psychology of the adversary?", correct: "B" },
  { question: "Which extract gives examples of how a motif is used?", correct: "C" },
  { question: "Which extract suggests one’s birth position dictates fate?", correct: "B" },
  { question: "Which extract discusses a character returning to primitive cruelty?", correct: "B" },

  // Gift Wrapping (27–31)
  { question: "Paragraph 1 – Which option summarises the paragraph?", correct: "E" },
  { question: "Paragraph 2 – Which option summarises the paragraph?", correct: "A" },
  { question: "Paragraph 3 – Which option summarises the paragraph?", correct: "G" },
  { question: "Paragraph 4 – Which option summarises the paragraph?", correct: "C" },
  { question: "Paragraph 5 – Which option summarises the paragraph?", correct: "D" },

  // Antarctica (32–37)
  { question: "Paragraph 1 – Which option summarises the paragraph?", correct: "E" },
  { question: "Paragraph 2 – Which option summarises the paragraph?", correct: "G" },
  { question: "Paragraph 3 – Which option summarises the paragraph?", correct: "A" },
  { question: "Paragraph 4 – Which option summarises the paragraph?", correct: "B" },
  { question: "Paragraph 5 – Which option summarises the paragraph?", correct: "F" },
  { question: "Paragraph 6 – Which option summarises the paragraph?", correct: "D" },

  // Memory (38–46)
  { question: "Which extract reports that timing of an auditory stimulus affects short-term memory?", correct: "B" },
  { question: "Which extract compares a type of memory with digital technology?", correct: "C" },
  { question: "Which extract introduces deeper analysis linking learning and memory?", correct: "A" },
  { question: "Which extract references the founding father of psychoanalysis?", correct: "D" },
  { question: "Which extract suggests that this memory fades without reaffirming?", correct: "B" },
  { question: "Which extract states that dreaming is common to all humans?", correct: "D" },
  { question: "Which extract explains memory used for procedural actions?", correct: "C" },
  { question: "Which extract claims this memory is limited by accessibility?", correct: "C" },
  { question: "Which extract says this concept is omnipresent in psychology?", correct: "A" }
];

/* -------------------------------------------------------
   PASSAGES + EXTRACTS WITH QUESTION RANGES
---------------------------------------------------------*/
const readingSets = [
  { id: "money", title: "Money as Currency", instruction: "Read the four extracts...", questionStart: 0, questionEnd: 9, type: "extracts" },
  { id: "birds", title: "Birds – Paragraph Summaries", instruction: "Read the text about birds...", questionStart: 10, questionEnd: 15, type: "passage" },
  { id: "lotf", title: "Lord of the Flies – Comparative Analysis", instruction: "Read the extracts...", questionStart: 16, questionEnd: 25, type: "extracts" },
  { id: "gift", title: "Does Gift Wrapping Matter?", instruction: "Read the text...", questionStart: 26, questionEnd: 30, type: "passage" },
  { id: "antarctica", title: "Antarctica – Paragraph Summaries", instruction: "Read the text...", questionStart: 31, questionEnd: 36, type: "passage" },
  { id: "memory", title: "Memory – Types and Theories", instruction: "Read the extracts...", questionStart: 37, questionEnd: 45, type: "extracts" }
];

/* Helper to find which reading block a question belongs to */
function getReadingSetForQuestion(qIndex) {
  return readingSets.find(
    (set) => qIndex >= set.questionStart && qIndex <= set.questionEnd
  );
}

/* -------------------------------------------------------
   COMPONENT
---------------------------------------------------------*/
export default function ReadingComponent() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [finished, setFinished] = useState(false);

  const currentSet = getReadingSetForQuestion(index);
  const currentQuestion = quiz40[index];

  const handleSelect = (choice) => {
    setAnswers((prev) => ({ ...prev, [index]: choice }));
  };

  const goTo = (i) => {
    setVisited((prev) => ({ ...prev, [i]: true }));
    setIndex(i);
  };

  const score = quiz40.reduce(
    (acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0),
    0
  );

  if (finished) {
    return (
      <div className="completed-screen">
        <h1>Quiz Completed</h1>
        <h2>Your Score: {score} / {quiz40.length}</h2>
      </div>
    );
  }

  /* -------------------------------------------------------
     GROUPED QUESTION INDEX
  ---------------------------------------------------------*/
  const renderGroupedIndex = () => {
    return (
      <div className="index-groups">
        {readingSets.map((set, sIndex) => (
          <div key={set.id} className="index-group">
            <div className="index-group-title">{set.title}</div>

            <div className="index-group-questions">
              {Array.from(
                { length: set.questionEnd - set.questionStart + 1 },
                (_, i) => {
                  const qIndex = set.questionStart + i;
                  const cls =
                    answers[qIndex] ? "index-answered"
                    : visited[qIndex] ? "index-seen"
                    : "";

                  return (
                    <div
                      key={qIndex}
                      className={`index-circle ${cls}`}
                      onClick={() => goTo(qIndex)}
                    >
                      {qIndex + 1}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /* -------------------------------------------------------
     MAIN COMPONENT LAYOUT
  ---------------------------------------------------------*/
  return (
    <div className="exam-container">

      {/* HEADER */}
      <div className="exam-header">
        <div>{currentSet?.title || "Reading Exam"}</div>
        <div className="counter">
          Question {index + 1} / {quiz40.length}
        </div>
      </div>

      {/* GROUPED QUESTION INDEX */}
      {renderGroupedIndex()}

      {/* TWO-PANE LAYOUT */}
      <div className="exam-body">

        {/* LEFT PANE – Reading Material */}
        <div className="passage-pane">
          <h3>{currentSet.title}</h3>
          <p className="passage-instruction">{currentSet.instruction}</p>
          <p className="passage-text">[INSERT READING MATERIAL HERE]</p>
        </div>

        {/* RIGHT PANE – Question */}
        <div className="question-pane">
          <div className="question-card">
            <p className="question-text">{currentQuestion.question}</p>

            {["A", "B", "C", "D"].map((opt) => (
              <button
                key={opt}
                className={`option-btn ${answers[index] === opt ? "selected" : ""}`}
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
              onClick={() => goTo(index - 1)}
            >
              Previous
            </button>

            {index < quiz40.length - 1 ? (
              <button className="nav-btn next" onClick={() => goTo(index + 1)}>
                Next
              </button>
            ) : (
              <button className="nav-btn finish" onClick={() => setFinished(true)}>
                Finish
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
