"use client";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

export default function DynamicChart({ dataConfig }) {
  if (!dataConfig) return null;

  // Single Value Result
  if (dataConfig.value !== undefined) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Result</h3>
        <div style={{ fontSize: '4rem', fontWeight: 'bold', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {dataConfig.value}
        </div>
      </div>
    );
  }

  // Summary state (just columns)
  if (dataConfig.type === 'summary') {
    return (
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Dataset Uploaded Successfully</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Detected {dataConfig.data.columns.length} columns. You can now ask questions about this data.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {dataConfig.data.columns.map((col, idx) => (
            <span key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid var(--border-color)' }}>
              {col}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Chart Rendering
  if (dataConfig.chart_type) {
    const { chart_type, data } = dataConfig;
    const keys = Object.keys(data[0] || {}).filter(k => k !== 'name');

    return (
      <div style={{ width: '100%', height: '400px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '1rem', textTransform: 'capitalize' }}>{chart_type} Chart</h3>
        <ResponsiveContainer width="100%" height="100%">
          {chart_type === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
              {keys.map((key, idx) => (
                <Bar key={key} dataKey={key} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          ) : chart_type === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
              {keys.map((key, idx) => (
                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[idx % COLORS.length]} strokeWidth={3} />
              ))}
            </LineChart>
          ) : (
             <div className="empty-state">Unsupported chart type requested.</div>
          )}
        </ResponsiveContainer>
      </div>
    );
  }

  // Fallback: Data Table
  if (Array.isArray(dataConfig)) {
    const keys = Object.keys(dataConfig[0] || {});
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
        <h3>Data Results</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>{keys.map(k => <th key={k}>{k}</th>)}</tr>
            </thead>
            <tbody>
              {dataConfig.map((row, idx) => (
                <tr key={idx}>
                  {keys.map(k => <td key={k}>{row[k]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return <div className="empty-state">Unable to render the result format.</div>;
}
