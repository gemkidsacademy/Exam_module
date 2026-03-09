import React, { useState, useEffect } from "react";
import "./CumulativeReport_new.css";

export default function CumulativeReport_new({
  studentId,
  exam,
  attemptDates,
  topics = [],
  API_BASE
}) {

  const [reports, setReports] = useState([]);
  const [showTopics, setShowTopics] = useState(false);
  const [loadingReports, setLoadingReports] = useState({});


  /* ================= GENERATE OVERALL ================= */

  const handleGenerate = () => {

    if (!studentId || !exam || attemptDates.length === 0) {
      alert("Please select student, exam and attempts.");
      return;
    }

    setReports([{ topic: null }]);
    setShowTopics(true);
  };


  /* ================= ADD TOPIC REPORT ================= */

  const handleTopicSelect = (e) => {

    const topic = e.target.value;
    if (!topic) return;

    const exists = reports.some(r => r.topic === topic);
    if (exists) return;

    setReports(prev => [...prev, { topic }]);
  };


  /* ================= REPORT COMPONENT ================= */

  const ReportCard = ({ topic }) => {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

      const fetchData = async () => {

        setLoading(true);

        const params = new URLSearchParams();

        params.append("student_id", studentId);
        params.append("exam", exam);

        attemptDates.forEach(d =>
          params.append("attempt_dates", d)
        );

        if (topic) {
          params.append("topic", topic);
        }

        const endpoint = topic
          ? "/api/reports/student/cumulative-topic"
          : "/api/reports/student/cumulative-overall";

        try {

          const res = await fetch(
            `${API_BASE}${endpoint}?${params.toString()}`
          );

          const result = await res.json();

          setData(result);

        } catch (err) {
          console.error(err);
        }

        setLoading(false);

      };

      fetchData();

    }, [topic]);


    if (loading) {
      return <div className="cumulative-report">Loading...</div>;
    }

    if (!data) return null;


    const {
      student_id,
      student_name,
      exam: examName,
      attempts = []
    } = data;

    const label = topic ?? "Overall Performance";


    return (
      <div className="cumulative-report">

        <div className="report-header">
          <h2>{label}</h2>

          <p className="subtext">
            {student_name} ({student_id}) · {examName}
          </p>
        </div>

        <div className="chart-container">
          <SimpleLineChart attempts={attempts} />
        </div>

      </div>
    );
  };


  /* ================= MAIN UI ================= */

  return (
    <div className="cumulative-dashboard">

      <button className="generate-btn" onClick={handleGenerate}>
        Generate Report
      </button>


      {showTopics && (
        <div className="topic-select">

          <label>Select Topic:</label>

          <select onChange={handleTopicSelect}>
            <option value="">Select topic</option>

            {topics.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}

          </select>

        </div>
      )}


      <div className="reports-container">

        {reports.map((r, i) => (
          <ReportCard key={i} topic={r.topic} />
        ))}

      </div>

    </div>
  );
}



/* ================= CHART ================= */

function SimpleLineChart({ attempts }) {

  const width = 600;
  const height = 220;
  const padding = 30;
  const maxY = 100;

  const scores = attempts.map(a => a.score);
  const accuracies = attempts.map(a => a.accuracy);

  const xStep =
    attempts.length > 1
      ? (width - padding * 2) / (attempts.length - 1)
      : 0;

  const yScale = val =>
    height - padding - (val / maxY) * (height - padding * 2);

  const points = values =>
    values
      .map((v, i) => {
        const x = padding + i * xStep;
        const y = yScale(v);
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <svg width={width} height={height} className="line-chart">

      <line
        x1={padding}
        y1={padding}
        x2={padding}
        y2={height - padding}
        stroke="#ccc"
      />

      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="#ccc"
      />

      {attempts.length > 1 && (
        <>
          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            points={points(scores)}
          />

          <polyline
            fill="none"
            stroke="#16a34a"
            strokeWidth="2"
            points={points(accuracies)}
          />
        </>
      )}

    </svg>
  );
}
