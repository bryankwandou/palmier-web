import React, { useState } from 'react';
import { Terminal, Send, CheckCircle, Code2, Bot, Scissors, Sparkles, SlidersHorizontal } from 'lucide-react';

export default function MCPAgentConsole({ 
  onExecuteMcpAction,
  currentTime,
  clipsCount
}) {
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState([
    {
      id: 1,
      type: 'system',
      timestamp: '00:00:01',
      text: 'Palmier Pro MCP Server initialized at http://127.0.0.1:19789/mcp (HTTP JSON-RPC 2.0). Agent session active.',
    },
    {
      id: 2,
      type: 'agent',
      timestamp: '00:00:02',
      text: 'mcp.tools/list: 32 timeline manipulation tools discovered.',
    }
  ]);

  const handleSendCommand = (textToSend) => {
    const query = textToSend || command;
    if (!query.trim()) return;

    const newLogs = [
      ...logs,
      {
        id: Date.now(),
        type: 'user',
        timestamp: new Date().toLocaleTimeString().slice(3, 8),
        text: query,
      }
    ];

    // Evaluate MCP action
    const lower = query.toLowerCase();
    let rpcResponse = '';

    if (lower.includes('split') || lower.includes('cut')) {
      onExecuteMcpAction({ type: 'SPLIT_PLAYHEAD' });
      rpcResponse = `JSON-RPC 2.0: timeline_split_clip(time=${currentTime.toFixed(2)}) => OK (Result: 2 segments created)`;
    } else if (lower.includes('color') || lower.includes('grade') || lower.includes('cyberpunk')) {
      onExecuteMcpAction({ type: 'APPLY_COLOR_GRADE', preset: 'cyberpunk' });
      rpcResponse = `JSON-RPC 2.0: timeline_set_color(contrast=25, saturation=35, tint="#00f3ff") => OK`;
    } else if (lower.includes('title') || lower.includes('caption') || lower.includes('text')) {
      onExecuteMcpAction({ type: 'ADD_TITLE', text: 'AI GENERATED SCENE BREAK' });
      rpcResponse = `JSON-RPC 2.0: timeline_add_text_clip(text="AI GENERATED SCENE BREAK", track="T1") => OK`;
    } else if (lower.includes('delete') || lower.includes('remove')) {
      onExecuteMcpAction({ type: 'DELETE_SELECTED' });
      rpcResponse = `JSON-RPC 2.0: timeline_delete_clip(target="selected") => OK`;
    } else {
      rpcResponse = `JSON-RPC 2.0: agent_query_status(clips=${clipsCount}, playhead=${currentTime.toFixed(2)}s) => Status: Ready`;
    }

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'rpc',
          timestamp: new Date().toLocaleTimeString().slice(3, 8),
          text: rpcResponse,
        }
      ]);
    }, 200);

    setCommand('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--accent-emerald)' }}>
          <Bot size={15} />
          <span>MCP Agent Protocol Console</span>
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>JSON-RPC 2.0</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        <button
          onClick={() => handleSendCommand('Split active clip at playhead')}
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '10px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Scissors size={10} color="var(--accent-rose)" />
          <span>Split at Playhead</span>
        </button>

        <button
          onClick={() => handleSendCommand('Apply Cyberpunk Color Grade')}
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '10px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <SlidersHorizontal size={10} color="var(--accent-blue)" />
          <span>Grade Cyberpunk</span>
        </button>

        <button
          onClick={() => handleSendCommand('Add Title: AI GENERATED SCENE BREAK')}
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '10px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Sparkles size={10} color="var(--accent-purple)" />
          <span>Insert Title Overlay</span>
        </button>
      </div>

      <div 
        style={{
          flex: 1,
          background: '#040507',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px',
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {logs.map((log) => (
          <div key={log.id} style={{ lineHeight: '1.4' }}>
            <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>[{log.timestamp}]</span>
            {log.type === 'system' && <span style={{ color: 'var(--accent-emerald)' }}>{log.text}</span>}
            {log.type === 'agent' && <span style={{ color: 'var(--accent-blue)' }}>{log.text}</span>}
            {log.type === 'user' && <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>&gt; {log.text}</span>}
            {log.type === 'rpc' && <span style={{ color: 'var(--accent-purple)' }}>{log.text}</span>}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        <input 
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
          placeholder="Instruct MCP agent (e.g. 'split at 4s', 'add title')..."
          style={{
            flex: 1,
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            outline: 'none',
            fontFamily: 'var(--font-sans)',
          }}
        />
        <button
          onClick={() => handleSendCommand()}
          style={{
            background: 'var(--accent-blue)',
            border: 'none',
            color: '#fff',
            padding: '0 12px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}
