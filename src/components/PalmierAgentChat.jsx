import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Clock, 
  ChevronDown, 
  CheckCircle2, 
  Sparkles, 
  Scissors, 
  Palette, 
  Type, 
  Film,
  Send
} from 'lucide-react';
import { AGENT_CHAT_HISTORY } from '../data/palmierSourceData';

export default function PalmierAgentChat({ onAgentToolCall }) {
  const [messages, setMessages] = useState(AGENT_CHAT_HISTORY);
  const [inputVal, setInputVal] = useState('');

  const quickPrompts = [
    { label: 'Split at Playhead (⌘K)', cmd: 'split clip at playhead' },
    { label: 'Apply Kodak 2383 LUT', cmd: 'apply kodak 2383 color grade' },
    { label: 'Add 16mm Film Grain', cmd: 'add 16mm grain' },
    { label: 'Solarize Sabattier Shot', cmd: 'apply sabattier solarize effect' },
    { label: 'Insert T1 Caption', cmd: 'add title "IRIDESCENT SCALES // 8K"' }
  ];

  const processAgentCommand = (rawText) => {
    const text = rawText.trim();
    if (!text) return;

    const shotNum = `${messages.filter(m => !m.isAgent).length + 19}`;
    const newMsg = {
      id: `user-${Date.now()}`,
      number: shotNum,
      title: text.slice(0, 36),
      prompt: text
    };
    setMessages(prev => [...prev, newMsg]);
    setInputVal('');

    const lower = text.toLowerCase();
    setTimeout(() => {
      let toolName = 'add_clips';
      let toolArgs = {};
      let responseText = '';

      if (lower.includes('split') || lower.includes('cut') || lower.includes('slice')) {
        toolName = 'split_clip';
        toolArgs = { time: 'playhead' };
        responseText = `Executed split_clip tool at current playhead. Clip segmented with clean cut.`;
      } else if (lower.includes('solarize') || lower.includes('sabattier')) {
        toolName = 'apply_color';
        toolArgs = { solarize: true, grain: true };
        responseText = `Executed apply_color tool: Sabattier differential solarization shader applied with 16mm grain.`;
      } else if (lower.includes('grain') || lower.includes('16mm')) {
        toolName = 'apply_color';
        toolArgs = { grain: true, solarize: false };
        responseText = `Executed apply_color tool: Kodak Tri-X 16mm organic grain active.`;
      } else if (lower.includes('kodak') || lower.includes('lut') || lower.includes('color')) {
        toolName = 'apply_color';
        toolArgs = { exposure: 0.1, contrast: 1.3, saturation: 1.2 };
        responseText = `Executed apply_color tool: Kodak 2383 Print LUT loaded into shader pipeline.`;
      } else if (lower.includes('title') || lower.includes('text') || lower.includes('caption')) {
        toolName = 'add_text_clip';
        const match = text.match(/["'](.*?)["']/);
        const titleText = match ? match[1] : 'CINEMATIC SEQUENCE';
        toolArgs = { text: titleText, trackId: 'T1', duration: 4.0 };
        responseText = `Executed add_text_clip tool: Created title overlay "${titleText}" on Track T1.`;
      } else {
        toolName = 'add_clips';
        toolArgs = {
          name: `shot_${shotNum}`,
          prompt: text,
          thumb: '/welcome-butterfly.jpg',
          duration: 3.0
        };
        responseText = `Executed add_clips tool: Synthesized shot "${text.slice(0, 24)}" and inserted onto V1.`;
      }

      if (onAgentToolCall) {
        onAgentToolCall(toolName, toolArgs);
      }

      setMessages(prev => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          isAgent: true,
          toolExecuted: toolName,
          toolArgs,
          text: responseText
        }
      ]);
    }, 600);
  };

  return (
    <div className="palmier-native-agent-chat">
      {/* Top Session Tabs Bar */}
      <div className="native-agent-tabs-bar">
        <div className="native-agent-tab active">
          <span className="tab-title">@Sequence-Palmier-Pro</span>
          <button className="tab-close-icon"><X size={10} /></button>
        </div>

        <button className="native-tab-action-btn" title="New Session">
          <Plus size={12} />
        </button>

        <button className="native-tab-action-btn" title="History" style={{ marginLeft: 'auto' }}>
          <Clock size={12} />
        </button>
      </div>

      {/* Quick Tool Action Chips */}
      <div className="agent-quick-chips-row">
        {quickPrompts.map((q, idx) => (
          <button 
            key={idx} 
            className="agent-quick-chip"
            onClick={() => processAgentCommand(q.cmd)}
          >
            <span>{q.label}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Feed */}
      <div className="native-agent-feed">
        {messages.map((item) => {
          if (item.isAgent) {
            return (
              <div key={item.id} className="native-agent-response-bubble">
                {item.toolExecuted && (
                  <div className="agent-tool-badge">
                    <CheckCircle2 size={11} className="tool-check" />
                    <span className="badge-name">MCP: {item.toolExecuted}</span>
                  </div>
                )}
                <p className="response-text">{item.text}</p>
              </div>
            );
          }

          return (
            <div 
              key={item.id} 
              className="native-agent-shot-item interactive-shot"
              onClick={() => processAgentCommand(item.prompt)}
              title="Click to re-run tool command"
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
            placeholder="Ask AI Copilot (e.g. 'split clip', 'apply kodak lut')..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') processAgentCommand(inputVal);
            }}
          />
          <button 
            className="agent-send-btn" 
            onClick={() => processAgentCommand(inputVal)}
            title="Send prompt to Palmier Pro MCP Agent"
          >
            <Send size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
