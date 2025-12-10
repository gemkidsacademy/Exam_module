import React, { useState } from "react";
import "./ExamPage.css";

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
  { question: "Which extract employs a third-person omniscient narrator to portray the character’s experience?", correct: "A" },
  { question: "Which extract suggests that a prop in the story brings people to a more advanced stage of civilisation?", correct: "C" },
  { question: "Which extract mentions the arrival of an unexpected character?", correct: "A" },
  { question: "Which extract suggests that William Golding did not jump to conclusions?", correct: "D" },
  { question: "Which extract comments on the psychology of the narrative’s stereotyped adversary?", correct: "B" },
  { question: "Which extract gives key examples of how a motif is used in a narrative?", correct: "C" },
  { question: "Which extract suggests that one’s birth position dictates fate?", correct: "B" },
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
   PASSAGES + EXTRACTS
---------------------------------------------------------*/
const readingSets = [
  {
    id: "money",
    title: "Money as Currency",
    instruction:
      "Read the four extracts on the topic of Money as Currency. For each question, choose A, B, C, or D.",
    questionStart: 0,
    questionEnd: 9,
    type: "extracts",
    extracts: {
      A: "Sometimes you come across a grimy, tattered dollar bill ... FULL TEXT HERE",
      B: "There are many theories about how money emerged ... FULL TEXT HERE",
      C: "Money has been part of human history for at least 3,000 years ... FULL TEXT HERE",
      D: "The first official Australian banknotes were produced ... FULL TEXT HERE"
    }
  },

  {
    id: "birds",
    title: "Birds – Paragraph Summaries",
    instruction:
      "Read the text about birds. For each paragraph, choose the option (A–G) which best summarises it.",
    questionStart: 10,
    questionEnd: 15,
    type: "passage",
    passage: `
Paragraph 1:
Birds live in almost every part of the world. Many species migrate long distances each year...

Paragraph 2:
Scientists believe that modern birds evolved from reptiles millions of years ago...

Paragraph 3:
Young birds have feathers that differ in colour and pattern, helping protect them...

Paragraph 4:
Some birds fly exceptionally well while others cannot fly at all...

Paragraph 5:
Birds have extraordinary eyesight, much sharper than humans...

Paragraph 6:
Bird species follow breeding cycles that involve nesting, egg-laying, and caring for young...
`
  },

  {
    id: "lotf",
    title: "Lord of the Flies – Comparative Analysis",
    instruction:
      "Read the four extracts related to Lord of the Flies. For each question, choose A, B, C, or D.",
    questionStart: 16,
    questionEnd: 25,
    type: "extracts",
    extracts: {
      A: "FULL TEXT FOR Extract A",
      B: "FULL TEXT FOR Extract B",
      C: "FULL TEXT FOR Extract C",
      D: "FULL TEXT FOR Extract D"
    }
  },

  {
    id: "gift",
    title: "Does Gift Wrapping Matter?",
    instruction:
      "Read the text about gift wrapping. For each paragraph question, choose the option (A–G) which best summarises it.",
    questionStart: 26,
    questionEnd: 30,
    type: "passage",
    passage: `
Paragraph 1 ... FULL TEXT
Paragraph 2 ... FULL TEXT
Paragraph 3 ... FULL TEXT
Paragraph 4 ... FULL TEXT
Paragraph 5 ... FULL TEXT
`
  },

  {
    id: "antarctica",
    title: "Antarctica – Paragraph Summaries",
    instruction:
      "Read the text about Antarctica. For each paragraph, choose the option (A–G) which best summarises it.",
    questionStart: 31,
    questionEnd: 36,
    type: "passage",
    passage: `
Paragraph 1 ... FULL TEXT
Paragraph 2 ... FULL TEXT
Paragraph 3 ... FULL TEXT
Paragraph 4 ... FULL TEXT
Paragraph 5 ... FULL TEXT
Paragraph 6 ... FULL TEXT
`
  },

  {
    id: "memory",
    title: "Memory – Different Types and Theories",
    instruction:
      "Read the four extracts on the topic of memory. For each question, choose A, B, C, or D.",
    questionStart: 37,
    questionEnd: 45,
    type: "extracts",
    extracts: {
      A: "FULL TEXT MEMORY A",
      B: "FULL TEXT MEMORY B",
      C: "FULL TEXT MEMORY C",
      D: "FULL TEXT MEMORY D"
    }
  }
];

/* Helper to find extract group */
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
  const [visited, setVisited] = useState({});       // ✅ NEW
  const [finished, setFinished] = useState(false);

  const currentSet = getReadingSetForQuestion(index);
  const currentQuestion = quiz40[index];

  const handleSelect = (choice) => {
    setAnswers((prev) => ({ ...prev, [index]: choice }));
  };

  const score = quiz40.reduce(
    (acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0),
    0
  );

  // ---------------------------------------------------
  // When the student navigates, mark the question visited
  // ---------------------------------------------------
  const goToQuestion = (i) => {
    setVisited((prev) => ({ ...prev, [i]: true }));
    setIndex(i);
  };

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
        <div>{currentSet?.title || "Reading Exam"}</div>
        <div className="counter">Question {index + 1} / {quiz40.length}</div>
      </div>

      {/* INDEX BAR */}
      <div className="index-row">
        {quiz40.map((_, i) => {
          const cls =
            answers[i] ? "index-answered"
            : visited[i] ? "index-seen"
            : "";

          return (
            <div
              key={i}
              className={`index-circle ${cls}`}
              onClick={() => goToQuestion(i)}
            >
              {i + 1}
            </div>
          );
        })}
      </div>

      {/* TWO-PANE LAYOUT */}
      <div className="exam-body">

        {/* LEFT: PASSAGES */}
        <div className="passage-pane">
          {currentSet && (
            <>
              <h3 className="passage-title">{currentSet.title}</h3>
              <p className="passage-instruction">{currentSet.instruction}</p>

              {currentSet.type === "extracts" &&
                Object.entries(currentSet.extracts).map(([label, text]) => (
                  <div className="extract-block" key={label}>
                    <h4>Extract {label}</h4>
                    <p className="passage-text">{text}</p>
                  </div>
                ))}

              {currentSet.type === "passage" && (
                <div className="extract-block">
                  <p className="passage-text">{currentSet.passage}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT: QUESTION */}
        <div className="question-pane">
          <div className="question-card">
            <p className="question-text">{currentQuestion.question}</p>

            {["A", "B", "C", "D"].map((opt) => (
              <button
                key={opt}
                className={`option-btn ${
                  answers[index] === opt ? "selected" : ""
                }`}
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* NAV */}
          <div className="nav-buttons">
            <button
              className="nav-btn prev"
              disabled={index === 0}
              onClick={() => goToQuestion(index - 1)}
            >
              Previous
            </button>

            {index < quiz40.length - 1 ? (
              <button
                className="nav-btn next"
                onClick={() => goToQuestion(index + 1)}
              >
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
