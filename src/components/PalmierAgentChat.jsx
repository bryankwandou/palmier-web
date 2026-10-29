import React, { useState } from 'react';
import { X, Plus, Clock, ChevronDown, CheckCircle2 } from 'lucide-react';
import { AGENT_CHAT_HISTORY } from '../data/palmierSourceData';

export default function PalmierAgentChat({ onAgentToolCall }) {
  const [messages, setMessages] = useState(AGENT_CHAT_HISTORY);
  const [inputVal, setInputVal] = useState('');

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const shotNum = `${messages.filter(m => !m.isAgent).length + 19}`;
    const newMsg = {
      id: `user-${Date.now()}`,
      number: shotNum,
      title: inputVal.slice(0, 40),
      prompt: inputVal
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');

    // Trigger tool execution via PalmierMcpEngine
    setTimeout(() => {
      if (onAgentToolCall) {
        onAgentToolCall('add_clips', {
          name: `shot_${shotNum}`,
          prompt: inputVal,
          thumb: '/tour-hero.jpg',
          duration: 3.0
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          isAgent: true,
          toolExecuted: 'add_clips',
          text: `Executed add_clips tool: Generated shot sequence matching prompt and inserted into Track V1.`
        }
      ]);
    }, 800);
  };

  const handleShotClick = (shot) => {
    if (onAgentToolCall) {
      onAgentToolCall('apply_color', {
        clipName: shot.title,
        solarize: true,
        grain: true
      });
    }
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
                {item.toolExecuted && (
                  <div className="agent-tool-badge">
                    <CheckCircle2 size={10} className="tool-check" />
                    <span>MCP: {item.toolExecuted}</span>
                  </div>
                )}
                <p>{item.text}</p>
              </div>
            );
          }

          return (
            <div 
              key={item.id} 
              className="native-agent-shot-item interactive-shot"
              onClick={() => handleShotClick(item)}
              title="Click to apply shot styling via MCP"
            >
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
