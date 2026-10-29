import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Scissors, 
  Layers, 
  Film, 
  Music, 
  Clock, 
  Type, 
  Smartphone, 
  RotateCcw, 
  Plus, 
  X, 
  CheckCircle, 
  Wand2, 
  Cpu,
  ChevronDown
} from 'lucide-react';

const STARTER_PROMPTS = [
  {
    id: 'keep_best_takes',
    title: 'Keep the best takes',
    icon: Scissors,
    prompt: 'Tighten this edit. Keep the strongest takes, cut filler words and long silences, and leave a clean continuous cut.'
  },
  {
    id: 'sync_multicam',
    title: 'Sync my multicam',
    icon: Layers,
    prompt: 'Set up my multicam. Group the matching camera angles with their audio, verify sync, and leave it ready to switch.'
  },
  {
    id: 'generate_broll',
    title: 'Generate B-roll',
    icon: Film,
    prompt: 'Generate B-roll that fits this edit. Find moments that need cutaways, create matching shots, and place them where they support the story.'
  },
  {
    id: 'score_timeline',
    title: 'Score my timeline',
    icon: Music,
    prompt: 'Generate music for this timeline. Match the mood and length, then place it on an audio track synced to the edit.'
  },
  {
    id: 'cut_to_beat',
    title: 'Cut to the beat',
    icon: Clock,
    prompt: 'Assemble my clips to the beat of a song. Detect the beats and cut or place clips so the edit hits the rhythm.'
  },
  {
    id: 'add_captions',
    title: 'Add captions',
    icon: Type,
    prompt: 'Add captions to this timeline. Transcribe the dialogue, phrase it for readability, and place text clips locked to the speech.'
  },
  {
    id: 'make_vertical_shorts',
    title: 'Make vertical shorts',
    icon: Smartphone,
    prompt: 'Find the strongest moments in this video and turn each into a short-form vertical clip. Create multiple 9:16 timelines, reframe for vertical, and keep every clip tight and self-contained.'
  }
];

