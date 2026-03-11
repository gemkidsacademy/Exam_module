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
  const [topicList, setTopicList] = useState([]);


  /* ================= RESET WHEN INPUTS CHANGE ================= */

  useEffect(() => {
    setReports([]);
    setShowTopics(false);
  }, [studentId, exam, attemptDates]);
 useEffect(() => {

  if (!exam) return;

  const fetchTopics = async () => {
  
  const res = await fetch(`${API_BASE}/api/exams/${exam}/topics`);
  const data = await res.json();
  console.log("TOPICS API RESPONSE:", data);
  const topicsArray =
    Array.isArray(data)
      ? data
      : Array.isArray(data?.topics)
      ? data.topics
      : [];

  setTopicList(topicsArray);
};

  fetchTopics();

}, [exam, API_BASE]);


  /* ================= GENERATE OVERALL REPORT ================= */

  const handleGenerate = () => {

    if (!studentId || !exam || !attemptDates.length) {
      alert("Please select student, exam and attempt dates.");
      return;
    }

    // Only overall report initially
    setReports([{ topic: null }]);
  };



  /* ================= ADD TOPIC REPORT ================= */

  const handleTopicSelect = (e) => {

    const topic = String(e.target.value);
    if (!topic) return;

    const exists = reports.some(r => r.topic === topic);
    if (exists) return;

    setReports(prev => [...prev, { topic }]);

    e.target.value = "";
  };



  /* ================= REPORT CARD ================= */

  const ReportCard = ({ topic, isOverall }) => {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

      if (!studentId || !exam || !attemptDates.length) return;

      const fetchData = async () => {

        setLoading(true);

        const params = new URLSearchParams();

        params.append("student_id", studentId);
        if (exam !== "writing") {
          params.append("exam", exam);
        }

        attemptDates.forEach(date => {
          params.append("attempt_dates", date);
        });
        console.log("DATES SENT TO BACKEND:", attemptDates);

        if (topic) {
          params.append("topic", topic);
        }

        let endpoint;

          if (exam === "writing") {
            endpoint = "/api/reports/student/writing/cumulative";
          } else {
            endpoint = topic
              ? "/api/reports/student/cumulative"
              : "/api/reports/student/cumulative-overall";
          }
        try {
          console.log(
            "FETCHING:",
            `${API_BASE}${endpoint}?${params.toString()}`
          );
          const res = await fetch(
            `${API_BASE}${endpoint}?${params.toString()}`
          );

          const result = await res.json();
          console.log("CUMULATIVE REPORT RESULT:", result);

          setData(result);

          // Only after overall report loads do we show topic dropdown
          if (!topic) {
            setShowTopics(true);
          }

        } catch (err) {
          console.error(err);
        }

        setLoading(false);

      };

      fetchData();

    }, [topic, studentId, exam, attemptDates, API_BASE]);


    if (loading) {
      return <div className="cumulative-report">Loading...</div>;
    }

    if (!data) return null;


    const {
      student_id,
      student_name,
      exam: examName
    } = data;
    
    const attempts =
  Array.isArray(data?.attempts)
    ? data.attempts
    : [];

    const label = topic ? topic : "Overall Performance";

    if (!attempts.length) {
      return (
        <div className="cumulative-report">
          <p>No data available.</p>
        </div>
      );
    }


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



  /* ================= UI ================= */
  console.log("REPORTS STATE:", reports, Array.isArray(reports));
  return (

    <div className="cumulative-dashboard">

      {/* Generate button */}

      <button
        className="generate-btn"
        onClick={handleGenerate}
      >
        Generate Report
      </button>



      {/* Topic selector appears AFTER overall report loads */}

      {showTopics && (
  <div className="topic-bar">

    <div className="topic-label">
      Add Topic Report
    </div>

    <select
      className="topic-dropdown"
      onChange={handleTopicSelect}
    >
      <option value="">Choose a topic...</option>

      {Array.isArray(topicList) &&
  topicList.map((t, i) => {
  const key = typeof t === "object" ? t.key : t;
  const label = typeof t === "object" ? t.label : t;

  return (
    <option key={i} value={key}>
      {label}
    </option>
  );
})
  }

    </select>

  </div>
)}


      {/* Reports */}

      <div className="reports-container">

      {/* Overall report */}
      {reports
        .filter(r => r.topic === null)
        .map(r => (
          <ReportCard
            key="overall-report"
            topic={null}
          />
      ))}
    
      {/* Topic reports */}
      {reports
        .filter(r => r.topic !== null)
        .map(r => (
          <ReportCard
            key={`topic-${r.topic}`}
            topic={r.topic}
          />
      ))}
    
    </div>

    </div>
  );
}



