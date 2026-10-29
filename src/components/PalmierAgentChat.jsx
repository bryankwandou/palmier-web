import React, { useState } from 'react';
import { X, Plus, Clock, ChevronDown, Send } from 'lucide-react';
import { AGENT_CHAT_HISTORY } from '../data/palmierSourceData';

export default function PalmierAgentChat({ onAgentAction }) {
  const [messages, setMessages] = useState(AGENT_CHAT_HISTORY);
  const [inputVal, setInputVal] = useState('');

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const newMsg = {
      id: `user-${Date.now()}`,
      number: `${messages.length + 19}`,
      title: inputVal,
      prompt: inputVal
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          isAgent: true,
          text: `Generated shot sequence matching prompt and inserted into Track V1.`
        }
      ]);
      if (onAgentAction) onAgentAction();
    }, 1000);
  };

  return (
    <div className="palmier-native-agent-chat">
      {/* Top Session Tabs Bar */}
      <div className="native-agent-tabs-bar">
        <div className="native-agent-tab active">
          <span className="tab-title">@Screenshot-2026-05-...</span>
          <button className="tab-close-icon"><X size={10} /></button>
        </div>

        <div className="native-agent-tab">
          <span className="tab-title">gene</span>
        </div>

        <button className="native-tab-action-btn" title="New Session">
          <Plus size={12} />
        </button>

        <button className="native-tab-action-btn" title="History" style={{ marginLeft: 'auto' }}>
          <Clock size={12} />
        </button>
      </div>

      {/* Chat Messages Feed */}
      <div className="native-agent-feed">
        {messages.map((item) => {
          if (item.isAgent) {
            return (
              <div key={item.id} className="native-agent-response-bubble">
                <p>{item.text}</p>
              </div>
            );
          }

          return (
            <div key={item.id} className="native-agent-shot-item">
              <div className="shot-header">
                <span className="shot-number">{item.number}.</span>
                <span className="shot-title">{item.title}</span>
              </div>
              <p className="shot-prompt-text">{item.prompt}</p>
            </div>
          );
        })}
      </div>

      {/* Bottom Input Box */}
      <div className="native-agent-input-container">
        <div className="native-agent-pill-input">
          <input 
            type="text" 
            placeholder="Ask, or type @ to reference media"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <button className="scroll-down-btn" onClick={handleSend} title="Send or scroll down">
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
