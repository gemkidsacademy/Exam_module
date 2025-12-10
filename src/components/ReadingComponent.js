import React, { useState } from "react";
import "./ExamPage.css";

/* -------------------------------------------------------
   QUIZ QUESTIONS (same as before)
---------------------------------------------------------*/
const quiz40 = [
  // Set 1 — Money (1–10)  indexes 0–9
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

  // Set 2 — Birds (11–16)  indexes 10–15
  { question: "Paragraph 1 – Which option summarises the paragraph?", correct: "F" },
  { question: "Paragraph 2 – Which option summarises the paragraph?", correct: "B" },
  { question: "Paragraph 3 – Which option summarises the paragraph?", correct: "D" },
  { question: "Paragraph 4 – Which option summarises the paragraph?", correct: "A" },
  { question: "Paragraph 5 – Which option summarises the paragraph?", correct: "E" },
  { question: "Paragraph 6 – Which option summarises the paragraph?", correct: "G" },

  // Set 3 — Lord of the Flies (17–26)  indexes 16–25
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

  // Set 4 — Gift Wrapping (27–31)  indexes 26–30
  { question: "Paragraph 1 – Which option summarises the paragraph?", correct: "E" },
  { question: "Paragraph 2 – Which option summarises the paragraph?", correct: "A" },
  { question: "Paragraph 3 – Which option summarises the paragraph?", correct: "G" },
  { question: "Paragraph 4 – Which option summarises the paragraph?", correct: "C" },
  { question: "Paragraph 5 – Which option summarises the paragraph?", correct: "D" },

  // Set 5 — Antarctica (32–37)  indexes 31–36
  { question: "Paragraph 1 – Which option summarises the paragraph?", correct: "E" },
  { question: "Paragraph 2 – Which option summarises the paragraph?", correct: "G" },
  { question: "Paragraph 3 – Which option summarises the paragraph?", correct: "A" },
  { question: "Paragraph 4 – Which option summarises the paragraph?", correct: "B" },
  { question: "Paragraph 5 – Which option summarises the paragraph?", correct: "F" },
  { question: "Paragraph 6 – Which option summarises the paragraph?", correct: "D" },

  // Set 6 — Memory (38–46)  indexes 37–45
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
   READING SETS (PASSAGES / EXTRACTS PER QUESTION GROUP)
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
     A: "Sometimes you come across a grimy, tattered dollar bill that looks as if it has existed forever. In reality, the idea of money reaches far back into human civilisation. Archaeological findings show that long before coins appeared, communities relied on bartering systems. People exchanged goods such as grain, tools, or livestock, and even far-flung groups used barter to trade what they had in abundance for what they lacked. These early exchanges helped shape the foundations of organised economies."
   
     B: "There are many theories about how money first emerged, largely because money performs several different functions. Across history, societies have used shells, metals, beads, rare stones, and other precious or symbolic materials as forms of currency. These objects held value either because they were scarce or because rulers and political authorities declared them valuable. In many regions, taxation systems and the need to manage resources pushed governments to standardise forms of money. Over time, money also became a stabilising force, helping regulate trade, settle debts, and support structured economic systems."
   
     C: "Money has been part of human history for at least 3,000 years, long replacing pure bartering. Barter required both sides to want what the other offered, which often made exchanges slow and impractical. Early forms of money such as animal skins, salt, weapons, and small metal pieces solved this issue by providing a common medium of exchange. As soon as people began using agreed-upon items as currency, trade became faster, more flexible, and more extensive. This change laid the groundwork for more complex markets and long-distance commerce."
   
     D: "The first official Australian banknotes were produced only about a century ago, yet forms of currency were used in Australia long before that. After the discovery of gold in the mid-1800s, banks began issuing their own notes to support booming trade and mining activity. As the economy expanded, the need for a consistent national currency grew. This led to the Australian Notes Act of 1910, which gave the federal government exclusive authority to produce banknotes. From that point on, Australia moved toward a unified and regulated monetary system."
   }

  },
  {
    id: "birds",
    title: "Birds – Paragraph Summaries",
    instruction:
      "Read the text about birds. For each numbered paragraph, choose the option (A–G) which best summarises it.",
    questionStart: 10,
    questionEnd: 15,
    type: "passage",
    passage: `Options:
A. Exceptions to the rule
B. Distant ancestors
C. Birds that can fly the fastest
D. Physical appearance that protects the little ones
E. A superpower that birds have
F. Birds making long journeys
G. The beginning of a new life

Paragraphs describe: global distribution and migration of birds, their warm-blooded nature and link to reptiles/dinosaurs, feather colours and protection, flying and flightless birds, sharp eyesight, and breeding/nesting behaviour.`
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
      A: `An atmospheric scene on the island describing clouds, heat, flies on a pig's head, and Simon moving through the forest and towards the mountaintop. (Setting and Simon's experience).`,
      B: `A critical description of Jack as a symbol of savagery and dictatorship, his bloodlust, painted mask, totalitarian leadership, and reversion to primitive violence.`,
      C: `An analysis of the conch as a symbol of society and authority, how it unites the boys, helps choose Ralph, and brings civilising influence at first.`,
      D: `A reflective piece by Golding's daughter defending her father's intentions, stressing rule of law, complexity of human beings, and context such as nuclear war.`
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
    passage: `Options:
A. how an investigation began
B. people are disappointed by cheap gifts
C. how gorgeous wrapping raises expectations
D. why wrapping doesn't matter among friends
E. a challenge to assumptions about gift-wrapping
F. the idea trade gifts should reflect the giver's business
G. how students reacted unexpectedly to unwanted gifts

The passage describes research into how neat vs. sloppy wrapping affects expectations and satisfaction with gifts, and how relationships (friend vs acquaintance) change the effect.`
  },
  {
    id: "antarctica",
    title: "Antarctica – Paragraph Summaries",
    instruction:
      "Read the text about Antarctica. For each paragraph, choose the option (A–G) which best summarises it.",
    questionStart: 31,
    questionEnd: 36,
    type: "passage",
    passage: `Options:
A. scientific knowledge about Antarctica
B. millions of birds unable to fly
C. stormy weather that prevents people from travelling
D. a list of pioneers
E. the land of ice
F. an environmental disaster
G. a small number of inhabitants

The paragraphs cover size and icy nature of the continent, low population and research stations, the nations and largest station, penguin colonies, the ozone hole as an environmental warning, and famous explorers like Cook, Amundsen, and Shackleton.`
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
      A: `A discussion of working memory: small capacity, heavy use in psychology, relation to intelligence and learning, and how education materials should be adjusted to fit working-memory limits.`,
      B: `A description of sensory memory and George Sperling's experiments with brief letter displays and tones that cue which row to recall, showing how quickly sensory traces fade without attention.`,
      C: `An explanation of long-term memory as potentially unlimited, like a computer hard drive, with explicit (episodic and semantic) and implicit (procedural) components, including examples like riding a bicycle.`,
      D: `A review of dream research and Freud's view that dreams have manifest content and latent thoughts, with ongoing debates about the function and mechanisms of dreaming.`
    }
  }
];

