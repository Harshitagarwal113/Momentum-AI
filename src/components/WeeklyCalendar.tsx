import React, { useState } from "react";
import { Clock, Sparkles, AlertCircle, Calendar, RefreshCw, Trash2, Plus, GripVertical } from "lucide-react";
import { ScheduleSlot, Task } from "../types";

interface WeeklyCalendarProps {
  schedulesList: ScheduleSlot[];
  tasksList: Task[];
  onOptimize: () => void;
  onDeleteSlot: (id: string) => void;
  onCreateSlot: (title: string, start: string, end: string) => void;
  isOptimizing?: boolean;
}

export default function WeeklyCalendar({
  schedulesList,
  tasksList,
  onOptimize,
  onDeleteSlot,
  onCreateSlot,
  isOptimizing = false
}: WeeklyCalendarProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlotTitle, setNewSlotTitle] = useState("");
  const [newSlotDay, setNewSlotDay] = useState("Monday");
  const [newSlotTime, setNewSlotTime] = useState("10:00 AM");

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Helper to map schedule slot titles to priorities of matched tasks if any
  const getSlotPriority = (title: string): "high" | "medium" | "low" | "neutral" => {
    const matchedTask = tasksList.find(t => title.toLowerCase().includes(t.title.toLowerCase()) || t.title.toLowerCase().includes(title.toLowerCase()));
    if (matchedTask) return matchedTask.priority;
    return "neutral";
  };

  const getPriorityColorClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-l-red-500 bg-red-950/20 text-red-300";
      case "medium":
        return "border-l-4 border-l-amber-500 bg-amber-950/20 text-amber-300";
      case "low":
        return "border-l-4 border-l-sky-500 bg-sky-950/20 text-sky-300";
      default:
        return "border-l-4 border-l-emerald-500 bg-emerald-950/10 text-emerald-300";
    }
  };

  // Group slots by day
  const getSlotsForDay = (day: string) => {
    // If the slot description or title contains the day name, or is distributed deterministically
    return schedulesList.filter(s => {
      const desc = (s.description || "").toLowerCase();
      const title = s.title.toLowerCase();
      const matchDay = day.toLowerCase();
      return desc.includes(matchDay) || title.includes(matchDay) || 
        (daysOfWeek.indexOf(day) === schedulesList.indexOf(s) % 7);
    });
  };

  const handleCreateSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTitle.trim()) return;
    
    // Create a mock start/end time format for the API
    const startIso = new Date().toISOString();
    const endIso = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    
    onCreateSlot(`${newSlotTitle} [${newSlotDay}]`, startIso, endIso);
    setNewSlotTitle("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-900/40 p-4 rounded-2xl border border-neutral-800/80">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-1.5 font-display">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Strategic Weekly Calendar
          </h3>
          <p className="text-xs text-neutral-400 font-sans">
            AI-optimized focus blocks and meeting timelines color-coded by cognitive priorities.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none px-3.5 py-1.5 bg-neutral-950 border border-neutral-800 hover:border-emerald-800 text-neutral-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Block</span>
          </button>

          <button
            onClick={onOptimize}
            disabled={isOptimizing}
            className="flex-1 sm:flex-none px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20"
          >
            {isOptimizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Ask AI to Optimize</span>
          </button>
        </div>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {daysOfWeek.map((day) => {
          const slots = getSlotsForDay(day);
          return (
            <div key={day} className="bg-neutral-900/20 border border-neutral-800/60 rounded-2xl p-4 flex flex-col min-h-[350px]">
              <div className="border-b border-neutral-800/60 pb-2 mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-200 font-display">{day}</span>
                <span className="text-[10px] font-mono text-neutral-500 bg-neutral-950 px-1.5 py-0.5 rounded">
                  {slots.length}
                </span>
              </div>

              <div className="flex-1 space-y-2.5">
                {slots.length === 0 ? (
                  <div className="h-full flex items-center justify-center border border-dashed border-neutral-800/60 rounded-xl p-4 text-center">
                    <p className="text-[10px] text-neutral-600 italic font-mono leading-normal">
                      Open window
                    </p>
                  </div>
                ) : (
                  slots.map((slot) => {
                    const priority = getSlotPriority(slot.title);
                    return (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-xl border border-neutral-800/40 relative group transition-all hover:translate-y-[-1px] hover:shadow-md ${getPriorityColorClass(priority)}`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="space-y-1 min-w-0">
                            <h4 className="text-xs font-bold font-display leading-tight truncate" title={slot.title}>
                              {slot.title.split(" [")[0]}
                            </h4>
                            <div className="flex items-center gap-1 text-[9px] opacity-75 font-mono">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{slot.start_time ? new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Flexible"}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => onDeleteSlot(slot.id)}
                            className="text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Schedule Changes suggestion alert box */}
      {schedulesList.length > 0 && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-2xl flex items-start gap-3 animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-emerald-400 block">AI Scheduling Suggestion</span>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              "Based on your cognitive baseline, your energy spikes between 9 AM and 11 AM. I have reserved these windows as 'Cognitive Focus Blocks' for High priority engineering goals."
            </p>
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl w-full max-w-sm space-y-4">
            <h4 className="text-sm font-bold text-neutral-100 font-display">Add Calendar Block</h4>
            
            <form onSubmit={handleCreateSlotSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1">Block Title</label>
                <input
                  type="text"
                  required
                  value={newSlotTitle}
                  onChange={(e) => setNewSlotTitle(e.target.value)}
                  placeholder="e.g. Design Sync"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1">Day</label>
                  <select
                    value={newSlotDay}
                    onChange={(e) => setNewSlotDay(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 outline-none focus:border-emerald-500"
                  >
                    {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1">Time</label>
                  <input
                    type="text"
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-neutral-800 hover:border-neutral-700 text-neutral-400 text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