/* ================= SIMPLE SVG CHART ================= */

function SimpleLineChart({ attempts = [] }) {
  console.log("CHART ATTEMPTS:", attempts);
  console.log("CHART ATTEMPTS ARRAY?", Array.isArray(attempts));
  
  const safeAttempts =
  Array.isArray(attempts)
    ? attempts
    : [];

  console.log("ATTEMPT OBJECTS:", JSON.stringify(safeAttempts, null, 2));
  console.log("REPORT CARD ATTEMPTS:", attempts);
  console.log("ATTEMPTS TYPE:", typeof attempts, Array.isArray(attempts));

  const width = 800;
  const height = 220;
  const padding = 50;
  const maxY = 100;

  const scores = safeAttempts.map((a) => {
  if (typeof a === "object") return Number(a.score ?? 0);
  return Number(a ?? 0);
});

const accuracies = safeAttempts.map((a) => {
  if (typeof a === "object") return Number(a.accuracy ?? 0);
  return Number(a ?? 0);
});
  console.log("SCORES:", scores);
  console.log("ACCURACIES:", accuracies);

  const xStep =
    safeAttempts.length > 1
      ? (width - padding * 2) / safeAttempts.length
      : 0;
  
  const yScale = val =>
    height - padding - (val / maxY) * (height - padding * 2);

  const points = (values) => {

  if (!Array.isArray(values)) {
    console.warn("POINTS received non-array:", values);
    return "";
  }

  return values
    .map((v, i) => {
      const x = padding + (i + 1) * xStep;
      const y = yScale(Number(v) || 0);
      return `${x},${y}`;
    })
    .join(" ");
};

  return (
    <svg width={width} height={height} className="line-chart">

      {/* Y axis */}
      <line
        x1={padding}
        y1={padding}
        x2={padding}
        y2={height - padding}
        stroke="#ccc"
      />

      {/* X axis */}
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="#ccc"
      />

      {/* Y axis label */}
      <text
        x={25}
        y={height / 2}
        transform={`rotate(-90 25 ${height / 2})`}
        textAnchor="middle"
        fontSize="12"
        fill="#444"
      >
        Score / Accuracy (%)
      </text>
      {/* X axis label */}
      <text
        x={width / 2}
        y={height - 15}
        textAnchor="middle"
        fontSize="12"
        fill="#444"
      >
        Attempts Over Time
      </text>

      {/* Lines */}

      {Array.isArray(scores) && Array.isArray(accuracies) && (
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
      {/* Score points */}

      {Array.isArray(scores) && scores.map((s, i) => {
        const x = padding + i * xStep;
        const y = yScale(s);
      
        return (
          <circle
            key={`score-${i}`}
            cx={x}
            cy={y}
            r="4"
            fill="#2563eb"
          />
        );
      })}
      
      {/* Accuracy points */}
      
      {Array.isArray(accuracies) && accuracies.map((a, i) => {
        const x = padding + i * xStep;
        const y = yScale(a);
      
        return (
          <circle
            key={`acc-${i}`}
            cx={x}
            cy={y}
            r="4"
            fill="#16a34a"
          />
        );
      })}

    </svg>
  );
}