/* Helper: find which reading set a question index belongs to */
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
  const [finished, setFinished] = useState(false);

  const currentQuestion = quiz40[index];
  const currentSet = getReadingSetForQuestion(index);

  const handleSelect = (choice) => {
    setAnswers((prev) => ({ ...prev, [index]: choice }));
  };

  const score = quiz40.reduce(
    (acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0),
    0
  );

  if (finished) {
    return (
      <div className="completed-screen">
        <h1>Quiz Completed</h1>
        <h2>
          Your Score: {score} / {quiz40.length}
        </h2>
      </div>
    );
  }

  return (
    <div className="exam-container">
      {/* HEADER */}
      <div className="exam-header">
        <div>
          {currentSet ? currentSet.title : "Reading Exam"}
        </div>
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
              (answers[i]
                ? "index-answered"
                : index === i
                ? "index-visited"
                : "")
            }
            onClick={() => setIndex(i)}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* TWO-COLUMN BODY: LEFT PASSAGE, RIGHT QUESTION */}
      <div className="exam-body">
        {/* LEFT: PASSAGE / EXTRACTS */}
        <div className="passage-pane">
          {currentSet && (
            <>
              <h3 className="passage-title">{currentSet.title}</h3>
              {currentSet.instruction && (
                <p className="passage-instruction">
                  {currentSet.instruction}
                </p>
              )}

              {currentSet.type === "extracts" &&
                Object.entries(currentSet.extracts).map(
                  ([label, text]) => (
                    <div className="extract-block" key={label}>
                      <h4>Extract {label}</h4>
                      <p className="passage-text">{text}</p>
                    </div>
                  )
                )}

              {currentSet.type === "passage" && (
                <div className="extract-block">
                  <p className="passage-text">
                    {currentSet.passage}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT: QUESTION + OPTIONS */}
        <div className="question-pane">
          <div className="question-card">
            <p className="question-text">
              {currentQuestion.question}
            </p>

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

          <div className="nav-buttons">
            <button
              className="nav-btn prev"
              disabled={index === 0}
              onClick={() => setIndex((i) => i - 1)}
            >
              Previous
            </button>

            {index < quiz40.length - 1 ? (
              <button
                className="nav-btn next"
                onClick={() => setIndex((i) => i + 1)}
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
      </div>
    </div>
  );
}
