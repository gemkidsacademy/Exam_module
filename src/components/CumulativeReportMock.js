import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import "./Reports.css";

/* ============================
   MOCK DATA
============================ */

const examProgress = [
  { exam: "Exam 1", score: 55, accuracy: 52 },
  { exam: "Exam 2", score: 61, accuracy: 58 },
  { exam: "Exam 3", score: 68, accuracy: 64 },
  { exam: "Exam 4", score: 72, accuracy: 70 }
];

const topicTrends = [
  {
    topic: "Time Reasoning",
    data: [
      { exam: "E1", score: 40 },
      { exam: "E2", score: 52 },
      { exam: "E3", score: 60 }
    ]
  },
  {
    topic: "Pattern Recognition",
    data: [
      { exam: "E2", score: 65 },
      { exam: "E3", score: 68 },
      { exam: "E4", score: 75 }
    ]
  }
];

/* ============================
   COMPONENT
============================ */

export default function CumulativeReportMock() {
  return (
    <div className="report-container">

      <h2>Student Progress Over Time</h2>

      {/* ================= OVERALL TREND ================= */}
      <section className="card">
        <h3>Overall Progress Summary</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={examProgress}>
            <XAxis dataKey="exam" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#2563eb"
              strokeWidth={3}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="#22c55e"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>

        <p className="ai-text">
          The student’s overall performance shows a steady improvement across
          the selected exams, with both score and accuracy increasing
          consistently.
        </p>
      </section>

      {/* ================= TOPIC TRENDS ================= */}
      <section className="card">
        <h3>Topic-wise Progress Over Time</h3>

        {topicTrends.map(topic => (
          <div key={topic.topic} className="topic-block">
            <h4>{topic.topic}</h4>

            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={topic.data}>
                <XAxis dataKey="exam" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#f59e0b"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>

            {topic.data.length < 3 && (
              <p className="note">
                Limited data available for this topic. Trends may not be fully
                representative.
              </p>
            )}
          </div>
        ))}
      </section>

      {/* ================= AI INSIGHTS ================= */}
      <section className="card">
        <h3>AI Insights & Suggestions</h3>

        <ul>
          <li>
            <strong>Performance Trend:</strong> Overall improvement observed
            across recent exams.
          </li>
          <li>
            <strong>Strong Areas:</strong> Pattern Recognition is improving
            steadily.
          </li>
          <li>
            <strong>Needs Attention:</strong> Time Reasoning accuracy is still
            below target.
          </li>
          <li>
            <strong>Next Exam Target:</strong> Aim to increase overall score by
            8% in the next exam.
          </li>
        </ul>

        <p className="ai-text">
          This report suggests positive progress over time. Continued practice
          in weaker areas will help the student build confidence and achieve
          stronger results in upcoming exams.
        </p>
      </section>

    </div>
  );
}
