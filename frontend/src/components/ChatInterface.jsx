"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Database } from 'lucide-react';

export default function ChatInterface({ fileId, onResponse, columns }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Dataset loaded successfully. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsProcessing(true);

    try {
      const res = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: fileId, query: userMessage })
      });

      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { role: 'ai', text: 'Here are the results.' }]);
        onResponse(data);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: `Sorry, I encountered an error: ${data.error}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Failed to communicate with the server.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="chat-container">
      <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Database size={16} color="var(--accent-primary)" />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Dataset Active</span>
      </div>
      
      <div className="chat-history">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {isProcessing && (
          <div className="chat-message ai" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-wrapper">
        <input 
          type="text" 
          className="input-field" 
          placeholder="Ask a question..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isProcessing}
        />
        <button type="submit" className="btn-primary" disabled={isProcessing || !input.trim()}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
