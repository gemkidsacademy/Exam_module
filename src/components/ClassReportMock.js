import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { mockExamData } from "./mockData";
import "./Reports.css";

export default function ClassReportMock({
  className,
  classDay,
  exam,
  date
}) {
  const key = `${exam}|${date}`;
  const data = mockExamData[key];

  // 🚧 SAFETY GUARD — REQUIRED
  if (!data) {
    return (
      <div className="empty-state">
        <h3>No data available</h3>
        <p>
          No class report exists for the selected exam and date.
        </p>
      </div>
    );
  }

  return (
    <div className="report-container">

      {/* ===== CONTEXT HEADER ===== */}
      <h2>
        {className} – {classDay} | {exam.replace("_", " ")} ({date})
      </h2>

      {/* ===== SUMMARY ===== */}
      <section className="card">
        <h3>Class Summary</h3>
        <p>
          The class achieved an average score of{" "}
          <strong>{data.classSummary.averageScore}%</strong>, with a highest
          score of <strong>{data.classSummary.highestScore}%</strong>.{" "}
          {data.classSummary.completed} out of{" "}
          {data.classSummary.totalStudents} students completed the exam.
        </p>
      </section>

      {/* ===== LEADERBOARD ===== */}
      <section className="card">
        <h3>Leaderboard</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student</th>
              <th>Score</th>
              <th>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {data.leaderboard.map((s, i) => (
              <tr key={s.name}>
                <td>{i + 1}</td>
                <td>{s.name}</td>
                <td>{s.score}%</td>
                <td>{s.accuracy}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ===== DISTRIBUTION ===== */}
      <section className="card">
        <h3>Score Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.distribution}>
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </section>

    </div>
  );
}
