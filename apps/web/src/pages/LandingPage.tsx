import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Code, Users, Zap, ArrowRight, Play, X, Lock, Github, Sparkles } from 'lucide-react';
import { API_URL } from '../config';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  // Modal configuration states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customLanguage, setCustomLanguage] = useState('javascript');
  const [customPassword, setCustomPassword] = useState('');

  // Typing simulator states
  const [typedLine1, setTypedLine1] = useState('');
  const [typedLine2, setTypedLine2] = useState('');
  const [typedLine3, setTypedLine3] = useState('');
  const [typedLine5, setTypedLine5] = useState('');
  const [typedLine6, setTypedLine6] = useState('');
  const [typedLine8, setTypedLine8] = useState('');
  const [typedLine9, setTypedLine9] = useState('');
  const [typedLine10, setTypedLine10] = useState('');
  const [typedLine12, setTypedLine12] = useState('');
  const [typedLine13, setTypedLine13] = useState('');
  const [typedLine14, setTypedLine14] = useState('');
  const [typedLine15, setTypedLine15] = useState('');
  const [typedLine16, setTypedLine16] = useState('');
  const [activeCursor, setActiveCursor] = useState<'line1' | 'line2' | 'line3' | 'line5' | 'line6' | 'line8' | 'line9' | 'line10' | 'line12' | 'line13' | 'line14' | 'line15' | 'line16' | 'none'>('line1');

  useEffect(() => {
    const fullLine1 = "function authenticate(username, password) {";
    const fullLine2 = "  const validUsername = \"admin\";";
    const fullLine3 = "  const validPassword = \"password123\";";
    const fullLine5 = "  return username === validUsername && password === validPassword;";
    const fullLine6 = "}";
    const fullLine8 = "// Main program";
    const fullLine9 = "const username = \"admin\";";
    const fullLine10 = "const password = \"password123\";";
    const fullLine12 = "if (authenticate(username, password)) {";
    const fullLine13 = "  console.log(\"Login successful!\");";
    const fullLine14 = "} else {";
    const fullLine15 = "  console.log(\"Invalid username or password.\");";
    const fullLine16 = "}";

    let step = 0;
    let idx1 = 0, idx2 = 0, idx3 = 0, idx5 = 0, idx6 = 0;
    let idx8 = 0, idx9 = 0, idx10 = 0, idx12 = 0, idx13 = 0, idx14 = 0, idx15 = 0, idx16 = 0;

    const interval = setInterval(() => {
      if (step === 0) {
        setTypedLine1(fullLine1.slice(0, idx1));
        idx1++;
        if (idx1 > fullLine1.length) {
          step = 1;
          setActiveCursor('line2');
        }
      } else if (step === 1) {
        setTypedLine2(fullLine2.slice(0, idx2));
        idx2++;
        if (idx2 > fullLine2.length) {
          step = 2;
          setActiveCursor('line3');
        }
      } else if (step === 2) {
        setTypedLine3(fullLine3.slice(0, idx3));
        idx3++;
        if (idx3 > fullLine3.length) {
          step = 3;
          setActiveCursor('line5');
        }
      } else if (step === 3) {
        setTypedLine5(fullLine5.slice(0, idx5));
        idx5++;
        if (idx5 > fullLine5.length) {
          step = 4;
          setActiveCursor('line6');
        }
      } else if (step === 4) {
        setTypedLine6(fullLine6.slice(0, idx6));
        idx6++;
        if (idx6 > fullLine6.length) {
          step = 5;
          setActiveCursor('line8');
        }
      } else if (step === 5) {
        setTypedLine8(fullLine8.slice(0, idx8));
        idx8++;
        if (idx8 > fullLine8.length) {
          step = 6;
          setActiveCursor('line9');
        }
      } else if (step === 6) {
        setTypedLine9(fullLine9.slice(0, idx9));
        idx9++;
        if (idx9 > fullLine9.length) {
          step = 7;
          setActiveCursor('line10');
        }
      } else if (step === 7) {
        setTypedLine10(fullLine10.slice(0, idx10));
        idx10++;
        if (idx10 > fullLine10.length) {
          step = 8;
          setActiveCursor('line12');
        }
      } else if (step === 8) {
        setTypedLine12(fullLine12.slice(0, idx12));
        idx12++;
        if (idx12 > fullLine12.length) {
          step = 9;
          setActiveCursor('line13');
        }
      } else if (step === 9) {
        setTypedLine13(fullLine13.slice(0, idx13));
        idx13++;
        if (idx13 > fullLine13.length) {
          step = 10;
          setActiveCursor('line14');
        }
      } else if (step === 10) {
        setTypedLine14(fullLine14.slice(0, idx14));
        idx14++;
        if (idx14 > fullLine14.length) {
          step = 11;
          setActiveCursor('line15');
        }
      } else if (step === 11) {
        setTypedLine15(fullLine15.slice(0, idx15));
        idx15++;
        if (idx15 > fullLine15.length) {
          step = 12;
          setActiveCursor('line16');
        }
      } else if (step === 12) {
        setTypedLine16(fullLine16.slice(0, idx16));
        idx16++;
        if (idx16 > fullLine16.length) {
          step = 13;
          setActiveCursor('none');
          setTimeout(() => {
            step = 0;
            idx1 = 0; idx2 = 0; idx3 = 0; idx5 = 0; idx6 = 0;
            idx8 = 0; idx9 = 0; idx10 = 0; idx12 = 0; idx13 = 0; idx14 = 0; idx15 = 0; idx16 = 0;
            setTypedLine1('');
            setTypedLine2('');
            setTypedLine3('');
            setTypedLine5('');
            setTypedLine6('');
            setTypedLine8('');
            setTypedLine9('');
            setTypedLine10('');
            setTypedLine12('');
            setTypedLine13('');
            setTypedLine14('');
            setTypedLine15('');
            setTypedLine16('');
            setActiveCursor('line1');
          }, 4500); // Display complete authenticate code block for 4.5s before looping
        }
      }
    }, 70); // Natural, human-like 70ms typing speed

    return () => clearInterval(interval);
  }, []);

  const renderLine1 = () => {
    const len = typedLine1.length;
    if (len === 0) return null;
    return (
      <span className="text-slate-300">
        <span className="text-purple-400">{ "function".substring(0, len) }</span>
        {len > 8 && <span className="text-cyan-400">{ " authenticate".substring(0, len - 8) }</span>}
        {len > 21 && <span>{ "(".substring(0, len - 21) }</span>}
        {len > 22 && <span className="text-orange-400">{ "username".substring(0, len - 22) }</span>}
        {len > 30 && <span>{ ", ".substring(0, len - 30) }</span>}
        {len > 32 && <span className="text-orange-400">{ "password".substring(0, len - 32) }</span>}
        {len > 40 && <span>{ ") {".substring(0, len - 40) }</span>}
      </span>
    );
  };

  const renderLine2 = () => {
    const len = typedLine2.length;
    if (len === 0) return null;
    return (
      <span className="text-slate-300">
        <span className="text-purple-400">{ "  const".substring(0, len) }</span>
        {len > 7 && <span className="text-white">{ " validUsername".substring(0, len - 7) }</span>}
        {len > 21 && <span className="text-slate-400">{ " =".substring(0, len - 21) }</span>}
        {len > 23 && <span className="text-[#34d399]">{ ' "admin"'.substring(0, len - 23) }</span>}
        {len > 30 && <span className="text-slate-400">{ ";".substring(0, len - 30) }</span>}
      </span>
    );
  };

  const renderLine3 = () => {
    const len = typedLine3.length;
    if (len === 0) return null;
    return (
      <span className="text-slate-300">
        <span className="text-purple-400">{ "  const".substring(0, len) }</span>
        {len > 7 && <span className="text-white">{ " validPassword".substring(0, len - 7) }</span>}
        {len > 21 && <span className="text-slate-400">{ " =".substring(0, len - 21) }</span>}
        {len > 23 && <span className="text-[#34d399]">{ ' "password123"'.substring(0, len - 23) }</span>}
        {len > 36 && <span className="text-slate-400">{ ";".substring(0, len - 36) }</span>}
      </span>
    );
  };

  const renderLine5 = () => {
    const len = typedLine5.length;
    if (len === 0) return null;
    return (
      <span className="text-slate-300">
        <span className="text-purple-400">{ "  return".substring(0, len) }</span>
        {len > 8 && <span className="text-orange-400">{ " username".substring(0, len - 8) }</span>}
        {len > 17 && <span className="text-slate-400">{ " ===".substring(0, len - 17) }</span>}
        {len > 21 && <span className="text-white">{ " validUsername".substring(0, len - 21) }</span>}
        {len > 35 && <span className="text-purple-400">{ " &&".substring(0, len - 35) }</span>}
        {len > 38 && <span className="text-orange-400">{ " password".substring(0, len - 38) }</span>}
        {len > 47 && <span className="text-slate-400">{ " ===".substring(0, len - 47) }</span>}
        {len > 51 && <span className="text-white">{ " validPassword".substring(0, len - 51) }</span>}
        {len > 65 && <span className="text-slate-400">{ ";".substring(0, len - 65) }</span>}
      </span>
    );
  };

  const renderLine6 = () => {
    const len = typedLine6.length;
    if (len === 0) return null;
    return <span className="text-slate-300">{"}".substring(0, len)}</span>;
  };

  const renderLine8 = () => {
    const len = typedLine8.length;
    if (len === 0) return null;
    return <span className="text-slate-500 italic font-medium">{"// Main program".substring(0, len)}</span>;
  };

  const renderLine9 = () => {
    const len = typedLine9.length;
    if (len === 0) return null;
    return (
      <span className="text-slate-300">
        <span className="text-purple-400">{ "const".substring(0, len) }</span>
        {len > 5 && <span className="text-white">{ " username".substring(0, len - 5) }</span>}
        {len > 14 && <span className="text-slate-400">{ " =".substring(0, len - 14) }</span>}
        {len > 16 && <span className="text-[#34d399]">{ ' "admin"'.substring(0, len - 16) }</span>}
        {len > 23 && <span className="text-slate-400">{ ";".substring(0, len - 23) }</span>}
      </span>
    );
  };

  const renderLine10 = () => {
    const len = typedLine10.length;
    if (len === 0) return null;
    return (
      <span className="text-slate-300">
        <span className="text-purple-400">{ "const".substring(0, len) }</span>
        {len > 5 && <span className="text-white">{ " password".substring(0, len - 5) }</span>}
        {len > 14 && <span className="text-slate-400">{ " =".substring(0, len - 14) }</span>}
        {len > 16 && <span className="text-[#34d399]">{ ' "password123"'.substring(0, len - 16) }</span>}
        {len > 29 && <span className="text-slate-400">{ ";".substring(0, len - 29) }</span>}
      </span>
    );
  };

  const renderLine12 = () => {
    const len = typedLine12.length;
    if (len === 0) return null;
    return (
      <span className="text-slate-300">
        <span className="text-purple-400">{ "if".substring(0, len) }</span>
        {len > 2 && <span>{ " (".substring(0, len - 2) }</span>}
        {len > 4 && <span className="text-cyan-400">{ "authenticate".substring(0, len - 4) }</span>}
        {len > 16 && <span>{ "(".substring(0, len - 16) }</span>}
        {len > 17 && <span className="text-orange-400">{ "username".substring(0, len - 17) }</span>}
        {len > 25 && <span>{ ", ".substring(0, len - 25) }</span>}
        {len > 27 && <span className="text-orange-400">{ "password".substring(0, len - 27) }</span>}
        {len > 35 && <span>{ ")) {".substring(0, len - 35) }</span>}
      </span>
    );
  };

  const renderLine13 = () => {
    const len = typedLine13.length;
    if (len === 0) return null;
    return (
      <span className="text-slate-300">
        <span className="text-white">{ "  console".substring(0, len) }</span>
        {len > 9 && <span className="text-cyan-400">{ ".log".substring(0, len - 9) }</span>}
        {len > 13 && <span>{ "(".substring(0, len - 13) }</span>}
        {len > 14 && <span className="text-[#34d399]">{ '"Login successful!"'.substring(0, len - 14) }</span>}
        {len > 32 && <span>{ ");".substring(0, len - 32) }</span>}
      </span>
    );
  };

  const renderLine14 = () => {
    const len = typedLine14.length;
    if (len === 0) return null;
    return (
      <span className="text-slate-300">
        <span className="text-purple-400">{"} else {".substring(0, len)}</span>
      </span>
    );
  };

  const renderLine15 = () => {
    const len = typedLine15.length;
    if (len === 0) return null;
    return (
      <span className="text-slate-300">
        <span className="text-white">{ "  console".substring(0, len) }</span>
        {len > 9 && <span className="text-cyan-400">{ ".log".substring(0, len - 9) }</span>}
        {len > 13 && <span>{ "(".substring(0, len - 13) }</span>}
        {len > 14 && <span className="text-[#34d399]">{ '"Invalid username or password."'.substring(0, len - 14) }</span>}
        {len > 46 && <span>{ ");".substring(0, len - 46) }</span>}
      </span>
    );
  };

  const renderLine16 = () => {
    const len = typedLine16.length;
    if (len === 0) return null;
    return <span className="text-slate-300">{"}".substring(0, len)}</span>;
  };

  const handleCreateRoom = async (customOptions?: { language: string; password?: string }) => {
    setIsCreating(true);
    const body = customOptions || { language: 'javascript', theme: 'vs-dark' };
    try {
      const response = await fetch(`${API_URL}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error('API server returned error');
      const data = await response.json();

      if (data.masterId) {
        sessionStorage.setItem('cc_user_id', data.masterId);
      }

      navigate(`/room/${data.id}`);
    } catch (err) {
      // Fallback local room ID generation if API server offline
      const tempId = Math.random().toString(36).substring(2, 8).toUpperCase();
      navigate(`/room/${tempId}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-aurora-bg text-slate-100 font-sans overflow-x-hidden overflow-y-auto">
      {/* Background Glowing Aurora Gradients (Hardware Accelerated) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.08),transparent_50%)] transform-gpu" />

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-800/60 bg-aurora-bg/70 px-6 py-4 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <img src="/logo-icon.png" alt="DevSync Logo" className="w-9 h-9 object-contain" />
          <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">DevSync</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
          <span onClick={() => navigate('/features')} className="hover:text-white transition-colors cursor-pointer">Features</span>
          <a href="https://github.com/X-ImLucky-X/DevSync" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
          <span onClick={() => navigate('/contact')} className="hover:text-white transition-colors cursor-pointer">Contact</span>
        </nav>

        <button
          onClick={() => setShowCreateModal(true)}
          disabled={isCreating}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-950/20 hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2 border border-blue-400/20"
        >
          Create Room
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left column info */}
        <div className="lg:col-span-5 space-y-8 text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 cursor-pointer hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all select-none"
            onClick={() => window.open('https://github.com/X-ImLucky-X/DevSync', '_blank')}
          >
            <Github className="w-4 h-4 text-blue-400" />
            <span>Star this project on GitHub</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse ml-1" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white leading-tight"
          >
            Collaborate.<br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Code together</span><br />
            In seconds.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-base md:text-lg leading-relaxed max-w-lg"
          >
            Share coding sessions instantly with collaborators. No installations, no database configurations, no overhead. Just one click to code.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
          >
            <button
              onClick={() => handleCreateRoom()}
              disabled={isCreating}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-base font-bold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 border border-blue-400/20"
            >
              {isCreating ? 'Creating Room...' : 'Start Coding Now'}
              <Play className="w-4 h-4 fill-white" />
            </button>

            <a
              href="https://github.com/X-ImLucky-X"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-[#1A2233] hover:bg-[#20293d] text-slate-300 hover:text-white rounded-2xl text-base font-semibold border border-white/5 hover:border-slate-800 transition-all flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5"
            >
              <Github className="w-5 h-5" />
              <span>Follow Developer</span>
            </a>
          </motion.div>
        </div>

        {/* Right Column: Animated Editor Mockup */}
        <div className="lg:col-span-7 flex justify-center select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-xl aspect-[4/3] bg-[#0B0F17] rounded-3xl border border-white/5 shadow-2xl relative flex flex-col overflow-hidden text-left"
          >
            {/* Window Header */}
            <div className="px-5 py-4 bg-[#0a0d14] border-b border-white/5 flex items-center justify-between select-none">
              <div className="flex items-center gap-3">
                <img src="/logo-icon.png" alt="DevSync Logo" className="w-5 h-5 object-contain" />
                <span className="font-display font-bold text-xs tracking-tight text-white">DevSync</span>
                <div className="px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 border border-blue-500/30 text-blue-400 bg-blue-500/5">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Room: SWIFT-HARBOR-42</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center -space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-cyan-400/20 border border-cyan-400/30 text-cyan-400 font-bold text-[9px] flex items-center justify-center">U2</div>
                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold text-[9px] flex items-center justify-center border border-[#0a0d14] shadow-md">U1</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  <span className="text-[#10b981] text-[10px] font-semibold tracking-wider uppercase">Online</span>
                </div>
              </div>
            </div>

            {/* Editor Workspace */}
            <div className="flex-1 p-5 font-mono text-[11px] leading-[21px] relative overflow-hidden select-none bg-[#0B0F17]">
              {/* Line numbers column */}
              <div className="absolute left-4 top-5 text-right w-6 text-slate-700 flex flex-col select-none">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span key={i} className="h-[21px] leading-[21px]">{i + 1}</span>
                ))}
              </div>
              
              {/* Code lines */}
              <div className="pl-10 flex flex-col">
                {/* Line 1 */}
                <div className="h-[21px] leading-[21px] flex items-center">
                  {renderLine1()}
                  {activeCursor === 'line1' && (
                    <span className="relative ml-0.5 inline-block w-[1.5px] h-[12px] bg-[#f97316] align-middle">
                      <span className="absolute bottom-[14px] left-1/2 -translate-x-1/2 px-1 py-0.5 bg-[#f97316] text-white font-bold text-[7px] rounded whitespace-nowrap leading-none select-none">
                        User 1
                      </span>
                    </span>
                  )}
                </div>

                {/* Line 2 */}
                <div className="h-[21px] leading-[21px] flex items-center">
                  {renderLine2()}
                  {activeCursor === 'line2' && (
                    <span className="relative ml-0.5 inline-block w-[1.5px] h-[12px] bg-[#22d3ee] align-middle">
                      <span className="absolute bottom-[14px] left-1/2 -translate-x-1/2 px-1 py-0.5 bg-[#22d3ee] text-[#080c14] font-bold text-[7px] rounded whitespace-nowrap leading-none select-none">
                        User 2
                      </span>
                    </span>
                  )}
                </div>

                {/* Line 3 */}
                <div className="h-[21px] leading-[21px] flex items-center">
                  {renderLine3()}
                  {activeCursor === 'line3' && (
                    <span className="relative ml-0.5 inline-block w-[1.5px] h-[12px] bg-[#22d3ee] align-middle">
                      <span className="absolute bottom-[14px] left-1/2 -translate-x-1/2 px-1 py-0.5 bg-[#22d3ee] text-[#080c14] font-bold text-[7px] rounded whitespace-nowrap leading-none select-none">
                        User 2
                      </span>
                    </span>
                  )}
                </div>

                {/* Line 4 */}
                <div className="h-[21px] leading-[21px]"></div>

                {/* Line 5 */}
                <div className="h-[21px] leading-[21px] flex items-center">
                  {renderLine5()}
                  {activeCursor === 'line5' && (
                    <span className="relative ml-0.5 inline-block w-[1.5px] h-[12px] bg-[#f97316] align-middle">
                      <span className="absolute bottom-[14px] left-1/2 -translate-x-1/2 px-1 py-0.5 bg-[#f97316] text-white font-bold text-[7px] rounded whitespace-nowrap leading-none select-none">
                        User 1
                      </span>
                    </span>
                  )}
                </div>

                {/* Line 6 */}
                <div className="h-[21px] leading-[21px] flex items-center">
                  {renderLine6()}
                  {activeCursor === 'line6' && (
                    <span className="relative ml-0.5 inline-block w-[1.5px] h-[12px] bg-[#f97316] align-middle">
                      <span className="absolute bottom-[14px] left-1/2 -translate-x-1/2 px-1 py-0.5 bg-[#f97316] text-white font-bold text-[7px] rounded whitespace-nowrap leading-none select-none">
                        User 1
                      </span>
                    </span>
                  )}
                </div>

                {/* Line 7 */}
                <div className="h-[21px] leading-[21px]"></div>

                {/* Line 8 */}
                <div className="h-[21px] leading-[21px] flex items-center">
                  {renderLine8()}
                  {activeCursor === 'line8' && (
                    <span className="relative ml-0.5 inline-block w-[1.5px] h-[12px] bg-[#f97316] align-middle">
                      <span className="absolute bottom-[14px] left-1/2 -translate-x-1/2 px-1 py-0.5 bg-[#f97316] text-white font-bold text-[7px] rounded whitespace-nowrap leading-none select-none">
                        User 1
                      </span>
                    </span>
                  )}
                </div>

                {/* Line 9 */}
                <div className="h-[21px] leading-[21px] flex items-center">
                  {renderLine9()}
                  {activeCursor === 'line9' && (
                    <span className="relative ml-0.5 inline-block w-[1.5px] h-[12px] bg-[#22d3ee] align-middle">
                      <span className="absolute bottom-[14px] left-1/2 -translate-x-1/2 px-1 py-0.5 bg-[#22d3ee] text-[#080c14] font-bold text-[7px] rounded whitespace-nowrap leading-none select-none">
                        User 2
                      </span>
                    </span>
                  )}
                </div>

                {/* Line 10 */}
                <div className="h-[21px] leading-[21px] flex items-center">
                  {renderLine10()}
                  {activeCursor === 'line10' && (
                    <span className="relative ml-0.5 inline-block w-[1.5px] h-[12px] bg-[#22d3ee] align-middle">
                      <span className="absolute bottom-[14px] left-1/2 -translate-x-1/2 px-1 py-0.5 bg-[#22d3ee] text-[#080c14] font-bold text-[7px] rounded whitespace-nowrap leading-none select-none">
                        User 2
                      </span>
                    </span>
                  )}
                </div>

                {/* Line 11 */}
                <div className="h-[21px] leading-[21px]"></div>

                {/* Line 12 */}
                <div className="h-[21px] leading-[21px] flex items-center">
                  {renderLine12()}
                  {activeCursor === 'line12' && (
                    <span className="relative ml-0.5 inline-block w-[1.5px] h-[12px] bg-[#f97316] align-middle">
                      <span className="absolute bottom-[14px] left-1/2 -translate-x-1/2 px-1 py-0.5 bg-[#f97316] text-white font-bold text-[7px] rounded whitespace-nowrap leading-none select-none">
                        User 1
                      </span>
                    </span>
                  )}
                </div>

                {/* Line 13 */}
                <div className="h-[21px] leading-[21px] flex items-center">
                  {renderLine13()}
                  {activeCursor === 'line13' && (
                    <span className="relative ml-0.5 inline-block w-[1.5px] h-[12px] bg-[#f97316] align-middle">
                      <span className="absolute bottom-[14px] left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[#f97316] text-white font-bold text-[7px] rounded whitespace-nowrap leading-none select-none">
                        User 1
                      </span>
                    </span>
                  )}
                </div>

                {/* Line 14 */}
                <div className="h-[21px] leading-[21px] flex items-center">
                  {renderLine14()}
                  {activeCursor === 'line14' && (
                    <span className="relative ml-0.5 inline-block w-[1.5px] h-[12px] bg-[#f97316] align-middle">
                      <span className="absolute bottom-[14px] left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[#f97316] text-white font-bold text-[7px] rounded whitespace-nowrap leading-none select-none">
                        User 1
                      </span>
                    </span>
                  )}
                </div>

                {/* Line 15 */}
                <div className="h-[21px] leading-[21px] flex items-center">
                  {renderLine15()}
                  {activeCursor === 'line15' && (
                    <span className="relative ml-0.5 inline-block w-[1.5px] h-[12px] bg-[#f97316] align-middle">
                      <span className="absolute bottom-[14px] left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[#f97316] text-white font-bold text-[7px] rounded whitespace-nowrap leading-none select-none">
                        User 1
                      </span>
                    </span>
                  )}
                </div>

                {/* Line 16 */}
                <div className="h-[21px] leading-[21px] flex items-center">
                  {renderLine16()}
                  {activeCursor === 'line16' && (
                    <span className="relative ml-0.5 inline-block w-[1.5px] h-[12px] bg-[#f97316] align-middle">
                      <span className="absolute bottom-[14px] left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[#f97316] text-white font-bold text-[7px] rounded whitespace-nowrap leading-none select-none">
                        User 1
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Feature section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-800/40 relative z-10">
        <h2 className="text-center font-display font-bold text-2xl md:text-3xl text-white mb-12">
          Collaboration built for velocity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-aurora-secondary border border-slate-800/80 rounded-2xl flex flex-col gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Instantly Active</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              No logins, databases, or project setup required. A temporary workspace spawns in one click.
            </p>
          </div>

          <div className="p-6 bg-aurora-secondary border border-slate-800/80 rounded-2xl flex flex-col gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Yjs Real-Time Sync</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Full conflict-free editing, awareness cursors, selection paths, and document edits.
            </p>
          </div>

          <div className="p-6 bg-aurora-secondary border border-slate-800/80 rounded-2xl flex flex-col gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Run Code Instantly</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Compile and run files directly in the browser using the integrated Piston API execution runner.
            </p>
          </div>
        </div>
      </section>

      {/* Footer footer */}
      <footer className="py-12 border-t border-slate-900 text-center text-xs text-slate-600">
        <p>© 2026 DevSync. Free to collaborate globally.</p>
      </footer>

      {/* Configure Custom Room Modal Overlay */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 bg-[#1A2233] border border-white/5 rounded-3xl shadow-2xl relative text-left"
            >
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-display font-bold text-white mb-1.5 flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-400" />
                Configure Room
              </h2>
              <p className="text-xs text-slate-400 mb-6">Set up your workspace language and lock preferences before starting.</p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5 font-medium">Programming Language</label>
                  <select
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    className="w-full bg-[#0B0F14] border border-white/5 hover:border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none transition-colors"
                  >
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python 3</option>
                    <option value="cpp">C++ (GCC)</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="java">Java (OpenJDK)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1.5 font-medium flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    Room Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    className="w-full bg-[#0B0F14] border border-white/5 hover:border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none transition-colors"
                    placeholder="Leave empty for public access"
                  />
                </div>

                <button
                  onClick={() => {
                    handleCreateRoom({
                      language: customLanguage,
                      password: customPassword.trim() || undefined
                    });
                    setShowCreateModal(false);
                  }}
                  disabled={isCreating}
                  className="w-full mt-4 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-950/20 hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 border border-blue-400/20 select-none"
                >
                  {isCreating ? 'Spawning Workspace...' : 'Create Custom Room'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
