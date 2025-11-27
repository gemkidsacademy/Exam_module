import React, { useState, useEffect } from "react";
import "./UsageDashboard.css";

const UsageDashboard = () => {
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dummy customer usage data for last 30 days
    const dummyData = [
      { user: "Alice", amount_usd: 1.00 },
      { user: "Bob", amount_usd: 1.00 },
      { user: "Charlie", amount_usd: 1.00 },
      { user: "Diana", amount_usd: 1.00 },
      { user: "Ethan", amount_usd: 1.00 },
      { user: "Fiona", amount_usd: 1.00 },
      { user: "George", amount_usd: 1.00 },
      { user: "Hannah", amount_usd: 1.00 }
    ];

    // Simulate loading delay
    setTimeout(() => {
      setUsageData(dummyData);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <div className="loading">Loading usage data...</div>;

  // Calculate total usage across all users
  const total = usageData.reduce((sum, item) => sum + item.amount_usd, 0);

  return (
    <div className="usage-dashboard">
      <h1>Customer API Usage (Last 30 Days)</h1>
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Amount (USD)</th>
          </tr>
        </thead>
        <tbody>
          {usageData.map((item, index) => (
            <tr key={index}>
              <td>{item.user}</td>
              <td>${item.amount_usd.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="total">
        <strong>Total Usage: ${total.toFixed(2)}</strong>
      </div>
    </div>
  );
};

export default UsageDashboard;
