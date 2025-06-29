import React, { useEffect, useState } from 'react';
import { getDashboardData } from '../services/dashboardService';
import { getNetWorthTrend } from '../services/networthService';
import NetWorthChart from '../components/NetWorthChart';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData().then((res) => {
      setData(res);
      setLoading(false);
    });
    getNetWorthTrend().then(setTrend);
  }, []);

  if (loading) return <p style={{ padding: '2rem' }}>Loading dashboard...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Your Dashboard</h2>

      {/* Net Worth Summary */}
      <p><strong>Net Worth:</strong> ₹{data.netWorth.toLocaleString()}</p>

      

      {/* Investment Summary Table */}
      <h3 style={{ marginTop: '2rem' }}>💼 Your Investments</h3>
      <div style={{
        overflowX: 'auto',
        maxWidth: '100%',
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Invested Amount</th>
              <th>Current Value</th>
              <th>Gain/Loss</th>
            </tr>
          </thead>
          <tbody>
            {data.investments.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.name}</td>
                <td>{inv.type}</td>
                <td>₹{inv.amountInvested.toLocaleString()}</td>
                <td>₹{inv.currentValue.toLocaleString()}</td>
                <td style={{
                  color: inv.currentValue - inv.amountInvested >= 0 ? 'green' : 'red'
                }}>
                  ₹{(inv.currentValue - inv.amountInvested).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Net Worth Trend Chart */}
      <div style={{
        marginTop: '2rem',
        marginBottom: '2rem',
        background: '#fff',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>📈 Net Worth Trend</h3>
        <NetWorthChart data={trend} />
      </div>
    </div>
  );
};

export default Dashboard;
