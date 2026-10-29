/**
 * Palmier Pro Official MCP Server
 * Exposes http://127.0.0.1:19789/mcp for Claude Code, Codex, and Cursor
 */

import http from 'node:http';

const PORT = 19789;
const PROTOCOL_VERSION = '2025-06-18';

const TIMELINE_STATE = {
  project: {
    name: 'Aesthetic video',
    fps: 24,
    resolution: '1920x1080',
    durationSeconds: 33.541
  },
  tracks: [
    {
      id: 'V1',
      type: 'video',
      clips: [
        { id: 'v-clip-1', name: 'juicyma', startTime: 0, duration: 2.2, thumb: '/welcome-butterfly.jpg' },
        { id: 'v-clip-2', name: 'juicyma', startTime: 2.2, duration: 2.3, thumb: '/tour-hero.jpg' },
        { id: 'v-clip-3', name: 'juicyma', startTime: 4.5, duration: 2.1, thumb: '/welcome-butterfly.jpg' },
        { id: 'v-clip-4', name: 'juicyma', startTime: 6.6, duration: 2.5, thumb: '/welcome-butterfly.jpg' }
      ]
    },
    { id: 'A1', type: 'audio', label: 'Audio Master L/R' },
    { id: 'A2', type: 'audio', label: 'Ambience / SFX' }
  ],
  markers: [
    { id: 'm-1', name: 'Shot 19 Start', frame: 191, color: '#f59e0b' }
  ]
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, MCP-Protocol-Version, Mcp-Session-Id');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/mcp' || req.url === '/') {
    if (req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      res.write(`data: ${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} })}\n\n`);
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const json = JSON.parse(body);
          const { id, method, params } = json;

          let responseResult = {};

          if (method === 'initialize') {
            responseResult = {
              protocolVersion: PROTOCOL_VERSION,
              capabilities: { tools: { listChanged: true } },
              serverInfo: { name: 'palmier-pro', version: '0.7.6' }
            };
          } else if (method === 'tools/list') {
            responseResult = {
              tools: [
                {
                  name: 'get_timeline',
                  description: 'Returns project settings, tracks, clips, and review markers.',
                  inputSchema: { type: 'object', properties: {} }
                },
                {
                  name: 'inspect_timeline',
                  description: 'Inspect composited video frame at current frame.',
                  inputSchema: { type: 'object', properties: { startFrame: { type: 'integer' } } }
                },
                {
                  name: 'add_clips',
                  description: 'Adds clips to the timeline.',
                  inputSchema: { type: 'object', properties: { trackId: { type: 'string' }, name: { type: 'string' } } }
                },
                {
                  name: 'split_clips',
                  description: 'Splits clip at specified frame or timecode.',
                  inputSchema: { type: 'object', properties: { clipId: { type: 'string' }, splitTime: { type: 'number' } } }
                },
                {
                  name: 'generate_video',
                  description: 'Generates AI video clips with Seedance 2 or Kling.',
                  inputSchema: { type: 'object', properties: { prompt: { type: 'string' }, model: { type: 'string' } } }
                }
              ]
            };
          } else if (method === 'tools/call') {
            const toolName = params?.name;
            const args = params?.arguments || {};

            if (toolName === 'get_timeline') {
              responseResult = { content: [{ type: 'text', text: JSON.stringify(TIMELINE_STATE) }] };
            } else if (toolName === 'add_clips') {
              const newClip = {
                id: `v-clip-${Date.now()}`,
                name: args.name || 'juicyma',
                startTime: 8.0,
                duration: 2.5,
                thumb: '/welcome-butterfly.jpg'
              };
              TIMELINE_STATE.tracks[0].clips.push(newClip);
              responseResult = { content: [{ type: 'text', text: JSON.stringify({ status: 'added', clip: newClip }) }] };
            } else {
              responseResult = { content: [{ type: 'text', text: JSON.stringify({ status: 'executed', tool: toolName }) }] };
            }
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ jsonrpc: '2.0', id, result: responseResult }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' } }));
        }
      });
      return;
    }
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Palmier Pro MCP Server running at http://127.0.0.1:${PORT}/mcp`);
});
