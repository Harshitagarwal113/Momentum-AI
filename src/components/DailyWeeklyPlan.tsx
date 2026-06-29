import React from "react";
import { Clock, Calendar, ChevronRight, AlertCircle, Sparkles } from "lucide-react";

interface Task {
  id: string;
  title: string;
  deadline?: string;
  status: string;
  priority: string;
  predicted_deadline?: string;
}

interface ScheduleSlot {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
  is_cognitive_reservation?: boolean;
}

interface PlanProps {
  tasksList: Task[];
  schedulesList: ScheduleSlot[];
}

export default function DailyWeeklyPlan({ tasksList, schedulesList }: PlanProps) {
  // Create mock hourly layout from 8:00 AM to 8:00 PM for Daily Pacing Agenda
  const hours = [
    { label: "08:00 AM", routine: "Morning strategic brief alignment" },
    { label: "10:00 AM", slotType: "focus" },
    { label: "12:00 PM", routine: "Mid-day physical movement buffer" },
    { label: "02:00 PM", slotType: "focus" },
    { label: "04:00 PM", routine: "Executive check-in with Chief of Staff" },
    { label: "06:00 PM", slotType: "focus" },
    { label: "08:00 PM", routine: "Evening reflection and mental journal sync" }
  ];

  // Match active reservation slots to focus times
  const getSlotAtTimeIndex = (idx: number) => {
    if (schedulesList.length === 0) return null;
    const slotIdx = idx % schedulesList.length;
    return schedulesList[slotIdx];
  };

  // Group tasks by upcoming days of the week for the Weekly Plan Summary
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  const getTasksForDay = (dayIndex: number) => {
    return tasksList.filter((_, idx) => idx % 7 === dayIndex);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* LEFT COLUMN: DAILY COGNITIVE PACING AGENDA */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-panel p-6 rounded-2xl space-y-6 relative overflow-hidden">
          <div className="flex items-center gap-2 border-b border-neutral-900 pb-3">
            <Clock className="w-4.5 h-4.5 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold uppercase text-neutral-200">Daily Pacing Agenda</h3>
          </div>

          <div className="relative pl-6 border-l border-neutral-800/60 space-y-6">
            {hours.map((hr, idx) => {
              const matchedSlot = hr.slotType === "focus" ? getSlotAtTimeIndex(idx) : null;
              const isEvent = !!matchedSlot || !!hr.routine;

              return (
                <div key={idx} className="relative group">
                  {/* Timeline bullet with glow */}
                  <span className={`absolute -left-[30px] top-1.5 w-2.5 h-2.5 rounded-full border-2 bg-neutral-950 transition-all ${isEvent ? "border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "border-neutral-800 group-hover:border-neutral-600"}`} />
                  
                  <div className="space-y-1.5">
                    <span className="text-[9.5px] font-mono text-neutral-500 font-bold tracking-wider uppercase block">{hr.label}</span>
                    
                    {matchedSlot ? (
                      <div className="p-3.5 bg-neutral-900/40 hover:bg-neutral-900/60 border border-emerald-900/40 rounded-xl space-y-2 shadow-sm transition-all">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-emerald-300 font-display truncate">{matchedSlot.title}</h4>
                          <span className="shrink-0 text-[8px] font-mono font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded">
                            Focus Lock
                          </span>
                        </div>
                        {matchedSlot.description && (
                          <p className="text-[10px] text-neutral-400 leading-relaxed font-mono">{matchedSlot.description}</p>
                        )}
                      </div>
                    ) : hr.routine ? (
                      <div className="p-3 bg-neutral-900/30 border border-neutral-900/80 rounded-xl">
                        <p className="text-xs text-neutral-200 font-medium leading-relaxed font-display">{hr.routine}</p>
                      </div>
                    ) : (
                      <div className="text-[10.5px] text-neutral-600 italic font-mono pl-1">
                        Cognitive reservation buffer open window
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* RIGHT COLUMN: WEEKLY PLAN HIGHLIGHTS */}
      <div className="lg:col-span-7 space-y-6">
        <div className="glass-panel p-6 rounded-2xl space-y-6 relative overflow-hidden">
          <div className="flex items-center gap-2 border-b border-neutral-900 pb-3">
            <Calendar className="w-4.5 h-4.5 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold uppercase text-neutral-200">7-Day Weekly Milestones Grid</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {daysOfWeek.map((day, idx) => {
              const dayTasks = getTasksForDay(idx);
              const hasTasks = dayTasks.length > 0;

              return (
                <div 
                  key={day} 
                  className={`p-4 rounded-xl border transition-all ${
                    hasTasks 
                      ? "bg-neutral-900/30 border-neutral-800/80 hover:border-neutral-700/80" 
                      : "bg-neutral-950/20 border-neutral-900/30 border-dashed"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-900">
                    <span className="text-xs font-bold text-neutral-200 font-display">{day}</span>
                    <span className={`text-[8.5px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${hasTasks ? "bg-emerald-950 text-emerald-400" : "bg-neutral-900 text-neutral-500"}`}>
                      {hasTasks ? `${dayTasks.length} Milestones` : "Cleared"}
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-2">
                    {hasTasks ? (
                      dayTasks.map((t) => (
                        <div key={t.id} className="flex items-start gap-1.5 text-xs text-neutral-400">
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-neutral-300 truncate font-display">{t.title}</p>
                            {t.predicted_deadline && (
                              <p className="text-[8px] font-mono text-amber-500 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                Predicted: {new Date(t.predicted_deadline).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-neutral-500 font-mono italic leading-relaxed">
                        Cognitive overhead reservation cleared. No milestones allocated.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

    </div>
  );
}
