import React from "react";
import { Shield, Sparkles, Database, Terminal, Cpu } from "lucide-react";

export default function NextJSIndex() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-xs text-neutral-400 mb-8 animate-fade-in">
        <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
        <span>Momentum AI – Engine Alpha</span>
      </div>

      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-400 bg-clip-text text-transparent max-w-3xl mb-6 leading-none">
        Your Autonomous Chief of Staff
      </h1>

      <p className="text-neutral-400 text-lg sm:text-xl max-w-xl mb-10 leading-relaxed">
        Proactively resolving milestones, analyzing risk indices, and automating administrative delegation loops before you prompt.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mt-8 text-left">
        <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
          <Cpu className="w-8 h-8 text-emerald-400 mb-4" />
          <h3 className="text-lg font-bold text-neutral-100 mb-2">Cognitive Core</h3>
          <p className="text-neutral-400 text-sm">
            Leverages Google Gemini 2.5 Flash for proactive task formulation and semantic execution mapping.
          </p>
        </div>

        <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
          <Database className="w-8 h-8 text-emerald-400 mb-4" />
          <h3 className="text-lg font-bold text-neutral-100 mb-2">Durable Context</h3>
          <p className="text-neutral-400 text-sm">
            Supabase PostgreSQL and pgvector for long-term memory streams and robust user profile syncs.
          </p>
        </div>

        <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
          <Shield className="w-8 h-8 text-emerald-400 mb-4" />
          <h3 className="text-lg font-bold text-neutral-100 mb-2">Secure Isolation</h3>
          <p className="text-neutral-400 text-sm">
            Stateless authentication mechanisms via JWT tokens, deployed globally on Google Cloud Run.
          </p>
        </div>
      </div>
    </div>
  );
}
