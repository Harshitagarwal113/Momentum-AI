import React, { useState } from "react";
import { 
  Sparkles, 
  Terminal, 
  Cpu, 
  Database, 
  Shield, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Brain, 
  CheckSquare, 
  Play, 
  Calendar, 
  ArrowUpRight, 
  Lock, 
  Check, 
  HelpCircle, 
  Activity, 
  Code, 
  Layers, 
  Mic, 
  ChevronDown, 
  Star,
  ChevronRight
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogIn: () => void;
  darkMode: boolean;
}

export default function LandingPage({ onGetStarted, onLogIn, darkMode }: LandingPageProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [activeFeatureTab, setActiveFeatureTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Stats data
  const stats = [
    { value: "12.4 hrs", label: "Saved weekly per user", desc: "Automated cognitive slot allocation" },
    { value: "94%", label: "Task execution rate", desc: "Smarter planning, less context switching" },
    { value: "25k+", label: "Cognitive reservations", desc: "Active scheduled focus blocks" },
    { value: "< 2s", label: "Database synchronicity", desc: "Supabase Postgres real-time latency" }
  ];

  // Features list
  const features = [
    {
      title: "Autonomous Task Decomposition",
      badge: "Gemini 3.5 Flash Engine",
      desc: "Speak naturally about high-level milestones, and watch as Momentum AI unpacks them into dependency-mapped tasks with estimated effort weights.",
      icon: Brain,
      color: "from-emerald-500 to-teal-500",
      stats: "70% less manual typing",
      bullets: [
        "Resolves vague directives into exact actions",
        "Configures smart task dependencies & sequences",
        "Tracks and highlights critical path blockers"
      ]
    },
    {
      title: "Cognitive Calendaring",
      badge: "Deep Scheduling",
      desc: "An intelligent reservation model that schedules deep-focus blocks directly around your Google Calendar commitments to preserve high-energy hours.",
      icon: Calendar,
      color: "from-cyan-500 to-blue-600",
      stats: "+2.5h daily deep work",
      bullets: [
        "Detects and preserves peak productivity hours",
        "Reschedules on-the-fly when meetings overrun",
        "Integrates native Google Workspace OAuth"
      ]
    },
    {
      title: "Multimodal Voice Dictation",
      badge: "Real-time STT Integration",
      desc: "Draft comprehensive objectives, capture sudden ideas, or record voice strategy clips. Gemini compiles voice transcripts into actionable schedule slots.",
      icon: Mic,
      color: "from-amber-500 to-orange-500",
      stats: "4.8x faster capture",
      bullets: [
        "Native Web Speech API translation on the fly",
        "Direct-to-plan database routing",
        "Intelligent contextual error correction"
      ]
    },
    {
      title: "Full-Stack Dev Console Access",
      badge: "Monorepo Control Center",
      desc: "Browse compiled file contents, read live API traces, view database schema structures, and monitor active process logs directly from your settings panel.",
      icon: Terminal,
      color: "from-purple-500 to-indigo-600",
      stats: "100% architectural clarity",
      bullets: [
        "Live backend FastAPI route logging",
        "Interactive Supabase database visualizer",
        "Direct monorepo files inspector"
      ]
    }
  ];

  // FAQs
  const faqs = [
    {
      q: "What is an 'Autonomous Chief of Staff'?",
      a: "Momentum AI acts as more than just a task tracker; it is an agentic productivity system. It continuously monitors your schedule, reads your spoken or written goals, breaks them down into subtasks, estimates needed hours, schedules 'Cognitive Reservations' on your calendar, and proactively suggests shifts when meeting disruptions happen."
    },
    {
      q: "How does the Google Calendar integration work?",
      a: "By connecting your Google Workspace account via secure Google OAuth 2.0 protocol, Momentum reads your scheduled events and schedules custom 'Focus Slots' in between them. It never deletes or alters your existing calendar events—it only works around them to safeguard your focus."
    },
    {
      q: "Is my personal data secure?",
      a: "Yes, completely. All account authentication is handled through Supabase & Firebase Auth JWT handshake. Your personal data is stored in dedicated, secure database tables with row-level security policies (RLS). We do not train external public models on your proprietary tasks, memories, or journals."
    },
    {
      q: "Can I use it on mobile?",
      a: "Absolutely. Momentum is built using responsive Tailwind design grids, ensuring full tactile capability, clear text rendering, and microphone/voice support on desktop, tablet, and mobile screens alike."
    },
    {
      q: "How do I trigger the simulations?",
      a: "In the Insights and AI Assistant tabs, you can simulate typical developer crises like 'Simulate Meeting Overrun' or 'Simulate Missed Deadlines'. The CoS agent will recalculate task weights, shift schedules, suggest buffer blocks, and explain its reasoning in real-time."
    }
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${darkMode ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"}`}>
      
      {/* Decorative Blur Background Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* Header Sticky Navigation */}
      <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-300 ${
        darkMode ? "bg-neutral-950/80 border-neutral-900/80" : "bg-white/80 border-neutral-200"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950/30">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight font-display">Momentum AI</span>
              <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest leading-none">Autonomous CoS</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-neutral-400">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How it Works</a>
            <a href="#architecture" className="hover:text-emerald-400 transition-colors">Architecture</a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a>
            <a href="#faqs" className="hover:text-emerald-400 transition-colors">FAQs</a>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onLogIn}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                darkMode 
                  ? "bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800" 
                  : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              Log In
            </button>
            <button 
              onClick={onGetStarted}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-950/20 flex items-center gap-1"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6 text-left">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wide uppercase bg-emerald-950/30 text-emerald-400 border border-emerald-900/40">
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            <span>AI Chief of Staff Executive Assistant</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-display leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-neutral-400">
            Your Autonomous <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Chief of Staff
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-xl">
            Momentum AI orchestrates your goals, deconstructs loose milestones into immediate estimated subtasks, secures peak energy calendar slots, and automatically restructures your schedule when plans shift.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={onGetStarted}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-xl shadow-emerald-950/30 flex items-center justify-center gap-2"
            >
              <span>Launch Your CoS Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className={`px-6 py-3.5 border rounded-xl font-semibold text-sm transition-all text-center flex items-center justify-center gap-2 ${
                darkMode 
                  ? "bg-neutral-900/60 border-neutral-800/80 hover:bg-neutral-900 text-neutral-300" 
                  : "bg-neutral-100 border-neutral-200 hover:bg-neutral-200 text-neutral-700"
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>Explore Product Tour</span>
            </a>
          </div>

          {/* Credentials lock notes */}
          <div className="flex items-center gap-4 text-xs font-mono text-neutral-500 pt-2">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" /> Secure JWT handshake
            </span>
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-teal-500" /> Supabase Real-time DB
            </span>
          </div>
        </div>

        {/* Live Visual Interactive Mockup Widget */}
        <div className="lg:col-span-6 relative">
          <div className="absolute inset-0 bg-emerald-500/10 rounded-3xl blur-2xl -z-10 animate-pulse" />
          
          <div className={`rounded-2xl border p-5 shadow-2xl space-y-4 font-mono transition-colors duration-300 ${
            darkMode ? "bg-neutral-900/80 border-neutral-800/80 text-neutral-300" : "bg-white border-neutral-200 text-neutral-800"
          }`}>
            {/* Window header */}
            <div className="flex items-center justify-between border-b pb-3 border-neutral-800/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-widest flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>cos_agent_engine.py</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-900/40 px-2 py-0.5 rounded">
                Active
              </span>
            </div>

            {/* Simulated Chat Dialogue */}
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded bg-neutral-800 text-neutral-300 flex items-center justify-center font-bold text-[10px]">
                  H
                </div>
                <div className="flex-1 bg-neutral-950/60 border border-neutral-900 p-2.5 rounded-lg">
                  <p className="text-[11px] font-sans">"I have a key board presentation next Tuesday morning at 10 AM. It's high stake. Decompose this goal and block off focus slots on my calendar."</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 bg-neutral-950/80 border border-emerald-900/30 p-2.5 rounded-lg space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wide">
                    <Brain className="w-3 h-3" />
                    <span>Momentum CoS Agent Action Plan</span>
                  </div>
                  <p className="text-[11px] font-sans text-neutral-300">Milestone processed: Breaking down "Board Presentation preparation" into 4 progressive dependent sprints based on your high-cognitive availability hours:</p>
                  
                  {/* Sprints */}
                  <div className="space-y-1.5 pl-2 border-l border-emerald-800/60 py-1 font-mono text-[10px]">
                    <div className="flex justify-between text-neutral-200">
                      <span>1. Outline slide layout & key findings</span>
                      <span className="text-emerald-400 font-bold">1.5h (High Cog)</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>2. Extract financial charts from DB</span>
                      <span>1.0h (Low Cog)</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>3. Build slide deck draft</span>
                      <span>2.0h (Medium Cog)</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>4. Dress rehearsal & flow optimization</span>
                      <span className="text-emerald-400 font-bold">1.5h (High Cog)</span>
                    </div>
                  </div>

                  <div className="text-[10px] bg-neutral-950 px-2 py-1 rounded border border-neutral-900 flex items-center gap-2 text-neutral-400">
                    <Clock className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                    <span>Focus reservations blocked: Oct 12 & 13 @ 09:00 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className={`border-y transition-colors duration-300 ${
        darkMode ? "bg-neutral-900/20 border-neutral-900" : "bg-neutral-100/40 border-neutral-200"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center md:text-left space-y-1.5">
                <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 tracking-tight font-display">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-neutral-200">{stat.label}</div>
                <div className="text-[10px] text-neutral-500 leading-normal">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Panel (Dynamic Bento Grid) */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-emerald-950/30 text-emerald-400 border border-emerald-900/30">
            System Capabilities
          </div>
          <h2 className="text-3xl font-black tracking-tight font-display sm:text-4xl text-neutral-100">
            Architected to keep you in the zone.
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            A comprehensive, double-loop productivity engine balancing task architecture, time management, and mental reflection automatically.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className={`md:col-span-6 rounded-2xl border p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300 shadow-lg relative overflow-hidden group ${
                  darkMode ? "bg-neutral-900/40 border-neutral-800/80" : "bg-white border-neutral-200"
                }`}
              >
                {/* Visual Glow Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300" />
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-900 text-emerald-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold tracking-wider">{feat.badge}</span>
                      <h3 className="text-sm font-extrabold text-neutral-100 tracking-tight font-display">{feat.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">{feat.desc}</p>
                  
                  {/* Bullets */}
                  <ul className="space-y-1.5 pl-1">
                    {feat.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-1.5 text-[11px] text-neutral-300 font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stat Metric Footer */}
                <div className="mt-6 pt-4 border-t border-neutral-800/40 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold">Performance Impact</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{feat.stats}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Flow */}
      <section id="how-it-works" className={`border-y transition-colors duration-300 py-20 ${
        darkMode ? "bg-neutral-900/10 border-neutral-900" : "bg-neutral-100/30 border-neutral-200"
      }`}>
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-emerald-950/30 text-emerald-400 border border-emerald-900/30">
              Operational Cycle
            </span>
            <h2 className="text-2.5xl font-black tracking-tight font-display text-neutral-100">
              How Momentum AI Streamlines Flow
            </h2>
            <p className="text-xs text-neutral-400">
              An automated dual-loop architecture that ensures high-level goals materialize into daily achievements seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Voice/Text Context",
                desc: "Talk to your Chief of Staff naturally. Explain upcoming releases, priorities, disruptions, or custom deadlines."
              },
              {
                step: "02",
                title: "Autonomous Unpack",
                desc: "The agent decomposes milestones into sequenced subtasks, assigns effort weightings, and evaluates risks."
              },
              {
                step: "03",
                title: "Cognitive Scheduling",
                desc: "Focus reservations are locked into your weekly calendar view around meetings based on available energy."
              },
              {
                step: "04",
                title: "Daily Reflections",
                desc: "A closed-loop night analysis identifies productivity bottlenecks, logs completed habits, and auto-adapts tomorrow."
              }
            ].map((step, idx) => (
              <div 
                key={idx}
                className={`p-5 rounded-xl border relative transition-all group ${
                  darkMode ? "bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700" : "bg-white border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-emerald-500 to-teal-500 font-display mb-3">
                  {step.step}
                </div>
                <h4 className="text-xs font-bold text-neutral-100 mb-1.5">{step.title}</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Tech Stack Architecture Panel */}
      <section id="architecture" className="max-w-7xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-emerald-950/30 text-emerald-400 border border-emerald-900/30">
            Tech Infrastructure
          </span>
          <h2 className="text-2.5xl font-black tracking-tight font-display text-neutral-100">
            A Transparent Developer Blueprint
          </h2>
          <p className="text-xs text-neutral-400">
            Explore the production-ready monorepo framework fueling Momentum's sub-second queries.
          </p>
        </div>

        <div className={`p-6 rounded-2xl border grid grid-cols-1 lg:grid-cols-12 gap-8 ${
          darkMode ? "bg-neutral-900/40 border-neutral-800/80" : "bg-white border-neutral-200"
        }`}>
          {/* Schematic Diagram Block */}
          <div className="lg:col-span-8 space-y-4">
            <h4 className="text-xs font-bold text-neutral-100 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Full-Stack Integration Architecture</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Frontend Node */}
              <div className="bg-neutral-950/80 p-4 rounded-xl border border-neutral-900 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">React Client</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="space-y-1 text-[10px] text-neutral-400 font-mono">
                  <div>• Next.js 15 Client</div>
                  <div>• Tailwind CSS Styles</div>
                  <div>• Web Speech API</div>
                  <div>• Recharts Analytics</div>
                </div>
              </div>

              {/* API Gateway Agent */}
              <div className="bg-neutral-950/80 p-4 rounded-xl border border-neutral-900 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">FastAPI Core</span>
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                </div>
                <div className="space-y-1 text-[10px] text-neutral-400 font-mono">
                  <div>• Python Agent Loop</div>
                  <div>• Cognitive Heuristics</div>
                  <div>• Memory Manager</div>
                  <div>• JWT Auth Enforcer</div>
                </div>
              </div>

              {/* Database Layer */}
              <div className="bg-neutral-950/80 p-4 rounded-xl border border-neutral-900 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Database Nodes</span>
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                </div>
                <div className="space-y-1 text-[10px] text-neutral-400 font-mono">
                  <div>• PostgreSQL Engine</div>
                  <div>• Row Level Security</div>
                  <div>• Drizzle Migration</div>
                  <div>• Real-time Listener</div>
                </div>
              </div>

            </div>

            {/* Micro schematic flowchart footer */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-900/60 flex flex-wrap items-center justify-center gap-2 font-mono text-[9px] text-neutral-400">
              <span>Client Input</span>
              <ArrowRight className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-bold">FastAPI Agent</span>
              <ArrowRight className="w-3 h-3 text-emerald-400" />
              <span>Gemini Decomposition</span>
              <ArrowRight className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Supabase PostgreSQL</span>
              <ArrowRight className="w-3 h-3 text-emerald-400" />
              <span>GCal OAuth</span>
            </div>
          </div>

          {/* Quick Technical Specs Block */}
          <div className="lg:col-span-4 bg-neutral-950 p-5 rounded-xl border border-neutral-900 space-y-4">
            <h5 className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider">Monorepo Specifications</h5>
            
            <div className="space-y-3 font-mono text-[11px]">
              <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                <span className="text-neutral-500">API Latency:</span>
                <span className="text-emerald-400 font-bold">~140ms average</span>
              </div>
              <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                <span className="text-neutral-500">Deconstruct Speed:</span>
                <span className="text-emerald-400 font-bold">&lt; 1.8s</span>
              </div>
              <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                <span className="text-neutral-500">Model Framework:</span>
                <span className="text-neutral-200">Gemini 3.5 Flash</span>
              </div>
              <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                <span className="text-neutral-500">Authorization:</span>
                <span className="text-neutral-200">JWT Auth / cookie session</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Dual-Sync:</span>
                <span className="text-emerald-400 font-bold">GCal OAuth 2.0</span>
              </div>
            </div>

            <div className="p-2.5 bg-neutral-900/40 rounded border border-neutral-800 flex items-start gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[9px] text-neutral-500 leading-normal">
                Strict JWT-signed token handlers lock and encase all user actions. Zero public exposure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={`border-t transition-colors duration-300 py-20 ${
        darkMode ? "bg-neutral-900/10 border-neutral-900" : "bg-neutral-100/20 border-neutral-200"
      }`}>
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-emerald-950/30 text-emerald-400 border border-emerald-900/30">
              SaaS Subscriptions
            </span>
            <h2 className="text-2.5xl font-black tracking-tight font-display text-neutral-100">
              Select Your Operational Power
            </h2>
            <p className="text-xs text-neutral-400">
              Get started with our free plan or unlock the full agentic capabilities of your Executive Chief of Staff.
            </p>

            {/* Toggle Billing */}
            <div className="inline-flex items-center p-0.5 rounded-lg border bg-neutral-950 border-neutral-900 mt-2">
              <button 
                onClick={() => setBillingPeriod("monthly")}
                className={`px-3 py-1 text-[10px] font-mono rounded-md font-bold transition-all ${
                  billingPeriod === "monthly" ? "bg-emerald-600 text-white" : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingPeriod("yearly")}
                className={`px-3 py-1 text-[10px] font-mono rounded-md font-bold transition-all flex items-center gap-1 ${
                  billingPeriod === "yearly" ? "bg-emerald-600 text-white" : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <span>Yearly</span>
                <span className="bg-amber-950/40 text-amber-400 px-1 py-0.2 rounded text-[8px] border border-amber-900/30 font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Standard Plan */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
              darkMode ? "bg-neutral-950 border-neutral-900" : "bg-white border-neutral-200"
            }`}>
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-neutral-100 tracking-tight font-display">Operational Basic</h3>
                  <p className="text-[11px] text-neutral-400">For individual builders organizing daily goals manually.</p>
                </div>

                <div className="font-display">
                  <span className="text-4xl font-extrabold text-neutral-100">$0</span>
                  <span className="text-xs text-neutral-500 font-sans"> / forever free</span>
                </div>

                <hr className="border-neutral-900" />

                <ul className="space-y-2.5 text-xs text-neutral-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Create Unlimited Goals & Tasks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Track 3 Daily Habits & Streak Logs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Manual Weekly Schedule Allocation</span>
                  </li>
                  <li className="flex items-center gap-2 text-neutral-500">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>No Autonomous Agent chat interface</span>
                  </li>
                  <li className="flex items-center gap-2 text-neutral-500">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>No Google Workspace Calendar sync</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={onGetStarted}
                className={`w-full py-3 mt-8 border rounded-xl font-bold text-xs transition-all ${
                  darkMode 
                    ? "bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-neutral-300" 
                    : "bg-neutral-100 border-neutral-200 hover:bg-neutral-200 text-neutral-700"
                }`}
              >
                Launch Free Workspace
              </button>
            </div>

            {/* Premium Plan */}
            <div className="p-6 rounded-2xl border border-emerald-500 bg-gradient-to-b from-emerald-950/20 via-neutral-950 to-neutral-950 flex flex-col justify-between transition-all relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 bg-emerald-500 text-neutral-950 text-[9px] font-mono font-black uppercase tracking-wider px-3.5 py-1 rounded-bl-xl">
                Most Popular
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-bold text-neutral-100 tracking-tight font-display">Executive Premium</h3>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-neutral-400">For elite professionals requiring autonomous agent calendar co-pilots.</p>
                </div>

                <div className="font-display">
                  <span className="text-4xl font-extrabold text-neutral-100">
                    {billingPeriod === "monthly" ? "$19" : "$15"}
                  </span>
                  <span className="text-xs text-neutral-500 font-sans"> / user / month</span>
                </div>

                <hr className="border-neutral-900" />

                <ul className="space-y-2.5 text-xs text-neutral-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold">Autonomous CoS ChatGPT Interface</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Double-Loop Google Calendar Synchronization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Gemini 3.5 Task Decomposition Engine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Multimodal STT Speech Analytics Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Interactive Dev Console (Logs, Traces, Monorepo File Inspector)</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={onGetStarted}
                className="w-full py-3 mt-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2"
              >
                <span>Upgrade to Executive CoS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Accordion FAQ Area */}
      <section id="faqs" className="max-w-4xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-emerald-950/30 text-emerald-400 border border-emerald-900/30">
            Common Inquiries
          </span>
          <h2 className="text-2.5xl font-black tracking-tight font-display text-neutral-100">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-neutral-400">
            Everything you need to know about the Momentum autonomous chief of staff infrastructure.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div 
                key={i}
                className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                  isOpen 
                    ? (darkMode ? "bg-neutral-900/60 border-emerald-800/40" : "bg-white border-neutral-300")
                    : (darkMode ? "bg-neutral-900/20 border-neutral-800/60 hover:bg-neutral-900/40" : "bg-white border-neutral-200 hover:border-neutral-300")
                }`}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left transition-colors font-semibold text-xs sm:text-sm"
                >
                  <span className="text-neutral-200">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className={`px-5 pb-5 pt-1 text-xs text-neutral-400 leading-relaxed font-sans border-t ${
                    darkMode ? "border-neutral-900" : "border-neutral-100"
                  }`}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Beautiful SaaS Footer */}
      <footer className={`border-t transition-colors duration-300 ${
        darkMode ? "bg-neutral-950 border-neutral-900" : "bg-neutral-100/60 border-neutral-200"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-base font-extrabold text-neutral-100 font-display">Momentum AI</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed font-sans">
              Autonomous cognitive planning framework and developer-centric productivity co-pilot synchronizing goals and actions seamlessly.
            </p>
            <div className="text-[10px] font-mono text-neutral-600">
              © 2026 Momentum AI. All rights reserved.
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <h5 className="font-bold text-neutral-200 font-display uppercase tracking-wider text-[10px]">Product</h5>
            <ul className="space-y-2 text-neutral-500">
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How it works</a></li>
              <li><a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
              <li><button onClick={onGetStarted} className="hover:text-emerald-400 transition-colors text-left">Request Access</button></li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <h5 className="font-bold text-neutral-200 font-display uppercase tracking-wider text-[10px]">Architecture</h5>
            <ul className="space-y-2 text-neutral-500 font-mono text-[11px]">
              <li>Next.js 15 Client</li>
              <li>FastAPI API Engine</li>
              <li>PostgreSQL DB</li>
              <li>Row-Level Security</li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <h5 className="font-bold text-neutral-200 font-display uppercase tracking-wider text-[10px]">Compliance & Security</h5>
            <div className="p-3 bg-neutral-900/40 rounded-lg border border-neutral-900 space-y-1.5 font-mono text-[9px] text-neutral-500">
              <div className="flex items-center gap-1 text-emerald-400 font-bold">
                <Shield className="w-3.5 h-3.5" />
                <span>JWT handshakes</span>
              </div>
              <p className="leading-relaxed">All requests require cryptographic cookies and authorization headers. Local DB state protected by standard row filtration.</p>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