export default function AgentSidebar({ 
  onExecuteMcpAction,
  currentTime,
  clipsCount,
  onClose
}) {
  const [sessions, setSessions] = useState([
    { id: 'sess-1', name: 'Timeline Copilot', active: true },
    { id: 'sess-2', name: 'Color & B-Roll', active: false },
  ]);
  const [activeSessionId, setActiveSessionId] = useState('sess-1');

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('Claude 3.7 Sonnet (Thinking)');
  const [isProcessing, setIsProcessing] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'agent',
      text: 'Palmier Pro AI Copilot connected via REA MCP Engine. I have direct access to your timeline, tracks, media assets, and sequence geometry. What would you like me to edit or assemble?',
      actionCards: []
    }
  ]);

  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSendPrompt = (textToSend = inputPrompt) => {
    if (!textToSend.trim() || isProcessing) return;

    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: textToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsProcessing(true);

    // Simulate Agent Reasoning + MCP Tool Action Execution
    setTimeout(() => {
      let responseText = '';
      let actions = [];

      const query = textToSend.toLowerCase();
      if (query.includes('caption') || query.includes('transcribe')) {
        responseText = 'Analyzed dialogue track A1 using Whisper large-v3. Generated word-level locked captions and mapped them into Track T1.';
        actions.push({
          tool: 'timeline_insert_captions',
          description: 'Inserted 4 caption segments onto Track T1 with Viral Pop styling',
          type: 'ADD_TITLE',
          payload: { text: 'AI Video Editor Built For Agents' }
        });
      } else if (query.includes('b-roll') || query.includes('generate')) {
        responseText = 'Identified dialogue gap at playhead. Generated 4K neural cutaway footage and placed it onto Track V2 overlay.';
        actions.push({
          tool: 'timeline_insert_broll',
          description: 'Added Neural Matrix B-roll to Track V2 (duration: 4.5s)',
          type: 'ADD_BROLL'
        });
      } else if (query.includes('cut') || query.includes('split') || query.includes('tighten')) {
        responseText = 'Split clip at active playhead timestamp and removed 1.2s silence gap.';
        actions.push({
          tool: 'timeline_split_clip',
          description: `Split clip at timecode ${currentTime.toFixed(2)}s and aligned adjacent edges`,
          type: 'SPLIT_PLAYHEAD'
        });
      } else if (query.includes('score') || query.includes('music')) {
        responseText = 'Synthesized ambient cinematic electronic score at 120 BPM, placed on Audio Track A2 with 0.8s fade in.';
        actions.push({
          tool: 'timeline_score_music',
          description: 'Added Cyberpunk Ambient Stem to Track A2',
          type: 'SCORE_MUSIC'
        });
      } else {
        responseText = `Executed automated editing sequence using ${selectedModel}. Inspected ${clipsCount} active clips and updated color balance.`;
        actions.push({
          tool: 'timeline_set_color',
          description: 'Applied Lumetri Film LUT (Exposure +5, Contrast +25, Saturation +35)',
          type: 'APPLY_COLOR_GRADE'
        });
      }

      // Dispatch real action to timeline
      actions.forEach((act) => onExecuteMcpAction(act));

      const agentMsg = {
        id: `msg-agent-${Date.now()}`,
        sender: 'agent',
        text: responseText,
        actionCards: actions
      };

      setMessages((prev) => [...prev, agentMsg]);
      setIsProcessing(false);
    }, 1100);
  };

  return (
    <aside className="palmier-agent-sidebar">
      {/* 1. Header with Session Tabs matching AgentPanelView.swift */}
      <div className="agent-sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
          <Bot size={15} color="var(--accent-blue)" />
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>Palmier AI Copilot</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="mcp-status-pill">
            <span className="mcp-status-dot" />
            <span>REA MCP ALIGNED</span>
          </div>
          {onClose && (
            <button className="btn-icon" onClick={onClose} style={{ width: '22px', height: '22px' }}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Session tabs bar */}
      <div className="agent-sessions-bar">
        {sessions.map((s) => (
          <div 
            key={s.id}
            className={`agent-session-tab ${s.id === activeSessionId ? 'active' : ''}`}
            onClick={() => setActiveSessionId(s.id)}
          >
            <span>{s.name}</span>
          </div>
        ))}
        <button 
          className="btn-icon" 
          style={{ width: '20px', height: '20px' }}
          onClick={() => {
            const newS = { id: `sess-${Date.now()}`, name: `Task ${sessions.length + 1}` };
            setSessions((p) => [...p, newS]);
            setActiveSessionId(newS.id);
          }}
        >
          <Plus size={11} />
        </button>
      </div>

      {/* 2. Chat Conversation History */}
      <div className="agent-chat-history">
        {messages.map((m) => (
          <div key={m.id} className={`agent-message-row ${m.sender}`}>
            <div className="agent-message-bubble">
              <div className="agent-message-header">
                <span className="agent-message-author">{m.sender === 'agent' ? 'Palmier Agent' : 'You'}</span>
              </div>
              <p className="agent-message-text">{m.text}</p>

              {/* Tool Execution Cards */}
              {m.actionCards && m.actionCards.length > 0 && (
                <div className="agent-action-cards-container">
                  {m.actionCards.map((card, cIdx) => (
                    <div key={cIdx} className="agent-action-card">
                      <div className="agent-action-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle size={12} color="var(--accent-emerald)" />
                          <span style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--accent-blue)' }}>
                            {card.tool}()
                          </span>
                        </div>
                        <button 
                          className="btn-icon" 
                          style={{ fontSize: '9px', padding: '2px 6px', height: 'auto', gap: '3px' }}
                          title="Undo this action"
                          onClick={() => {
                            // Undo action
                          }}
                        >
                          <RotateCcw size={9} />
                          <span>Undo</span>
                        </button>
                      </div>
                      <div className="agent-action-card-desc">
                        {card.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="agent-message-row agent">
            <div className="agent-message-bubble" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="thinking-dots">
                <span />
                <span />
                <span />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Reasoning through timeline edits...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Starter Prompt Suggestions Grid matching PalmierPro AgentPanelView.swift */}
      {messages.length <= 2 && (
        <div className="agent-starters-section">
          <div style={{ fontSize: '10px', color: 'var(--text-disabled)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>
            Suggested AI Workflows
          </div>
          <div className="agent-starters-scroll">
            {STARTER_PROMPTS.map((starter) => {
              const Icon = starter.icon;
              return (
                <button
                  key={starter.id}
                  className="agent-starter-chip"
                  onClick={() => handleSendPrompt(starter.prompt)}
                >
                  <Icon size={11} color="var(--accent-blue)" />
                  <span>{starter.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Model Selection & Input Box */}
      <div className="agent-input-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', color: 'var(--text-muted)' }}>
            <Cpu size={11} />
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--text-secondary)', 
                fontSize: '10.5px', 
                padding: '2px', 
                cursor: 'pointer' 
              }}
            >
              <option value="Claude 3.7 Sonnet (Thinking)" style={{ background: '#1c1c1e' }}>Claude 3.7 Sonnet (Thinking)</option>
              <option value="GPT-4o Omnimodal" style={{ background: '#1c1c1e' }}>GPT-4o Omnimodal</option>
              <option value="Palmier Native Local Agent" style={{ background: '#1c1c1e' }}>Palmier Native Local Agent</option>
            </select>
          </div>

          <div style={{ fontSize: '10px', color: 'var(--text-disabled)' }}>
            Shift+Enter for newline
          </div>
        </div>

        <div className="agent-input-box">
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendPrompt();
              }
            }}
            placeholder="Instruct Palmier Agent (e.g. 'Cut silent gaps', 'Add kinetic captions', 'Score timeline')..."
            rows={2}
          />

          <button 
            className="agent-send-btn"
            onClick={() => handleSendPrompt()}
            disabled={!inputPrompt.trim() || isProcessing}
            title="Send prompt to Palmier Copilot"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
