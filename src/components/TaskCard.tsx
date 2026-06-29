import React, { useState } from "react";
import { Clock, Calendar, CheckCircle2, Circle, Play, Trash2, CalendarRange, AlertTriangle } from "lucide-react";
import { Task } from "../types";

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
  onUpdateDeadline: (id: string, newDeadline: string) => void;
  darkMode?: boolean;
}

export default function TaskCard({ task, onUpdateStatus, onDelete, onUpdateDeadline, darkMode = true }: TaskCardProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(task.deadline ? task.deadline.split("T")[0] : "");

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "completed":
        return "text-emerald-400";
      case "in_progress":
        return "text-emerald-500 font-semibold";
      default:
        return "text-neutral-400";
    }
  };

  const formatDuration = (mins?: number) => {
    if (!mins) return "30m";
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const rem = mins % 60;
      return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
    }
    return `${mins}m`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    if (newDate) {
      onUpdateDeadline(task.id, new Date(newDate).toISOString());
      setShowDatePicker(false);
    }
  };

  const isCompleted = task.status === "completed";
  const isInProgress = task.status === "in_progress";

  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        isCompleted
          ? "bg-neutral-900/10 border-neutral-900/40 opacity-60"
          : "bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700/60 shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={() => onUpdateStatus(task.id, isCompleted ? "pending" : "completed")}
            className="mt-0.5 shrink-0 transition-colors"
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Circle className="w-5 h-5 text-neutral-500 hover:text-emerald-500" />
            )}
          </button>
          
          <div className="min-w-0 space-y-1">
            <h4 className={`text-sm font-bold truncate ${isCompleted ? "line-through text-neutral-500" : "text-neutral-100"}`}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-neutral-400 leading-relaxed font-sans line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="text-neutral-500 hover:text-red-400 p-1 rounded transition-colors shrink-0"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Meta indicators row */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityStyles(task.priority)}`}>
          {task.priority}
        </span>
        
        <span className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
          <Clock className="w-3.5 h-3.5 text-neutral-500" />
          {formatDuration(task.duration_minutes)}
        </span>

        {task.deadline ? (
          <span className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            {new Date(task.deadline).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-[11px] text-neutral-500 italic font-mono">No deadline</span>
        )}

        {task.predicted_deadline && (
          <span className="flex items-center gap-1 text-[10px] text-amber-500 font-mono bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
            <AlertTriangle className="w-3 h-3" />
            Predicted: {new Date(task.predicted_deadline).toLocaleDateString()}
          </span>
        )}

        {task.is_proactive && (
          <span className="text-[9px] uppercase font-mono font-bold tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded-full">
            Proactive
          </span>
        )}
      </div>

      {/* Primary UX actions row */}
      <div className="mt-4 pt-3 border-t border-neutral-800/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isCompleted && !isInProgress && (
            <button
              onClick={() => onUpdateStatus(task.id, "in_progress")}
              className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 hover:border-emerald-800 text-neutral-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
            >
              <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
              <span>Start</span>
            </button>
          )}

          {isInProgress && (
            <span className="text-xs text-emerald-400 font-bold font-mono animate-pulse flex items-center gap-1 bg-emerald-950/20 border border-emerald-900/30 px-3 py-1 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              In Progress
            </span>
          )}

          {!isCompleted && (
            <button
              onClick={() => onUpdateStatus(task.id, "completed")}
              className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 hover:border-emerald-800 text-neutral-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Complete</span>
            </button>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 hover:border-emerald-800 text-neutral-400 hover:text-neutral-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
            title="Reschedule task deadline"
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>Reschedule</span>
          </button>
          
          {showDatePicker && (
            <div className="absolute right-0 bottom-full mb-2 z-10 p-3 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl">
              <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1">Set Deadline</label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1 text-xs text-neutral-200 outline-none focus:border-emerald-500"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
