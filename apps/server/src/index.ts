import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { customAlphabet } from 'nanoid';
// @ts-ignore
import utils from 'y-websocket/bin/utils';
import { ClientEvent, ServerEvent } from '@collabcode/protocol';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
const PORT = process.env.PORT || 3002;

interface UserPresence {
  id: string;
  name: string;
  color: string;
  status: 'online' | 'typing' | 'idle' | 'offline';
  activeFile: string;
  socket?: WebSocket;
}

interface ChatMessage {
  id: string;
  sender: string;
  senderColor: string;
  text: string;
  timestamp: number;
}

interface ActivityLog {
  id: string;
  type: string;
  text: string;
  timestamp: number;
}

interface Room {
  id: string;
  masterId: string;
  language: string;
  theme: string;
  users: Map<string, UserPresence>;
  chat: ChatMessage[];
  activity: ActivityLog[];
  locked: boolean;
  readOnly: boolean;
  password?: string;
  accentColor: string;
  createdAt: number;
  gcTimer?: NodeJS.Timeout;
}

const rooms = new Map<string, Room>();

const app = express();
app.use(cors());
app.use(express.json());

// Express REST API
app.get('/api/rooms/:id', (req, res) => {
  const roomId = req.params.id.toUpperCase();
  const userId = req.query.userId as string;
  const room = rooms.get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const isAuthorized = userId === room.masterId || room.users.has(userId || '');
  if (room.locked && !isAuthorized) {
    return res.status(403).json({ error: 'Room is locked', locked: true });
  }

  res.json({
    id: room.id,
    language: room.language,
    theme: room.theme,
    locked: room.locked,
    readOnly: room.readOnly,
    passwordRequired: !!room.password,
    accentColor: room.accentColor,
    createdAt: room.createdAt
  });
});

app.post('/api/rooms', (req, res) => {
  const { language, theme, password } = req.body;
  const roomId = nanoid();
  const masterId = nanoid();
  const accentColor = generateAccentColor(roomId);

  const newRoom: Room = {
    id: roomId,
    masterId,
    language: language || 'javascript',
    theme: theme || 'vs-dark',
    users: new Map(),
    chat: [],
    activity: [],
    locked: false,
    readOnly: false,
    password: password || undefined,
    accentColor,
    createdAt: Date.now()
  };

  newRoom.activity.push({
    id: nanoid(),
    type: 'create',
    text: `Room created with language: ${newRoom.language}`,
    timestamp: Date.now()
  });

  rooms.set(roomId, newRoom);
  console.log(`[Server] Room created: ${roomId} with accent: ${accentColor} and master: ${masterId}`);

  res.status(201).json({
    id: roomId,
    masterId,
    language: newRoom.language,
    theme: newRoom.theme,
    accentColor,
    passwordRequired: !!newRoom.password
  });
});

