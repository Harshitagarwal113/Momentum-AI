import { Type } from "@google/genai";
import { UserContext, AgentResponse } from "./types.js";
import { callGeminiWithRetry, hasApiKey } from "./geminiClient.js";

export class ContextAgent {
  private static agentName = "Context Agent";
  private static instruction = `You are the Context Agent. Your responsibility is to analyze the user's active database state (profile, goals, tasks, habits, reflections, schedules) to build a complete baseline context. 
Extract the current situation, highlight critical pending tasks, summarize habit progress, and define the baseline situation.
Format your response as a strict JSON object with this exact structure:
{
  "thoughts": "Your step-by-step thinking about the current situation...",
  "contextSummary": "A concise summary of the user's current situation, focusing on goals and workload.",
  "activeWorkloadRating": "low | moderate | high | overwhelming",
  "criticalPriorities": [
    "Priority item 1...",
    "Priority item 2..."
  ]
}`;

  private static responseSchema = {
    type: Type.OBJECT,
    properties: {
      thoughts: { type: Type.STRING, description: "Your step-by-step reasoning/analysis." },
      contextSummary: { type: Type.STRING, description: "Concise situational summary." },
      activeWorkloadRating: { type: Type.STRING, description: "Workload level assessment." },
      criticalPriorities: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of critical priorities extracted from the active lists."
      }
    },
    required: ["thoughts", "contextSummary", "activeWorkloadRating", "criticalPriorities"]
  };

  public static async execute(context: UserContext, objective: string): Promise<AgentResponse> {
    const startTime = Date.now();
    console.log(`[${this.agentName}] Starting context synthesis...`);

    if (!hasApiKey()) {
      // Mock execution mode fallback
      return {
        agentName: this.agentName,
        thoughts: "Simulating context analysis because GEMINI_API_KEY is not configured.",
        output: {
          contextSummary: `User is tracking ${context.goals.length} goals, ${context.tasks.length} tasks, and ${context.habits.length} habits. Profile timezone: ${context.profile?.timezone || "UTC"}.`,
          activeWorkloadRating: context.tasks.length > 5 ? "high" : "moderate",
          criticalPriorities: context.tasks.slice(0, 2).map(t => t.title) || ["No active tasks"]
        },
        executionTimeMs: Date.now() - startTime
      };
    }

    const payload = {
      objective,
      profile: context.profile,
      goals: context.goals.map(g => ({ title: g.title, description: g.description, target_date: g.target_date, status: g.status })),
      tasks: context.tasks.map(t => ({ title: t.title, priority: t.priority, status: t.status, deadline: t.deadline })),
      habits: context.habits.map(h => ({ title: h.title, frequency: h.frequency, streak: h.streak })),
      schedules: context.schedules.map(s => ({ title: s.title, start: s.start_time, end: s.end_time }))
    };

    const prompt = `Assess the current baseline context for achieving the following objective: "${objective}".\n\nDatabase state:\n${JSON.stringify(payload, null, 2)}`;
    
    const result = await callGeminiWithRetry(prompt, this.instruction, this.responseSchema);
    const parsed = JSON.parse(result.text);

    return {
      agentName: this.agentName,
      thoughts: parsed.thoughts,
      output: {
        contextSummary: parsed.contextSummary,
        activeWorkloadRating: parsed.activeWorkloadRating,
        criticalPriorities: parsed.criticalPriorities
      },
      executionTimeMs: Date.now() - startTime
    };
  }
}
