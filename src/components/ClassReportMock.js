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
  Cell
} from "recharts";
import "./Reports.css";

/* ============================
   MOCK DATA
============================ */

const classSummary = {
  examName: "Thinking Skills – Selective Test",
  totalStudents: 12,
  completed: 10,
  averageScore: 62,
  highestScore: 88
};

const leaderboard = [
  { name: "Student A", score: 88, accuracy: 90 },
  { name: "Student B", score: 81, accuracy: 85 },
  { name: "Student C", score: 74, accuracy: 78 },
  { name: "Student D", score: 69, accuracy: 70 },
  { name: "Student E", score: 63, accuracy: 65 }
];

const scoreDistribution = [
  { range: "0–40", count: 1 },
  { range: "41–60", count: 3 },
  { range: "61–80", count: 4 },
  { range: "81–100", count: 2 }
];

const COLORS = ["#2563eb", "#22c55e", "#f59e0b", "#ef4444"];

/* ============================
   COMPONENT
============================ */

export default function ClassReportMock() {
  return (
    <div className="report-container">

      <h2>{classSummary.examName}</h2>

      {/* ================= SUMMARY ================= */}
      <section className="card">
        <h3>Class Summary</h3>
        <p>
          The class showed an average performance with an overall mean score of{" "}
          <strong>{classSummary.averageScore}%</strong>. The highest score
          achieved was <strong>{classSummary.highestScore}%</strong>.{" "}
          {classSummary.completed} out of {classSummary.totalStudents} students
          completed the exam.
        </p>
      </section>

      {/* ================= LEADERBOARD ================= */}
      <section className="card">
        <h3>Class Leaderboard</h3>

        <table className="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student</th>
              <th>Score (%)</th>
              <th>Accuracy (%)</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((s, i) => (
              <tr key={s.name}>
                <td>{i + 1}</td>
                <td>{s.name}</td>
                <td>{s.score}</td>
                <td>{s.accuracy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ================= GRAPHS ================= */}
      <section className="card grid-2">
        {/* Score Distribution */}
        <div>
          <h4>Score Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={scoreDistribution}>
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performers */}
        <div>
          <h4>Top Performing Students</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={leaderboard}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

    </div>
  );
}
