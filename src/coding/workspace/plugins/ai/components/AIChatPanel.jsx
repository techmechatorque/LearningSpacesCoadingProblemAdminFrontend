import React, { useState, useEffect } from 'react';

export const AIChatPanel = ({ pluginApi, providerManager, contextManager, promptManager, conversationManager, actionManager, toolManager }) => {
  const [messages, setMessages] = useState(conversationManager.getMessages());
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Re-render when messages change
  const refreshMessages = () => setMessages([...conversationManager.getMessages()]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    // 1. Add User Message
    conversationManager.addMessage('user', input);
    refreshMessages();
    setInput('');
    setIsTyping(true);

    try {
      // 2. Add empty AI Message for streaming
      const aiMsg = conversationManager.addMessage('ai', '');
      refreshMessages();

      const provider = providerManager.getProvider();
      const context = contextManager.getWorkspaceContext();
      const tools = toolManager.getTools();
      const allMessages = conversationManager.getMessages();

      // 3. Stream Completion
      await provider.streamCompletion(
        allMessages, 
        context, 
        tools, 
        (chunk) => {
          aiMsg.content += chunk;
          refreshMessages();
        },
        (toolCall) => {
          actionManager.handleToolCall(toolCall);
        }
      );
    } catch (e) {
      console.error(e);
      conversationManager.addMessage('system', 'Error communicating with AI Provider.');
      refreshMessages();
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '10px', boxSizing: 'border-box' }}>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ 
            marginBottom: '10px', 
            padding: '10px', 
            borderRadius: '4px',
            background: msg.role === 'user' ? '#007acc' : (msg.role === 'ai' ? '#252526' : '#555'),
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>
              {msg.role === 'user' ? 'You' : (msg.role === 'ai' ? 'Assistant' : 'System')}
            </div>
            <div style={{ color: '#fff', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && <div style={{ color: '#888', fontSize: '12px' }}>Assistant is typing...</div>}
      </div>
      
      <div style={{ display: 'flex', gap: '5px' }}>
        <input 
          style={{ flex: 1, padding: '10px', background: '#3c3c3c', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI Assistant..."
          disabled={isTyping}
        />
        <button 
          onClick={handleSend}
          disabled={isTyping}
          style={{ padding: '10px 16px', background: isTyping ? '#555' : '#007acc', color: '#fff', border: 'none', borderRadius: '4px', cursor: isTyping ? 'default' : 'pointer' }}
        >
          Send
        </button>
      </div>
    </div>
  );
};
