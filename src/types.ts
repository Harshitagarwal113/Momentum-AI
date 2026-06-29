export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed";
  deadline?: string;
  duration_minutes?: number;
  risk_score?: number;
  risk_reason?: string;
  predicted_deadline?: string;
  is_proactive?: boolean;
  subtasks?: SubTask[];
  dependencies?: string[];
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  status: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: "daily" | "weekly";
  streak: number;
}

export interface Reflection {
  id: string;
  date?: string;
  mood_score: number;
  insights: string;
  blockers?: string;
}

export interface ScheduleSlot {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
  is_cognitive_reservation?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  payload?: any;
  ip_address: string;
  created_at: string;
}

export interface Memory {
  id: string;
  content: string;
  created_at: string;
}
