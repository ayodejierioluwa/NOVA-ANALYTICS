"use client";

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ChatInterface from '@/components/ChatInterface';
import DynamicChart from '@/components/DynamicChart';
import { Database, LayoutDashboard, BrainCircuit } from 'lucide-react';

export default function Home() {
  const [fileId, setFileId] = useState(null);
  const [columns, setColumns] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);

  const handleUploadSuccess = (id, cols) => {
    setFileId(id);
    setColumns(cols);
    setDashboardData({ type: 'summary', data: { columns: cols } });
  };

  const handleQueryResponse = (response) => {
    if (response.success && response.data) {
      setDashboardData(response.data);
    }
  };

  return (
    <div className="container">
      <header className="header glass-panel" style={{ padding: '1rem 2rem' }}>
        <BrainCircuit size={32} color="var(--accent-primary)" />
        <h1 className="header-title">Nova Analytics</h1>
      </header>

      <main className="main-content">
        <aside className="sidebar glass-panel">
          {!fileId ? (
            <div style={{ padding: '1.5rem', height: '100%' }}>
              <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={20} /> Connect Data
              </h2>
              <FileUpload onUploadSuccess={handleUploadSuccess} />
            </div>
          ) : (
            <ChatInterface fileId={fileId} onResponse={handleQueryResponse} columns={columns} />
          )}
        </aside>

        <section className="dashboard-area glass-panel">
          {!dashboardData ? (
            <div className="empty-state">
              <LayoutDashboard size={48} opacity={0.5} />
              <h2>Your Dashboard</h2>
              <p>Upload a dataset to begin exploring.</p>
            </div>
          ) : (
            <DynamicChart dataConfig={dashboardData} />
          )}
        </section>
      </main>
    </div>
  );
}
