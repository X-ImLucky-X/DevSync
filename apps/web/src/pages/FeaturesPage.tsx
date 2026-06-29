import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Terminal, Users, Zap, ArrowLeft, Paintbrush, 
  Lock, CheckCircle
} from 'lucide-react';

export default function FeaturesPage() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="absolute inset-0 bg-[#080c14] text-slate-100 font-sans overflow-x-hidden overflow-y-auto pb-20">
      {/* Background Glowing Aurora Gradients (Hardware Accelerated) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(168,85,247,0.08),transparent_50%),radial-gradient(circle_at_70%_20%,rgba(16,185,129,0.03),transparent_35%)] transform-gpu" />

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-900/60 bg-[#080c14]/75 px-6 py-4 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <img 
            src="/logo-icon.png" 
            alt="DevSync Logo" 
            className="w-9 h-9 object-contain cursor-pointer" 
            onClick={() => navigate('/')} 
          />
          <span 
            onClick={() => navigate('/')} 
            className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent cursor-pointer"
          >
            DevSync
          </span>
        </div>

        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 hover:bg-slate-800/40 text-slate-300 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-slate-800/80"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </header>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-8 text-center space-y-6">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400"
        >
          <Zap className="w-3.5 h-3.5 fill-indigo-400" />
          <span>Detailed Platform Specs</span>
        </motion.div>
        
        <motion.h1
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white leading-tight"
        >
          Supercharged for <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Velocity & Collaboration</span>
        </motion.h1>

        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto"
        >
          DevSync brings design, development, and team alignment into a single high-performance workspace. Experience zero latency sync with the ultimate suite of tools.
        </motion.p>
      </div>

      {/* Detailed Features Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Feature 1 */}
        <motion.div 
          variants={itemVariants}
          className="p-8 bg-[#0b0f19]/70 border border-slate-900 rounded-3xl flex flex-col gap-5 text-left relative overflow-hidden backdrop-blur-sm group hover:border-slate-800/80 transition-colors"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/5">
            <Paintbrush className="w-6 h-6 text-blue-400" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-xl text-white">Figma-Grade Vector Canvas</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Design workflows programmatically. Our vector canvas engine operates like a professional design tool, giving you freedom of layout and drawing alongside your code editor.
            </p>
          </div>
          <ul className="text-xs text-slate-500 space-y-2 font-mono">
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-blue-400" /> 8 resizing transform handles per shape</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-blue-400" /> Owner-based drag locking & conflicts resolution</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-blue-400" /> Custom shapes: rectangles, circles, diamonds, arrows</li>
          </ul>
        </motion.div>

        {/* Feature 2 */}
        <motion.div 
          variants={itemVariants}
          className="p-8 bg-[#0b0f19]/70 border border-slate-900 rounded-3xl flex flex-col gap-5 text-left relative overflow-hidden backdrop-blur-sm group hover:border-slate-800/80 transition-colors"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-xl text-white">Real-Time Team Sync</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Powered by Yjs CRDTs. Collaborators edit and type concurrently with zero fear of cursor overrides, desynchronization, or data loss.
            </p>
          </div>
          <ul className="text-xs text-slate-500 space-y-2 font-mono">
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Collaborative colored cursors with labels</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Live cursor tags streaming current actions</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Instant teammate status indicator list</li>
          </ul>
        </motion.div>

        {/* Feature 3 */}
        <motion.div 
          variants={itemVariants}
          className="p-8 bg-[#0b0f19]/70 border border-slate-900 rounded-3xl flex flex-col gap-5 text-left relative overflow-hidden backdrop-blur-sm group hover:border-slate-800/80 transition-colors"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/10 transition-colors" />
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-lg shadow-purple-500/5">
            <Terminal className="w-6 h-6 text-purple-400" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-xl text-white">Sandbox Compiler Execution</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Run scripts directly in the browser. Supports Python, Node.js, TypeScript, Go, Rust, Java, and C++ with standard console input streams.
            </p>
          </div>
          <ul className="text-xs text-slate-500 space-y-2 font-mono">
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-purple-400" /> Sandbox compilation via Wandbox APIs</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-purple-400" /> Interactive console input (stdin)</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-purple-400" /> Streamed compiler logs and timing results</li>
          </ul>
        </motion.div>

        {/* Feature 4 */}
        <motion.div 
          variants={itemVariants}
          className="p-8 bg-[#0b0f19]/70 border border-slate-900 rounded-3xl flex flex-col gap-5 text-left relative overflow-hidden backdrop-blur-sm group hover:border-slate-800/80 transition-colors"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/5">
            <Lock className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-xl text-white">Secure Room Controls</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Lock rooms with a password to restrict editing settings or configure strict user profiles for interview settings.
            </p>
          </div>
          <ul className="text-xs text-slate-500 space-y-2 font-mono">
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-indigo-400" /> Lobby verification and passcode screens</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-indigo-400" /> Lock files to read-only for guest users</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-indigo-400" /> Room settings and master rights transfers</li>
          </ul>
        </motion.div>
      </motion.div>

      {/* Interactive Feature Demo CTA */}
      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="p-8 md:p-12 bg-gradient-to-tr from-blue-600/15 via-indigo-600/5 to-purple-600/15 border border-blue-500/20 rounded-3xl text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white">Ready to start collaborating?</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto">
            Spawn your first room in less than a second. Invite your team and start coding, drawing, and debugging together now.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2"
          >
            Create Your Room
          </button>
        </div>
      </div>
    </div>
  );
}
