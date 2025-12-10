import React, { useState } from "react";

/* -------------------------------------------------------
   FULL 40-QUESTION QUIZ (parsed from your Word document)
---------------------------------------------------------*/

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

/* -------------------------------------------------------
   QUIZ COMPONENT
---------------------------------------------------------*/

export default function ReadingComponent() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);

  const current = quiz40[index];

  const handleSelect = (choice) => {
    setAnswers({ ...answers, [index]: choice });
  };

  const calculateScore = () => {
    let score = 0;
    quiz40.forEach((q, i) => {
      if (answers[i] === q.correct) score++;
    });
    return score;
  };

  if (finished) {
    const score = calculateScore();
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
        <h1>Quiz Completed</h1>
        <h2>Your Score: {score} / {quiz40.length}</h2>

        <h3>Review:</h3>
        <ul>
          {quiz40.map((q, i) => (
            <li key={i} style={{ marginBottom: 10 }}>
              <strong>Q{i + 1}:</strong> {q.question}
              <br />
              Your answer: {answers[i] || "None"}
              <br />
              Correct answer: {q.correct}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
      <h2>Reading Comprehension – 40 Question Quiz</h2>

      <h3>Question {index + 1} / {quiz40.length}</h3>
      <p style={{ fontSize: "1.2rem" }}>{current.question}</p>

      {/* Options A–D */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {["A", "B", "C", "D"].map((opt) => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            style={{
              padding: "12px 15px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: answers[index] === opt ? "#4caf50" : "white",
              color: answers[index] === opt ? "white" : "black",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "1rem"
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button
          onClick={() => setIndex((i) => i - 1)}
          disabled={index === 0}
        >
          Previous
        </button>

        {index < quiz40.length - 1 ? (
          <button onClick={() => setIndex((i) => i + 1)}>
            Next
          </button>
        ) : (
          <button onClick={() => setFinished(true)}>
            Finish Quiz
          </button>
        )}
      </div>
    </div>
  );
}
