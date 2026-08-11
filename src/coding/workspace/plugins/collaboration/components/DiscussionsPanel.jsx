import React, { useState } from 'react';

export const DiscussionsPanel = ({ pluginApi }) => {
  const [messages, setMessages] = useState([
    { id: 1, author: 'System', text: 'Welcome to the Collaboration Session!' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), author: 'You', text: input };
    setMessages([...messages, newMsg]);
    setInput('');
    // Emit event so SyncManager could broadcast it
    pluginApi.emitEvent('collaboration.discussion.sent', newMsg);
  };

  return (
    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ marginBottom: '8px', padding: '8px', background: '#252526', borderRadius: '4px' }}>
            <div style={{ fontSize: '12px', color: '#007acc', marginBottom: '4px' }}>{msg.author}</div>
            <div style={{ color: '#ccc', fontSize: '14px' }}>{msg.text}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '5px' }}>
        <input 
          style={{ flex: 1, padding: '8px', background: '#3c3c3c', color: '#fff', border: '1px solid #555' }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <button 
          onClick={handleSend}
          style={{ padding: '8px 12px', background: '#007acc', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Send
        </button>
      </div>
    </div>
  );
};
