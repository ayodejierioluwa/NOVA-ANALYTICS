"use client";

import { useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';

export default function FileUpload({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file) => {
    setError('');
    
    // Client-side validation
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be under 10MB.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Upload failed');
      
      onUploadSuccess(data.file_id, data.columns);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div 
        className={`upload-zone ${isDragging ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input 
          id="file-input" 
          type="file" 
          accept=".csv" 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
        />
        {isUploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Loader2 className="upload-icon" size={48} style={{ animation: 'spin 1s linear infinite' }} />
            <p>Analyzing dataset...</p>
          </div>
        ) : (
          <>
            <UploadCloud className="upload-icon" size={48} />
            <h3 style={{ marginBottom: '0.5rem' }}>Upload Dataset</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Drag & drop a CSV file here, or click to browse
            </p>
          </>
        )}
      </div>
      {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
    </div>
  );
}
