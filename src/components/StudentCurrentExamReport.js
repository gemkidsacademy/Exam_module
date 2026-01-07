import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import "./StudentExamReport.css";

/* ============================
   MOCK DATA
============================ */

const examSummary = {
  examName: "NSW Selective Thinking Skills Test",
  totalQuestions: 20,
  attempted: 20,
  correct: 8,
  incorrect: 12,
  notAttempted: 0,
  accuracy: 40,
  scorePercent: 40,
  result: "Fail"
};

const topicPerformance = [
  {
    topic: "Time Reasoning",
    total: 10,
    attempted: 10,
    correct: 3,
    incorrect: 7,
    notAttempted: 0
  },
  {
    topic: "Pattern Recognition",
    total: 6,
    attempted: 6,
    correct: 4,
    incorrect: 2,
    notAttempted: 0
  },
  {
    topic: "Logical Sequences",
    total: 4,
    attempted: 4,
    correct: 1,
    incorrect: 3,
    notAttempted: 0
  }
];

/* ============================
   DERIVED DATA
============================ */

const accuracyPie = [
  { name: "Correct", value: examSummary.correct },
  { name: "Incorrect", value: examSummary.incorrect },
  { name: "Not Attempted", value: examSummary.notAttempted }
];

const COLORS = ["#22c55e", "#ef4444", "#94a3b8"];

/* ============================
   COMPONENT
============================ */

export default function StudentExamReportMock() {
  return (
    <div className="report-container">

      <h2>{examSummary.examName}</h2>

      {/* ============================
          OVERALL ACCURACY
      ============================ */}
      <section className="card">
        <h3>Overall Accuracy & Result</h3>

        <div className="summary-grid">
          <div>
            <p><strong>Total Questions:</strong> {examSummary.totalQuestions}</p>
            <p><strong>Attempted:</strong> {examSummary.attempted}</p>
            <p><strong>Correct:</strong> {examSummary.correct}</p>
            <p><strong>Incorrect:</strong> {examSummary.incorrect}</p>
            <p><strong>Not Attempted:</strong> {examSummary.notAttempted}</p>
            <p><strong>Accuracy:</strong> {examSummary.accuracy}%</p>
            <p><strong>Score:</strong> {examSummary.scorePercent}%</p>
            <p><strong>Result:</strong> {examSummary.result}</p>
          </div>

          <ResponsiveContainer width={250} height={250}>
            <PieChart>
              <Pie
                data={accuracyPie}
                dataKey="value"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
              >
                {accuracyPie.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ============================
          TOPIC-WISE PERFORMANCE
      ============================ */}
      <section className="card">
        <h3>Topic-wise Performance</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topicPerformance}>
            <XAxis dataKey="topic" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="correct" stackId="a" fill="#22c55e" />
            <Bar dataKey="incorrect" stackId="a" fill="#ef4444" />
            <Bar dataKey="notAttempted" stackId="a" fill="#94a3b8" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* ============================
          IMPROVEMENT AREAS
      ============================ */}
      <section className="card">
        <h3>Improvement Areas</h3>

        {topicPerformance
          .sort((a, b) => a.correct - b.correct)
          .map(topic => {
            const accuracy = Math.round(
              (topic.correct / topic.total) * 100
            );

            return (
              <div key={topic.topic} className="improvement-row">
                <span>{topic.topic}</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
                <span>{accuracy}%</span>
              </div>
            );
          })}

        <p className="note">
          Topics with fewer questions may show limited accuracy trends.
        </p>
      </section>

    </div>
  );
}
