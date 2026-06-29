import { Type } from "@google/genai";
import { UserContext, AgentResponse, PlanningStep } from "./types.js";
import { callGeminiWithRetry, hasApiKey } from "./geminiClient.js";

export class SchedulerAgent {
  private static agentName = "Scheduler Agent";
  private static instruction = `You are the Scheduler Agent. Your responsibility is to analyze action items and suggest realistic milestones, timeframe deadlines, and focus calendar block suggestions.
Suggest explicit, relative timeframe windows (e.g., 'In 1 day', 'In 3 days', 'Next week') for milestones.
Format your response as a strict JSON object with this exact structure:
{
  "thoughts": "Your step-by-step thinking about calendar layout...",
  "suggested_deadlines": {
    "Milestone Name": "Relative Timeframe (e.g. In 2 days)"
  },
  "proactive_reminders": [
    "Reminder content..."
  ]
}`;

  private static responseSchema = {
    type: Type.OBJECT,
    properties: {
      thoughts: { type: Type.STRING, description: "Your step-by-step reasoning/analysis." },
      suggested_deadlines: {
        type: Type.OBJECT,
        additionalProperties: { type: Type.STRING },
        description: "Key-value mapping of milestone name to suggested relative date/timeframe."
      },
      proactive_reminders: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Proactive calendar/alert notifications to trigger."
      }
    },
    required: ["thoughts", "suggested_deadlines", "proactive_reminders"]
  };

  public static async execute(
    context: UserContext,
    objective: string,
    actionItems: PlanningStep[]
  ): Promise<AgentResponse> {
    const startTime = Date.now();
    console.log(`[${this.agentName}] Scheduling focus blocks...`);

    if (!hasApiKey()) {
      return {
        agentName: this.agentName,
        thoughts: "Simulating scheduling suggestions.",
        output: {
          suggested_deadlines: {
            "First Draft Outline": "In 1 day",
            "Functional Scaffold": "In 3 days",
            "Project Completion Review": "In 5 days"
          },
          proactive_reminders: [
            "Proactive alert will fire 24 hours prior to outline submission.",
            "Focus reservation slot blocked out on system logs."
          ]
        },
        executionTimeMs: Date.now() - startTime
      };
    }

    const payload = {
      objective,
      actionItems,
      timezone: context.profile?.timezone || "UTC",
      currentDate: new Date().toISOString()
    };

    const prompt = `Establish suggested deadlines and proactive reminders for these proposed action steps: \n${JSON.stringify(payload, null, 2)}`;
    
    const result = await callGeminiWithRetry(prompt, this.instruction, this.responseSchema);
    const parsed = JSON.parse(result.text);

    return {
      agentName: this.agentName,
      thoughts: parsed.thoughts,
      output: {
        suggested_deadlines: parsed.suggested_deadlines,
        proactive_reminders: parsed.proactive_reminders
      },
      executionTimeMs: Date.now() - startTime
    };
  }
}
