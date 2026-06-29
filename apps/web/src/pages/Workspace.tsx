import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MessageSquare, History, Play, Copy, Code,
  Settings, Terminal, Check, Send, Sparkles, X, Lock
} from 'lucide-react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { ClientEvent, ServerEvent } from '@collabcode/protocol';
import { Canvas } from '../components/Canvas';
import { API_URL, WS_URL } from '../config';

interface UserPresence {
  id: string;
  name: string;
  color: string;
  status: 'online' | 'typing' | 'idle' | 'offline';
  isMaster?: boolean;
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

const COLLAB_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F97316', // Orange
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#EAB308'  // Yellow
];

const Workspace = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Username Gate States
  const [username, setUsername] = useState(sessionStorage.getItem('cc_username') || '');
  const [userColor, setUserColor] = useState(sessionStorage.getItem('cc_color') || COLLAB_COLORS[0]);
  const [isLobbyOpen, setIsLobbyOpen] = useState(!sessionStorage.getItem('cc_username'));
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [roomDetails, setRoomDetails] = useState<any>(null);

  // Connection & Room States
  const [users, setUsers] = useState<UserPresence[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [language, setLanguage] = useState('javascript');
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [isLocked, setIsLocked] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [accentColor, setAccentColor] = useState('#3B82F6');

  // UI Panels
  const [sidebarTab, setSidebarTab] = useState<'users' | 'chat' | 'activity'>('users');
  const [chatInput, setChatInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [programInput, setProgramInput] = useState('');
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isRoomLockedError, setIsRoomLockedError] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'canvas'>('code');

  // Mobile device constraints
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMobileCopied, setIsMobileCopied] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Draggable & Collapsible Layout States
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(180);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingTerminal, setIsResizingTerminal] = useState(false);

  const handleSidebarTabClick = (tab: 'users' | 'chat' | 'activity') => {
    if (sidebarTab === tab) {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    } else {
      setSidebarTab(tab);
      setIsSidebarCollapsed(false);
    }
  };

  const handleSidebarResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      if (newWidth < 120) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
        setSidebarWidth(Math.min(450, Math.max(160, newWidth)));
      }
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTerminalResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingTerminal(true);
    const startY = e.clientY;
    const startHeight = terminalHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newHeight = startHeight - (moveEvent.clientY - startY);
      if (newHeight < 60) {
        setIsTerminalOpen(false);
      } else {
        setIsTerminalOpen(true);
        setTerminalHeight(Math.min(400, Math.max(80, newHeight)));
      }
    };

    const handleMouseUp = () => {
      setIsResizingTerminal(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Refs
  const editorRef = useRef<any>(null);
  const providerRef = useRef<any>(null);
  const bindingRef = useRef<any>(null);
  const ydocRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const controlSocketRef = useRef<WebSocket | null>(null);
  const idleTimerRef = useRef<any | null>(null);
  const awarenessTimerRef = useRef<any | null>(null);

  const currentUserId = sessionStorage.getItem('cc_user_id');
  const localUserObj = users.find(u => u.id === currentUserId);
  const isMaster = localUserObj ? !!localUserObj.isMaster : false;

  // Fetch Room Info on Mount
  useEffect(() => {
    if (!roomId) return;
    const userId = sessionStorage.getItem('cc_user_id') || '';
    fetch(`${API_URL}/api/rooms/${roomId.toUpperCase()}?userId=${userId}`)
      .then(async res => {
        if (!res.ok) {
          if (res.status === 403) {
            setIsRoomLockedError(true);
          }
          throw new Error('Room not found or locked');
        }
        return res.json();
      })
      .then(data => {
        setRoomDetails(data);
        setLanguage(data.language);
        setEditorTheme(data.theme);
        setIsReadOnly(data.readOnly);
        setIsLocked(data.locked);
        setAccentColor(data.accentColor);
      })
      .catch(() => {
        // Fallback room config if offline/missing
        setAccentColor('#3B82F6');
      });
  }, [roomId]);

  // Connect WebSockets after Username is verified
  useEffect(() => {
    if (isLobbyOpen || !roomId || !username) return;

    let userId = sessionStorage.getItem('cc_user_id');
    if (!userId) {
      userId = Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('cc_user_id', userId);
    }

    // Connect custom JSON Control and Yjs WebSockets (both bind to the same server endpoint)
    const wsUrl = `${WS_URL}/room/${roomId.toUpperCase()}?userId=${userId}&username=${encodeURIComponent(username)}&color=${encodeURIComponent(userColor)}`;
    const ws = new WebSocket(wsUrl);
    controlSocketRef.current = ws;

    // Connect Yjs document sync WebSocket route
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const yjsUrl = `${WS_URL}/sync/${roomId.toUpperCase()}`;
    const provider = new WebsocketProvider(yjsUrl, roomId.toUpperCase(), ydoc, {
      params: { userId }
    });
    providerRef.current = provider;

    // Set local state in awareness
    const awareness = provider.awareness;
    awareness.setLocalStateField('user', {
      name: username,
      color: userColor,
      status: 'online'
    });

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case ServerEvent.ROOM_STATE_UPDATE:
            setUsers(msg.users);
            setActivity(msg.activity);
            setChat(msg.chat);
            setLanguage(msg.language);
            setEditorTheme(msg.theme);
            setIsReadOnly(msg.readOnly);
            setIsLocked(msg.locked);
            setAccentColor(msg.accentColor);
            break;
          case ServerEvent.ROOM_CHAT_UPDATE:
            setChat(msg.chat);
            break;
          case ServerEvent.CODE_EXECUTION_LOG:
            setTerminalLogs(prev => [...prev, msg.text]);
            setIsRunning(false);
            break;
        }
      } catch (e) {
        // Ignore binary updates (handled by Yjs)
      }
    };

    ws.onclose = (event) => {
      setTerminalLogs(prev => [...prev, '⚠️ Session disconnected from server.\n']);
      if (event.code === 4003) {
        setIsRoomLockedError(true);
      }
    };

    return () => {
      ws.close();
      cleanUpSync();
    };
  }, [isLobbyOpen, roomId, username, userColor]);

  // Clean up editor binding when toggling view tabs
  useEffect(() => {
    if (activeTab === 'canvas') {
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
    }
  }, [activeTab]);

  // Scroll Chat to Bottom on New Messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const cleanUpSync = () => {
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }
    if (providerRef.current) {
      providerRef.current.disconnect();
      providerRef.current.destroy();
      providerRef.current = null;
    }
    if (ydocRef.current) {
      ydocRef.current.destroy();
      ydocRef.current = null;
    }
    const styleElement = document.getElementById('yjs-cursor-styles');
    if (styleElement) {
      styleElement.remove();
    }
  };

  // Editor Mounted — Bind Monaco to Yjs doc
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Set custom Monaco graphite theme
    monaco.editor.defineTheme('aurora-slate', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748B', fontStyle: 'italic' },
        { token: 'keyword', foreground: '7C9CFF', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'F8FAFC' },
        { token: 'string', foreground: 'F9A826' },
        { token: 'number', foreground: 'F472B6' },
        { token: 'delimiter', foreground: '94A3B8' },
      ],
      colors: {
        'editor.background': '#0B0F14',
        'editor.lineHighlightBackground': '#151C28',
        'editor.selectionBackground': '#294B78',
        'editor.lineHighlightBorder': '#00000000',
      }
    });
    monaco.editor.setTheme('aurora-slate');

    if (ydocRef.current && providerRef.current) {
      const ydoc = ydocRef.current;
      const provider = providerRef.current;
      const ytext = ydoc.getText('monaco');
      const awareness = provider.awareness;

      try {
        if (bindingRef.current) {
          bindingRef.current.destroy();
        }

        const binding = new MonacoBinding(
          ytext,
          editor.getModel(),
          new Set([editor]),
          awareness
        );
        bindingRef.current = binding;

        const setLocalAwarenessStatus = (status: 'online' | 'typing' | 'idle') => {
          const localState = awareness.getLocalState();
          if (localState && localState.user) {
            awareness.setLocalStateField('user', {
              ...localState.user,
              status
            });
          }
        };

        // Listen to keydown to flag typing updates (only fires on local keyboard keypress)
        editor.onKeyDown(() => {
          updatePresenceStatus('typing');
          if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
          idleTimerRef.current = setTimeout(() => {
            updatePresenceStatus('idle');
          }, 15000);

          setLocalAwarenessStatus('typing');
          if (awarenessTimerRef.current) clearTimeout(awarenessTimerRef.current);
          awarenessTimerRef.current = setTimeout(() => {
            setLocalAwarenessStatus('idle');
          }, 3000);
        });

        // Show tag when cursor moves via local mouse click
        editor.onMouseDown(() => {
          setLocalAwarenessStatus('typing');
          if (awarenessTimerRef.current) clearTimeout(awarenessTimerRef.current);
          awarenessTimerRef.current = setTimeout(() => {
            setLocalAwarenessStatus('idle');
          }, 3000);
        });

        // Set up cursor style rules in awareness
        awareness.on('change', () => {
          const states = awareness.getStates();
          let styleText = '';
          states.forEach((state: any, clientID: number) => {
            if (clientID === ydoc.clientID) return;
            const user = state.user;
            if (user) {
              const name = user.name || 'Collaborator';
              const color = user.color || '#3B82F6';
              const isTyping = user.status === 'typing';
              styleText += `
                .yRemoteSelectionHead-${clientID} {
                  border-left: 2px solid ${color} !important;
                  position: relative !important;
                  display: inline-block !important;
                  width: 0 !important;
                  height: 19px !important;
                }
                .yRemoteSelectionHead-${clientID}::after {
                  content: "${name.replace(/"/g, '\\"')}" !important;
                  position: absolute !important;
                  font-family: 'Inter', sans-serif !important;
                  font-weight: 700 !important;
                  font-size: 10px !important;
                  line-height: 1 !important;
                  color: #ffffff !important;
                  background-color: ${color} !important;
                  padding: 2.5px 6px !important;
                  border-radius: 4px !important;
                  white-space: nowrap !important;
                  bottom: 100% !important;
                  left: 50% !important;
                  transform: translateX(-50%) translateY(-2px) !important;
                  z-index: 1000 !important;
                  pointer-events: none !important;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.4) !important;
                  opacity: ${isTyping ? '1' : '0'} !important;
                  transition: opacity 0.25s ease-in-out !important;
                }
                .yRemoteSelection-${clientID} {
                  background-color: ${color}30 !important;
                }
              `;
            }
          });

          let styleElement = document.getElementById('yjs-cursor-styles');
          if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'yjs-cursor-styles';
            document.head.appendChild(styleElement);
          }
          styleElement.textContent = styleText;
        });

      } catch (err) {
        console.error('[Yjs Monaco Binding Error]:', err);
      }
    }
  };

  const updatePresenceStatus = (status: 'online' | 'typing' | 'idle' | 'viewing') => {
    if (controlSocketRef.current && controlSocketRef.current.readyState === WebSocket.OPEN) {
      controlSocketRef.current.send(JSON.stringify({
        type: ClientEvent.PRESENCE_STATUS,
        status
      }));
    }
  };

  const handleJoinLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    if (roomDetails?.passwordRequired) {
      try {
        const res = await fetch(`${API_URL}/api/rooms/${roomId?.toUpperCase()}/verify-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: passwordInput })
        });
        if (!res.ok) throw new Error('Invalid Password');
        setIsLobbyOpen(false);
      } catch (err: any) {
        setPasswordError(err.message);
        return;
      }
    } else {
      setIsLobbyOpen(false);
    }

    let userId = sessionStorage.getItem('cc_user_id');
    if (!userId) {
      userId = Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('cc_user_id', userId);
    }

    sessionStorage.setItem('cc_username', username);
    sessionStorage.setItem('cc_color', userColor);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    if (controlSocketRef.current?.readyState === WebSocket.OPEN) {
      controlSocketRef.current.send(JSON.stringify({
        type: ClientEvent.CHAT_MESSAGE,
        text: chatInput
      }));
      setChatInput('');
    }
  };

  const handleSettingsChange = (changes: any) => {
    if (controlSocketRef.current?.readyState === WebSocket.OPEN) {
      controlSocketRef.current.send(JSON.stringify({
        type: ClientEvent.SETTINGS_CHANGE,
        ...changes
      }));
    }
  };

  const handleRunCode = () => {
    if (!editorRef.current || isRunning) return;
    const source = editorRef.current.getValue();
    setIsRunning(true);
    setIsTerminalOpen(true);
    setTerminalLogs([]);

    if (controlSocketRef.current?.readyState === WebSocket.OPEN) {
      controlSocketRef.current.send(JSON.stringify({
        type: ClientEvent.RUN_CODE,
        source,
        language,
        stdin: programInput
      }));
    }
  };

  if (isRoomLockedError) {
    return (
      <div className="h-screen w-screen bg-[#070b12] flex items-center justify-center p-6 text-slate-200">
        <div className="w-full max-w-md bg-[#101520] border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl text-white">This Room is Locked</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              The Room Master has locked this session to prevent new collaborators from joining.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full mt-2 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl text-sm transition-all"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (isMobileView) {
    return (
      <div className="h-screen w-screen bg-[#0B0F14] flex items-center justify-center p-6 overflow-y-auto text-slate-200">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg bg-[#1A2233] border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-col gap-6 text-center select-text relative"
        >
          {/* Premium Device SVG Illustration */}
          <div className="flex justify-center items-center h-28 relative">
            {/* Background glow behind laptops */}
            <div className="absolute w-24 h-24 rounded-full bg-blue-500/10 blur-xl animate-pulse" />
            
            {/* SVG animation illustration */}
            <svg className="w-40 h-28" viewBox="0 0 160 110" fill="none">
              {/* Desktop Laptop */}
              <g className="translate-x-[20px] translate-y-[10px]">
                {/* Screen */}
                <rect x="15" y="10" width="90" height="56" rx="4" fill="#0b0f17" stroke="#3B82F6" strokeWidth="2" />
                {/* Blinking active code cursor */}
                <rect x="25" y="20" width="10" height="2" fill="#3B82F6" className="animate-pulse" />
                <rect x="25" y="26" width="25" height="2" fill="#10B981" />
                <rect x="25" y="32" width="18" height="2" fill="#8B5CF6" />
                {/* Keyboard base */}
                <path d="M 5 66 L 115 66 L 123 75 L -3 75 Z" fill="#1e293b" stroke="#3B82F6" strokeWidth="1.5" />
                {/* Touchpad line */}
                <line x1="52" y1="71" x2="68" y2="71" stroke="#3B82F6" strokeWidth="1.5" />
              </g>

              {/* Mobile Phone (overlapping front-right) */}
              <g className="translate-x-[95px] translate-y-[45px] animate-bounce" style={{ animationDuration: '3s' }}>
                {/* Phone Outer casing */}
                <rect x="0" y="0" width="30" height="54" rx="5" fill="#0b0f17" stroke="#f97316" strokeWidth="2" />
                {/* Screen inner content */}
                <rect x="4" y="6" width="22" height="42" rx="2" fill="#080c14" />
                {/* Home button / speaker dot */}
                <circle cx="15" cy="51" r="1.5" fill="#f97316" />
                <line x1="12" y1="3" x2="18" y2="3" stroke="#f97316" strokeWidth="1" />
                {/* Red X check indicator */}
                <circle cx="15" cy="27" r="6" fill="#ef4444" />
                <path d="M 12 24 L 18 30 M 18 24 L 12 30" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            </svg>
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <h2 className="font-display font-black text-2xl text-white tracking-tight">
              Desktop Experience Required
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
              DevSync is optimized for real-time collaborative coding on desktop browsers. Editing on mobile devices is currently unavailable.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              <span>Return to Home Page</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setIsMobileCopied(true);
                  setTimeout(() => setIsMobileCopied(false), 2000);
                }}
                className="py-3 bg-[#0d121f] hover:bg-[#131b2e] border border-white/5 text-slate-300 font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2"
              >
                {isMobileCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Room Link</span>
                  </>
                )}
              </button>

              <a
                href={`mailto:?subject=Join%20my%20DevSync%20Coding%20Session&body=Hey!%20Join%20my%20real-time%20collaborative%20coding%20session%20on%20DevSync%20here%3A%20${encodeURIComponent(window.location.href)}`}
                className="py-3 bg-[#0d121f] hover:bg-[#131b2e] border border-white/5 text-slate-300 font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Email Link</span>
              </a>
            </div>
          </div>

          {/* Features checklist preview */}
          <div className="border-t border-b border-white/5 py-4 my-2 text-left">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">
              Features Preview
            </h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 max-w-sm mx-auto text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="text-[#10B981]">✓</span> Real-time Collaboration
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#10B981]">✓</span> Live Cursors
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#10B981]">✓</span> Shared Whiteboard
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#10B981]">✓</span> Code Compilation
              </div>
              <div className="flex items-center gap-1.5 col-span-2 justify-center mt-1 text-slate-400">
                <span className="text-[#10B981]">✓</span> Room Chat & Activity Feed
              </div>
            </div>
          </div>

          {/* Bottom Notice */}
          <div className="text-slate-400 text-xs py-1">
            <span className="font-bold text-white block mb-1">💻 Desktop Required</span>
            Please copy the room link above or email it to yourself, then open it in a desktop web browser to start coding.
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-aurora-bg flex flex-col select-none overflow-hidden relative text-slate-200">
      
      {/* 1. Username lobby Overlay */}
      <AnimatePresence>
        {isLobbyOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] backdrop-blur-xl bg-aurora-bg/90 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-[#101520] border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col gap-6 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="font-display font-bold text-2xl text-white">Join Collaboration</h2>
              </div>
              <p className="text-sm text-slate-400">Enter your name and pick your dynamic cursor highlight color to begin.</p>

              <form onSubmit={handleJoinLobby} className="space-y-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-400">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-slate-200"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-400">Avatar Ring Color</label>
                  <div className="flex gap-3.5">
                    {COLLAB_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setUserColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-7 h-7 rounded-full transition-transform duration-100 ${userColor === c ? 'scale-125 border-2 border-white' : 'hover:scale-110'}`}
                      />
                    ))}
                  </div>
                </div>

                {roomDetails?.passwordRequired && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-400">Room Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-slate-200"
                    />
                    {passwordError && <span className="text-xs text-red-500 font-semibold">{passwordError}</span>}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-blue-500/25 transition-all"
                >
                  Join Coding Session
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Top Navigation Bar */}
      <header className="h-14 bg-[#0a0d14] border-b border-slate-800/80 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/logo-icon.png" 
            alt="DevSync Logo" 
            className="w-7 h-7 object-contain cursor-pointer"
            onClick={() => navigate('/')}
          />
          <span 
            className="font-display font-bold tracking-tight text-white cursor-pointer"
            onClick={() => navigate('/')}
          >
            DevSync
          </span>
          <div 
            className="px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 border cursor-pointer hover:bg-slate-900 transition-colors"
            style={{ borderColor: accentColor, color: accentColor }}
            onClick={handleCopyLink}
          >
            <Sparkles className="w-3 h-3" />
            <span>Room: {roomId?.toUpperCase()}</span>
          </div>
        </div>

        {/* View Tab Toggles */}
        <div className="flex bg-[#0b0f17] p-1 rounded-xl border border-slate-800/80 select-none">
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'code' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Code Editor</span>
          </button>
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'canvas' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Design Canvas</span>
          </button>
        </div>

        {/* Configurations, Compiler Run triggers */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#101520] border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={language}
              onChange={(e) => handleSettingsChange({ language: e.target.value })}
              className="bg-transparent border-none focus:outline-none text-slate-300 font-semibold cursor-pointer"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          </div>

          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-800"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {isCopied ? 'Link Copied' : 'Copy Link'}
          </button>

           <button
            onClick={handleRunCode}
            disabled={isRunning || (isReadOnly && !isMaster)}
            className={`px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-950/20`}
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            {isRunning ? 'Compiling...' : 'Run Code'}
          </button>

          {/* Console Toggle Button */}
          <button 
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className={`p-2 border rounded-xl transition-all ${
              isTerminalOpen 
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
            title="Toggle Console Output Terminal"
          >
            <Terminal className="w-4 h-4" />
          </button>

          {/* Settings Trigger Icon */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-all"
          >
            <Settings className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </header>

      {/* 3. Main Editor Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Vertical Activity/Tab selector */}
        <nav className="w-14 bg-[#0a0d14] border-r border-slate-800/80 flex flex-col items-center py-4 text-slate-400 gap-4 select-none">
          <button
            onClick={() => handleSidebarTabClick('users')}
            className={`p-2.5 rounded-xl hover:text-white transition-all flex items-center justify-center ${sidebarTab === 'users' && !isSidebarCollapsed ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : ''}`}
            title="Users presence"
          >
            <Users className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleSidebarTabClick('chat')}
            className={`p-2.5 rounded-xl hover:text-white transition-all flex items-center justify-center relative ${sidebarTab === 'chat' && !isSidebarCollapsed ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : ''}`}
            title="Room Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleSidebarTabClick('activity')}
            className={`p-2.5 rounded-xl hover:text-white transition-all flex items-center justify-center ${sidebarTab === 'activity' && !isSidebarCollapsed ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : ''}`}
            title="Activity Feed"
          >
            <History className="w-5 h-5" />
          </button>
        </nav>

        {/* Expandable Sidebar */}
        <aside 
          style={{ width: isSidebarCollapsed ? 0 : sidebarWidth }}
          className={`bg-[#0B0F14] border-r border-slate-800/60 flex flex-col overflow-hidden relative select-none ${
            isResizingSidebar ? '' : 'transition-all duration-200'
          }`}
        >
          {/* Vertical Resize Drag Handle */}
          {!isSidebarCollapsed && (
            <div
              onMouseDown={handleSidebarResizeStart}
              className="w-1 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-500 absolute right-0 top-0 bottom-0 z-50 transition-colors"
            />
          )}
          {/* A. Users presence list */}
          {sidebarTab === 'users' && (
            <div className="flex flex-col h-full">
              <h3 className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-900">Teammates</h3>
              <div className="flex-1 p-3 overflow-y-auto space-y-2">
                {users.map(u => {
                  const isOffline = u.status === 'offline';
                  return (
                    <div 
                      key={u.id} 
                      className={`flex items-center justify-between p-2.5 bg-aurora-secondary border border-slate-900 rounded-xl transition-all ${
                        isOffline ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: isOffline ? '#475569' : u.color }} 
                        />
                        <span className={`text-xs font-bold ${isOffline ? 'text-slate-500 line-through decoration-slate-600/50' : 'text-slate-200'}`}>
                          {u.name}
                        </span>
                      </div>
                      <span 
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          u.status === 'typing' ? 'bg-blue-500/10 text-blue-400' :
                          u.status === 'idle' ? 'bg-amber-500/10 text-amber-400' :
                          isOffline ? 'bg-slate-800/60 text-slate-500' :
                          'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {u.status}
                      </span>
                    </div>
                  );
                })}
                {users.length === 0 && (
                  <div className="text-center py-12 text-slate-600 text-xs font-medium">Waiting for collaborators...</div>
                )}
              </div>
            </div>
          )}

          {/* B. Live Room Chat */}
          {sidebarTab === 'chat' && (
            <div className="flex flex-col h-full">
              <h3 className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-900">Room Chat</h3>
              <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col text-left">
                {chat.map(m => {
                  const isMe = m.sender === username;
                  return (
                    <div 
                      key={m.id} 
                      className={`flex flex-col gap-1 max-w-[85%] rounded-2xl p-3 ${
                        isMe 
                          ? 'self-end bg-blue-600/20 border border-blue-500/30' 
                          : 'self-start bg-aurora-secondary border border-slate-900'
                      }`}
                    >
                      {!isMe && (
                        <span className="text-[10px] font-bold" style={{ color: m.senderColor }}>
                          {m.sender}
                        </span>
                      )}
                      <p className="text-xs text-slate-300 break-words leading-relaxed">{m.text}</p>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>
              <form onSubmit={handleSendChat} className="p-3 border-t border-slate-900 flex gap-2">
                <input
                  type="text"
                  placeholder="Send a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-[#0a0d14] border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs focus:outline-none transition-colors text-slate-300"
                />
                <button
                  type="submit"
                  className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* C. Live Activity Feed */}
          {sidebarTab === 'activity' && (
            <div className="flex flex-col h-full text-left">
              <h3 className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-900">Activity Logs</h3>
              <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-[10px] text-slate-500">
                {activity.map(act => (
                  <div key={act.id} className="flex flex-col gap-0.5 border-l border-slate-800 pl-3.5 relative">
                    <span className="absolute left-[-4px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
                    <span className="text-slate-300 leading-normal">{act.text}</span>
                    <span className="text-slate-600">{new Date(act.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Central Editor View */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-aurora-bg">
          {activeTab === 'code' ? (
            <>
              <div className="flex-1 relative min-h-0">
                <MonacoEditor
                  height="100%"
                  language={language}
                  theme={editorTheme}
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: true },
                    fontSize: 13,
                    fontFamily: 'JetBrains Mono, monospace',
                    automaticLayout: true,
                    scrollbar: {
                      verticalScrollbarSize: 6,
                      horizontalScrollbarSize: 6
                    },
                    readOnly: (isReadOnly && !isMaster) || isMobileView
                  }}
                />
              </div>

              {/* Draggable Row Splitter Separator */}
              {isTerminalOpen && (
                <div
                  onMouseDown={handleTerminalResizeStart}
                  className="h-1 cursor-row-resize bg-slate-900 border-t border-b border-slate-800/60 hover:bg-blue-500 active:bg-blue-600 transition-colors z-50 select-none"
                />
              )}

              {/* Collapsible output console drawer */}
              <AnimatePresence>
                {isTerminalOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: terminalHeight }}
                    exit={{ height: 0 }}
                    transition={isResizingTerminal ? { type: 'tween', duration: 0 } : { type: 'tween', duration: 0.2 }}
                    className="bg-[#070b12] flex flex-col overflow-hidden text-left relative"
                  >
                    <div className="px-4 py-2 border-b border-slate-900/60 flex items-center justify-between text-xs text-slate-500 font-semibold bg-[#0a0d14] select-none">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-blue-500" />
                        <span>Run Output console</span>
                      </div>
                      <button 
                        onClick={() => setIsTerminalOpen(false)}
                        className="p-1 hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="flex-1 flex min-h-0 overflow-hidden divide-x divide-slate-900/80">
                      {/* Left Column: Standard Input (stdin) */}
                      <div className="w-1/3 flex flex-col min-h-0 bg-[#090d14]">
                        <div className="px-3 py-1.5 border-b border-slate-900/60 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-[#0a0d14]/40 select-none">
                          Console Input
                        </div>
                        <textarea
                          value={programInput}
                          onChange={(e) => setProgramInput(e.target.value)}
                          placeholder="Type program input here (e.g. 5&#10;10)..."
                          className="flex-1 p-3 bg-transparent text-slate-300 font-mono text-xs focus:outline-none resize-none placeholder:text-slate-600 leading-normal"
                        />
                      </div>

                      {/* Right Column: Console Output */}
                      <div className="flex-1 flex flex-col min-h-0 bg-[#070b12]">
                        <div className="px-3 py-1.5 border-b border-slate-900/60 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-[#0a0d14]/40 select-none">
                          Console Output
                        </div>
                        <div className="flex-1 p-3.5 font-mono text-xs overflow-y-auto leading-relaxed text-emerald-400 whitespace-pre">
                          {terminalLogs.join('') || '$ Waiting for program compile runner executions...\n'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            ydocRef.current && providerRef.current && (
              <Canvas
                ydoc={ydocRef.current}
                awareness={providerRef.current.awareness}
                readOnly={isReadOnly || isMobileView}
              />
            )
          )}
        </main>
      </div>

      {/* Settings Modal (Toggles Read-Only, Locking, and Passwords) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 backdrop-blur-md bg-black/60 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-sm bg-[#101520] border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-left"
            >
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="absolute top-4 right-4 p-1 hover:text-white transition-all text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
              
              <h3 className="font-display font-bold text-lg text-white mb-6">Room Settings</h3>

              {!isMaster && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] rounded-xl font-semibold mb-4 leading-normal">
                  ⚠️ Only the Room Master can adjust settings.
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-slate-200">Read-Only Mode</span>
                    <span className="text-[10px] text-slate-500">Prevent other guests from editing code</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isReadOnly}
                    disabled={!isMaster}
                    onChange={(e) => handleSettingsChange({ readOnly: e.target.checked })}
                    className="w-4 h-4 accent-blue-500 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-900 pt-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-slate-200">Lock Room</span>
                    <span className="text-[10px] text-slate-500">Block new collaborators from joining</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isLocked}
                    disabled={!isMaster}
                    onChange={(e) => handleSettingsChange({ locked: e.target.checked })}
                    className="w-4 h-4 accent-blue-500 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Workspace;
