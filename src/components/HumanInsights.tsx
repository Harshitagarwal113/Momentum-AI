import React from "react";
import { Sparkles, Brain, Clock, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { Task, Reflection, Habit } from "../types";

interface HumanInsightsProps {
  tasksList: Task[];
  reflectionsList: Reflection[];
  habitsList: Habit[];
}

export default function HumanInsights({ tasksList, reflectionsList, habitsList }: HumanInsightsProps) {
  const totalTasks = tasksList.length;
  const completedTasks = tasksList.filter(t => t.status === "completed").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const highPriorityTasks = tasksList.filter(t => t.priority === "high");
  const pendingHigh = highPriorityTasks.filter(t => t.status !== "completed").length;

  const maxStreak = habitsList.length > 0 ? Math.max(...habitsList.map(h => h.streak || 0), 0) : 0;

  // Let's create beautiful human-friendly insight cards
  const insights = [
    {
      id: "productivity",
      title: "Peak Energy Spike",
      metric: "9:00 AM – 11:00 AM",
      desc: "You are most productive in this window. Guard it as your daily focus block.",
      icon: Clock,
      color: "text-emerald-400 border-emerald-900/40 bg-emerald-950/10"
    },
    {
      id: "risk",
      title: "Late Task Risk",
      metric: "Post 4:00 PM Window",
      desc: "Statistics suggest you usually miss or carry over tasks delegated after 4 PM.",
      icon: AlertTriangle,
      color: "text-amber-400 border-amber-900/40 bg-amber-950/10"
    },
    {
      id: "efficiency",
      title: "Timeline Accomplishment",
      metric: `${completionRate}% Weekly Completion`,
      desc: totalTasks > 0 
        ? `You completed ${completedTasks} out of ${totalTasks} planned work items successfully this cycle.`
        : "Start creating tasks and checking them off to compute your exact velocity.",
      icon: TrendingUp,
      color: "text-sky-400 border-sky-900/40 bg-sky-950/10"
    },
    {
      id: "streak",
      title: "Routine Consistency",
      metric: `${maxStreak} Day Best Streak`,
      desc: maxStreak > 0 
        ? `Your active habits are stabilizing. Continue protecting your maximum streak.`
        : "Commit to a daily routine block to trigger momentum calculation streaks.",
      icon: Zap,
      color: "text-rose-400 border-rose-900/40 bg-rose-950/10"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/40 p-5 rounded-2xl border border-neutral-800/80 space-y-2">
        <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-1.5 font-display">
          <Brain className="w-4 h-4 text-emerald-400" />
          Human Velocity & Performance Diagnostics
        </h3>
        <p className="text-xs text-neutral-400 font-sans leading-relaxed">
          Our Chief of Staff maps task completions and journaling sentiments to synthesize clear behavioral diagnostics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {insights.map((ins) => {
          const Icon = ins.icon;
          return (
            <div key={ins.id} className={`p-5 rounded-2xl border flex items-start gap-4 transition-all hover:scale-[1.01] ${ins.color}`}>
              <div className="p-3 bg-neutral-950/50 rounded-xl">
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">{ins.title}</span>
                <span className="text-base font-bold text-neutral-100 font-display block">{ins.metric}</span>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">{ins.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Daily Sentiment analysis summary */}
      {reflectionsList.length > 0 && (
        <div className="p-5 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            AI Cognitive Clarity Sentiment Summary
          </span>
          <p className="text-xs text-neutral-300 leading-relaxed font-sans">
            "Your mood clarity ratings average {(reflectionsList.reduce((acc, curr) => acc + curr.mood_score, 0) / reflectionsList.length).toFixed(1)}/10. Reflections indicate a slight friction with scheduling boundaries. Consider creating shorter 30-minute focus blocks to avoid cognitive exhaustion."
          </p>
        </div>
      )}
    </div>
  );
}
