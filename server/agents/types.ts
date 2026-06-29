export interface UserContext {
  profile: any;
  goals: any[];
  tasks: any[];
  habits: any[];
  reflections: any[];
  schedules: any[];
  memories: any[];
}

export interface AgentResponse<T = any> {
  agentName: string;
  thoughts: string;
  output: T;
  executionTimeMs: number;
}

export interface PlanningStep {
  step: number;
  title: string;
  description: string;
  estimated_duration_minutes: number;
  proactive: boolean;
}

export interface SuggestedDeadline {
  milestone: string;
  timeframe: string;
}

export interface OrchestratedPlan {
  plan_id: string;
  summary: string;
  priority_level: "high" | "medium" | "low";
  action_items: PlanningStep[];
  proactive_reminders: string[];
  suggested_deadlines: Record<string, string>;
  risks: string[];
  cognitive_insights: string[];
  memory_alignments: string[];
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface OrchestratedResult {
  plan: OrchestratedPlan;
  thinkingLogs: string[];
  agentTraces: Record<string, AgentResponse>;
  conversationHistory: ChatMessage[];
  is_mock: boolean;
}
