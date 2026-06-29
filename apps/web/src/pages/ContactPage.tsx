import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Github, 
  Linkedin, AlertTriangle, Lightbulb, GitBranch, 
  HelpCircle, CheckCircle, Send, Cpu
} from 'lucide-react';

export default function ContactPage() {
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.name.trim()) nextErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Please enter a valid email address';
    }
    if (!formData.subject.trim()) nextErrors.subject = 'Subject is required';
    if (!formData.message.trim()) nextErrors.message = 'Message is required';
    
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate API request delay
    setTimeout(() => {
      setIsSubmitting(false);
      setShowToast(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setShowToast(false), 4000);
    }, 1500);
  };

  return (
    <div className="absolute inset-0 bg-[#0B0F14] text-slate-100 font-sans overflow-x-hidden overflow-y-auto pb-20 select-none">
      {/* Background Glowing Aurora Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/5 bg-[#0B0F14]/75 px-6 py-4 flex items-center justify-between transition-all">
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
          className="px-4 py-2 hover:bg-slate-800/40 text-slate-300 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-white/5"
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
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Get in Touch</span>
        </motion.div>
        
        <motion.h1
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white leading-tight"
        >
          Let's build better <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">collaboration together</span>
        </motion.h1>

        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto"
        >
          Have feedback, found a bug, or want to collaborate? I'd love to hear from you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-4 pt-2"
        >
          <a
            href="mailto:lakshyakumarsingh1@gmail.com"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 text-white rounded-xl text-sm font-semibold transition-all border border-blue-400/20"
          >
            Email Me
          </a>
          <a
            href="https://github.com/X-ImLucky-X/DevSync/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[#1A2233] hover:bg-[#20293d] hover:border-slate-700 hover:-translate-y-0.5 text-slate-300 rounded-xl text-sm font-semibold transition-all border border-white/5"
          >
            Report an Issue
          </a>
        </motion.div>
      </div>

      {/* Grid of Contact Cards */}
      <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Email Card */}
        <motion.a
          href="mailto:lakshyakumarsingh1@gmail.com"
          whileHover={{ y: -5 }}
          className="p-6 bg-[#1A2233] border border-white/5 rounded-2xl flex flex-col gap-4 text-left transition-all hover:border-slate-800 shadow-xl group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:rotate-6 transition-transform">
            <Mail className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Email</h4>
            <p className="text-sm font-semibold text-white mt-1">lakshyakumarsingh1@gmail.com</p>
            <p className="text-[11px] text-slate-500 mt-2 font-mono">Usually replies within 24 hours</p>
          </div>
        </motion.a>

        {/* GitHub Card */}
        <motion.a
          href="https://github.com/X-ImLucky-X/DevSync"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -5 }}
          className="p-6 bg-[#1A2233] border border-white/5 rounded-2xl flex flex-col gap-4 text-left transition-all hover:border-slate-800 shadow-xl group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:rotate-6 transition-transform">
            <Github className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">GitHub</h4>
            <p className="text-sm font-semibold text-white mt-1">github.com/X-ImLucky-X/DevSync</p>
            <p className="text-[11px] text-emerald-400 mt-2 font-semibold flex items-center gap-1">
              View Source →
            </p>
          </div>
        </motion.a>

        {/* LinkedIn Card */}
        <motion.a
          href="https://www.linkedin.com/in/lakshya-kumar-singh-62142128b/"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -5 }}
          className="p-6 bg-[#1A2233] border border-white/5 rounded-2xl flex flex-col gap-4 text-left transition-all hover:border-slate-800 shadow-xl group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:rotate-6 transition-transform">
            <Linkedin className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">LinkedIn</h4>
            <p className="text-sm font-semibold text-white mt-1">Lakshya Kumar Singh</p>
            <p className="text-[11px] text-slate-500 mt-2 font-mono">Let's Connect</p>
          </div>
        </motion.a>
      </div>

      {/* Contact Form Section */}
      <div className="max-w-xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 bg-[#1A2233] border border-white/5 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          <h3 className="font-display font-bold text-xl text-white mb-6 text-left">Send a Message</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#0B0F14] border border-white/5 hover:border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none transition-colors"
                placeholder="Your Name"
              />
              {errors.name && <p className="text-rose-500 text-[10px] mt-1 font-medium">{errors.name}</p>}
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#0B0F14] border border-white/5 hover:border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none transition-colors"
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="text-rose-500 text-[10px] mt-1 font-medium">{errors.email}</p>}
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-[#0B0F14] border border-white/5 hover:border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none transition-colors"
                placeholder="What is this about?"
              />
              {errors.subject && <p className="text-rose-500 text-[10px] mt-1 font-medium">{errors.subject}</p>}
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full bg-[#0B0F14] border border-white/5 hover:border-slate-800 focus:border-blue-500 rounded-xl p-4 text-sm text-slate-200 focus:outline-none transition-colors resize-none"
                placeholder="Write your message here..."
              />
              {errors.message && <p className="text-rose-500 text-[10px] mt-1 font-medium">{errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/10 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-blue-400/20 transition-all select-none"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Bug Report / Feature Request Cards */}
      <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bug Card */}
        <div className="p-6 bg-[#1A2233] border border-white/5 rounded-2xl flex flex-col gap-4 text-left shadow-xl group">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center group-hover:rotate-6 transition-transform">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">🐞 Found a bug?</h3>
            <p className="text-slate-400 text-xs leading-relaxed mt-1">
              Help make DevSync better. Report layout breaks, editing desyncs, or compile failures directly on our tracker.
            </p>
            <a
              href="https://github.com/X-ImLucky-X/DevSync/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold mt-4 transition-all"
            >
              Report Bug
            </a>
          </div>
        </div>

        {/* Feature Suggestion Card */}
        <div className="p-6 bg-[#1A2233] border border-white/5 rounded-2xl flex flex-col gap-4 text-left shadow-xl group">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:rotate-6 transition-transform">
            <Lightbulb className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">💡 Have an idea?</h3>
            <p className="text-slate-400 text-xs leading-relaxed mt-1">
              Want a specific feature, compiler language support, or UI tool? Share your suggestions and help guide the roadmap.
            </p>
            <a
              href="https://github.com/X-ImLucky-X/DevSync/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold mt-4 transition-all"
            >
              Suggest Feature
            </a>
          </div>
        </div>
      </div>

      {/* Contribute Section */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="p-8 bg-[#1A2233] border border-white/5 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5">
            <GitBranch className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white">Want to contribute?</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            DevSync is open source. Fork the repository, clone it locally, make changes, and open a Pull Request. We welcome code optimizations, canvas enhancements, and theme templates!
          </p>
          <div className="flex justify-center gap-4 flex-wrap text-[10px] text-slate-500 font-mono">
            <span className="px-2 py-1 bg-[#0B0F14] border border-white/5 rounded-md">1. Fork Repo</span>
            <span className="px-2 py-1 bg-[#0B0F14] border border-white/5 rounded-md">2. git clone</span>
            <span className="px-2 py-1 bg-[#0B0F14] border border-white/5 rounded-md">3. Create Branch</span>
            <span className="px-2 py-1 bg-[#0B0F14] border border-white/5 rounded-md">4. Open PR</span>
          </div>
          <a
            href="https://github.com/X-ImLucky-X/DevSync"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 border border-emerald-400/20 select-none"
          >
            View Contribution Guide
          </a>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-display font-bold text-white mb-8 text-center flex items-center justify-center gap-2">
          <HelpCircle className="w-6 h-6 text-blue-400" />
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4 text-left">
          <div className="p-6 bg-[#1A2233] border border-white/5 rounded-2xl shadow-lg">
            <h3 className="font-semibold text-sm text-white mb-2">Is DevSync free?</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Yes, DevSync is entirely free and open source under the MIT license. You can use it without restrictions.
            </p>
          </div>

          <div className="p-6 bg-[#1A2233] border border-white/5 rounded-2xl shadow-lg">
            <h3 className="font-semibold text-sm text-white mb-2">Is login required?</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              No. You can create a temporary workspace instantly in one click and begin collaborating without setting up an account.
            </p>
          </div>

          <div className="p-6 bg-[#1A2233] border border-white/5 rounded-2xl shadow-lg">
            <h3 className="font-semibold text-sm text-white mb-2">Are rooms permanent?</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              No, rooms are temporary. To optimize memory footprint, the server starts a 60-second garbage collection timer once all participants disconnect, pruning the room session from memory.
            </p>
          </div>

          <div className="p-6 bg-[#1A2233] border border-white/5 rounded-2xl shadow-lg">
            <h3 className="font-semibold text-sm text-white mb-2">Is my code stored on a server?</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              No. DevSync is built on a memory-only sync architecture. Document contents live temporarily in server memory and are wiped when the room GC prunes. We recommend copying your final code before leaving.
            </p>
          </div>

          <div className="p-6 bg-[#1A2233] border border-white/5 rounded-2xl shadow-lg">
            <h3 className="font-semibold text-sm text-white mb-2">Can I self-host?</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Yes. You can easily clone the repository and run both the server and web clients locally or deploy to services like Render, Vercel, or Docker.
            </p>
          </div>
        </div>
      </div>

      {/* Project Health / Status Section */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="p-6 bg-[#1A2233] border border-white/5 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Project Health</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Live developer details for visitors & recruiters</p>
            </div>
          </div>

          <div className="flex items-center gap-6 flex-wrap text-xs font-mono text-slate-400">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Status</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">🟢 Actively Maintained</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Version</span>
              <span className="font-semibold text-white">v1.0.0</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Open Source</span>
              <span className="font-semibold text-white">Yes (MIT)</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Replies</span>
              <span className="font-semibold text-white">~24 hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 pt-12 pb-8 border-t border-white/5 text-center space-y-4">
        <div className="flex justify-center gap-6 text-xs text-slate-500 font-medium">
          <span onClick={() => navigate('/features')} className="hover:text-white transition-colors cursor-pointer">Features</span>
          <a href="https://github.com/X-ImLucky-X/DevSync" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          <a href="https://www.linkedin.com/in/lakshya-kumar-singh-62142128b/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
          <a href="https://shadow-os-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Portfolio</a>
        </div>
        <p className="text-[11px] text-slate-600 leading-normal">
          Built with React • TypeScript • Yjs CRDTs • Monaco Editor • WebSockets<br />
          Made with ❤️ by <span className="font-semibold text-slate-400">Lakshya Kumar Singh</span>
        </p>
      </footer>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 bg-slate-900 border border-emerald-500/30 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 z-50 pointer-events-auto"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white">Message Sent Successfully</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Thank you! I will get back to you shortly.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
