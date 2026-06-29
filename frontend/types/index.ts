export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  step: number;
  title: string;
  description: string;
  estimatedDurationMinutes: number;
  proactive: boolean;
}

export interface AgentBriefing {
  planId: string;
  summary: string;
  priorityLevel: 'high' | 'medium' | 'low';
  actionItems: ActionItem[];
  proactiveReminders: string[];
  suggestedDeadlines: Record<string, string>;
}

export interface UserSession {
  userId: string;
  email: string;
  role: string;
  accessToken: string;
}