app.post('/api/rooms/:id/verify-password', (req, res) => {
  const roomId = req.params.id.toUpperCase();
  const { password } = req.body;
  const room = rooms.get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  if (room.password === password) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Helper: HSL vibrant accent generator
function generateAccentColor(roomId: string): string {
  let hash = 0;
  for (let i = 0; i < roomId.length; i++) {
    hash = roomId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 85%, 60%)`;
}

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws: WebSocket, req) => {
  const urlParams = new URL(req.url || '', `http://${req.headers.host}`);
  const pathname = urlParams.pathname;
  const roomId = pathname.split('/').pop()?.toUpperCase() || '';
  const username = urlParams.searchParams.get('username') || 'Guest Coder';
  const color = urlParams.searchParams.get('color') || '#3B82F6';

  const room = rooms.get(roomId);
  if (!room) {
    ws.close(4004, 'Room not found');
    return;
  }

  // Cancel GC timer if anyone connects
  if (room.gcTimer) {
    clearTimeout(room.gcTimer);
    room.gcTimer = undefined;
    console.log(`[Server] GC cancelled for room: ${roomId}`);
  }

  // Route 1: Yjs sync connection
  if (pathname.startsWith('/sync/')) {
    const userId = urlParams.searchParams.get('userId') || '';
    const isAuthorized = userId === room.masterId || room.users.has(userId);
    if (room.locked && !isAuthorized) {
      ws.close(4003, 'Room is locked');
      return;
    }

    utils.setupWSConnection(ws, req, { docName: roomId, gc: true });
    ws.on('close', () => {
      checkRoomPrune(room);
    });
    return;
  }

  // Route 2: Custom control presence connection
  const userId = urlParams.searchParams.get('userId') || nanoid();
  const isAuthorized = userId === room.masterId || room.users.has(userId);
  if (room.locked && !isAuthorized) {
    ws.close(4003, 'Room is locked');
    return;
  }

  let presence = room.users.get(userId);

  if (presence) {
    presence.socket = ws;
    presence.status = 'online';
    presence.name = username;
    presence.color = color;
    console.log(`[Server WebSocket] User reconnected to room ${roomId}: ${username} (${userId})`);
    logActivity(room, 'join', `${username} reconnected to the session`);
  } else {
    presence = {
      id: userId,
      name: username,
      color,
      status: 'online',
      activeFile: 'workspace',
      socket: ws
    };
    room.users.set(userId, presence);
    console.log(`[Server WebSocket] User joined room ${roomId}: ${username} (${userId})`);
    logActivity(room, 'join', `${username} joined the session`);
  }

  // Broadcast presence & logs
  broadcastRoomState(room);

  ws.on('message', async (data, isBinary) => {
    if (isBinary) return; // Handled by Yjs WS connection automatically

    try {
      const msg = JSON.parse(data.toString());
      const user = room.users.get(userId);
      if (!user) return;

      switch (msg.type) {
        case ClientEvent.PRESENCE_STATUS:
          user.status = msg.status;
          broadcastRoomState(room);
          break;
        case ClientEvent.CHAT_MESSAGE:
          const chatMsg: ChatMessage = {
            id: nanoid(),
            sender: user.name,
            senderColor: user.color,
            text: msg.text,
            timestamp: Date.now()
          };
          room.chat.push(chatMsg);
          broadcastMessage(room, { type: ServerEvent.ROOM_CHAT_UPDATE, chat: room.chat });
          break;
        case ClientEvent.SETTINGS_CHANGE:
          if (user.id !== room.masterId) {
            console.warn(`[Server Security] Rejecting settings change from non-master user: ${user.name}`);
            break;
          }
          if (msg.language !== undefined) {
            room.language = msg.language;
            logActivity(room, 'settings', `Language changed to ${msg.language}`);
          }
          if (msg.theme !== undefined) {
            room.theme = msg.theme;
            logActivity(room, 'settings', `Theme changed to ${msg.theme}`);
          }
          if (msg.readOnly !== undefined) {
            room.readOnly = msg.readOnly;
            logActivity(room, 'settings', `Room read-only mode ${msg.readOnly ? 'enabled' : 'disabled'}`);
          }
          if (msg.locked !== undefined) {
            room.locked = msg.locked;
            logActivity(room, 'settings', `Room lock ${msg.locked ? 'enabled' : 'disabled'}`);
          }
          if (msg.password !== undefined) {
            room.password = msg.password || undefined;
            logActivity(room, 'settings', `Room password security updated`);
          }
          broadcastRoomState(room);
          break;
        case ClientEvent.RUN_CODE:
          handleCodeExecution(room, ws, msg.source, msg.language, msg.stdin);
          break;
      }
    } catch (e) {
      // Ignore invalid JSON messages
    }
  });

  ws.on('close', () => {
    const user = room.users.get(userId);
    if (user && user.socket === ws) {
      user.socket = undefined;
      user.status = 'offline';
      console.log(`[Server WebSocket] User offline in room ${roomId}: ${user.name}`);
      logActivity(room, 'leave', `${user.name} went offline`);
    }

    checkRoomPrune(room);
    broadcastRoomState(room);
  });
});

function checkRoomPrune(room: Room) {
  const hasActiveSockets = Array.from(room.users.values()).some(u => u.socket !== undefined);
  if (!hasActiveSockets) {
    if (!room.gcTimer) {
      console.log(`[Server GC] Room ${room.id} empty. Starting 60s GC prune timer...`);
      room.gcTimer = setTimeout(() => {
        const stillEmpty = Array.from(room.users.values()).every(u => u.socket === undefined);
        if (stillEmpty) {
          rooms.delete(room.id);
          console.log(`[Server GC] Room ${room.id} pruned successfully.`);
        }
      }, 60000);
    }
  }
}

function logActivity(room: Room, type: string, text: string) {
  room.activity.push({
    id: nanoid(),
    type,
    text,
    timestamp: Date.now()
  });
}

function broadcastRoomState(room: Room) {
  const usersList = Array.from(room.users.values()).map(u => ({
    id: u.id,
    name: u.name,
    color: u.color,
    status: u.status,
    activeFile: u.activeFile,
    isMaster: u.id === room.masterId
  }));

  const statePayload = {
    type: ServerEvent.ROOM_STATE_UPDATE,
    roomId: room.id,
    language: room.language,
    theme: room.theme,
    locked: room.locked,
    readOnly: room.readOnly,
    accentColor: room.accentColor,
    users: usersList,
    activity: room.activity,
    chat: room.chat
  };
  broadcastMessage(room, statePayload);
}

function broadcastMessage(room: Room, payload: any) {
  const data = JSON.stringify(payload);
  for (const user of room.users.values()) {
    if (user.socket && user.socket.readyState === WebSocket.OPEN) {
      user.socket.send(data);
    }
  }
}

// Wandbox compilers caching
let wandboxCompilers: { name: string; language: string }[] = [];

async function fetchWandboxCompilers() {
  try {
    const res = await fetch('https://wandbox.org/api/list.json');
    if (res.ok) {
      wandboxCompilers = await res.json() as any;
      console.log(`[Server] Loaded ${wandboxCompilers.length} compilers from Wandbox.`);
    }
  } catch (err) {
    console.error('[Server] Failed to fetch Wandbox compiler list:', err);
  }
}

fetchWandboxCompilers();
setInterval(fetchWandboxCompilers, 6 * 60 * 60 * 1000);

function getWandboxCompiler(lang: string): string {
  let targetLang = lang.toLowerCase();
  let matchKey = '';
  switch (targetLang) {
    case 'javascript':
      matchKey = 'javascript';
      break;
    case 'typescript':
      matchKey = 'typescript';
      break;
    case 'python':
      matchKey = 'python';
      break;
    case 'cpp':
      matchKey = 'c++';
      break;
    case 'go':
      matchKey = 'go';
      break;
    case 'rust':
      matchKey = 'rust';
      break;
    case 'java':
      matchKey = 'java';
      break;
    default:
      matchKey = targetLang;
  }

  const matches = wandboxCompilers.filter(c => c.language.toLowerCase() === matchKey);
  if (matches.length > 0) {
    const stableMatch = matches.find(c => !c.name.includes('head'));
    if (stableMatch) {
      return stableMatch.name;
    }
    return matches[0].name;
  }

  // Fallback defaults
  switch (targetLang) {
    case 'javascript':
      return 'nodejs-20.17.0';
    case 'typescript':
      return 'typescript-5.6.2';
    case 'python':
      return 'cpython-3.12.7';
    case 'cpp':
      return 'gcc-13.2.0';
    case 'go':
      return 'go-1.23.2';
    case 'rust':
      return 'rust-1.82.0';
    case 'java':
      return 'openjdk-jdk-22+36';
    default:
      return '';
  }
}

async function handleCodeExecution(room: Room, ws: WebSocket, source: string, language: string, stdin?: string) {
  broadcastMessage(room, {
    type: ServerEvent.CODE_EXECUTION_LOG,
    text: `⚡ Running code via Wandbox sandbox compiler proxy...\n`
  });

  logActivity(room, 'run', `Source code execution triggered (${language})`);

  const compiler = getWandboxCompiler(language);
  if (!compiler) {
    broadcastMessage(room, {
      type: ServerEvent.CODE_EXECUTION_LOG,
      text: `❌ Unsupported compiler language: ${language}\n`
    });
    return;
  }

  try {
    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler,
        code: source,
        stdin: stdin || ''
      })
    });

    if (!response.ok) {
      throw new Error(`Wandbox API returned HTTP ${response.status}`);
    }

    const result = (await response.json()) as any;
    
    let output = '';
    if (result.compiler_message) {
      output += result.compiler_message + '\n';
    }
    if (result.program_output) {
      output += result.program_output;
    }
    if (result.program_error) {
      output += result.program_error;
    }
    
    if (!output) {
      output = '[No output returned]\n';
    }
    
    const exitCode = typeof result.status === 'number' ? result.status : parseInt(result.status, 10);
    const isSuccess = exitCode === 0;
    const duration = `\n✨ Done in ${isSuccess ? 'success' : 'failure'} (Code ${isNaN(exitCode) ? 0 : exitCode})`;

    broadcastMessage(room, {
      type: ServerEvent.CODE_EXECUTION_LOG,
      text: output + duration + '\n'
    });
  } catch (err: any) {
    broadcastMessage(room, {
      type: ServerEvent.CODE_EXECUTION_LOG,
      text: `❌ Execution Error: ${err.message}\n`
    });
  }
}

// Upgrade HTTP Server to WebSockets
server.on('upgrade', (request, socket, head) => {
  const parsedUrl = parse(request.url || '', true);
  const pathname = parsedUrl.pathname || '';

  if (pathname.startsWith('/room/') || pathname.startsWith('/sync/')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

function parse(url: string, parseQueryString: boolean) {
  const u = new URL(url, 'http://localhost');
  return {
    pathname: u.pathname,
    query: Object.fromEntries(u.searchParams.entries())
  };
}

server.listen(PORT, () => {
  console.log(`[Server] Server active on port ${PORT}`);
});
