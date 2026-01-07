import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { mockExamData } from "./mockData";
import PDFPreviewMock from "./PDFPreviewMock";
import "./Reports.css";

export default function ClassReportMock() {
  const [exam, setExam] = useState("Thinking Skills");
  const [date, setDate] = useState("2024-01-10");
  const [showPDF, setShowPDF] = useState(false);

  const key = `${exam}|${date}`;
  const data = mockExamData[key];

  return (
    <div className="report-container">

      {/* ===== FILTER BAR ===== */}
      <div className="filters-bar">
        <select value={exam} onChange={e => setExam(e.target.value)}>
          <option>Thinking Skills</option>
        </select>

        <select value={date} onChange={e => setDate(e.target.value)}>
          <option value="2024-01-10">10 Jan 2024</option>
          <option value="2024-02-15">15 Feb 2024</option>
        </select>

        <button onClick={() => setShowPDF(true)}>
          Preview PDF
        </button>
      </div>

      {/* ===== SUMMARY ===== */}
      <section className="card">
        <h3>Class Summary</h3>
        <p>
          The class achieved an average score of{" "}
          <strong>{data.classSummary.averageScore}%</strong>, with a highest
          score of <strong>{data.classSummary.highestScore}%</strong>.
          {" "} {data.classSummary.completed} out of{" "}
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

      {/* ===== PDF PREVIEW ===== */}
      {showPDF && <PDFPreviewMock onClose={() => setShowPDF(false)} />}
    </div>
  );
}
