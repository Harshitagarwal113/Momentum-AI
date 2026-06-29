import { Type } from "@google/genai";
import { UserContext, AgentResponse, PlanningStep } from "./types.js";
import { callGeminiWithRetry, hasApiKey } from "./geminiClient.js";

export class PriorityAgent {
  private static agentName = "Priority Agent";
  private static instruction = `You are the Priority Agent. Your responsibility is to run an Eisenhower Matrix-style prioritization audit on the high-level objective and sub-steps.
Determine the global priority rating ('high', 'medium', or 'low') and explain your Urgency vs Importance reasoning.
Format your response as a strict JSON object with this exact structure:
{
  "thoughts": "Your step-by-step thinking about relative importance and urgency...",
  "priority_level": "high | medium | low",
  "priority_insights": [
    "Urgency Insight...",
    "Importance Insight..."
  ]
}`;

  private static responseSchema = {
    type: Type.OBJECT,
    properties: {
      thoughts: { type: Type.STRING, description: "Your step-by-step reasoning/analysis." },
      priority_level: { type: Type.STRING, description: "Global priority level." },
      priority_insights: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Insights explaining why this level was selected."
      }
    },
    required: ["thoughts", "priority_level", "priority_insights"]
  };

  public static async execute(
    context: UserContext,
    objective: string,
    actionItems: PlanningStep[]
  ): Promise<AgentResponse> {
    const startTime = Date.now();
    console.log(`[${this.agentName}] Assessing priorities...`);

    if (!hasApiKey()) {
      return {
        agentName: this.agentName,
        thoughts: "Simulating priority scoring.",
        output: {
          priority_level: "high",
          priority_insights: [
            "Assessed urgency: Action items directly resolve critical slide outline metrics.",
            "Assessed importance: Affects Series A alignment, creating massive downstream leverage."
          ]
        },
        executionTimeMs: Date.now() - startTime
      };
    }

    const payload = {
      objective,
      actionItems,
      existingTasksCount: context.tasks.filter(t => t.status !== "completed").length
    };

    const prompt = `Conduct a priority audit on the objective: "${objective}" and these action steps: \n${JSON.stringify(payload, null, 2)}`;
    
    const result = await callGeminiWithRetry(prompt, this.instruction, this.responseSchema);
    const parsed = JSON.parse(result.text);

    return {
      agentName: this.name,
      thoughts: parsed.thoughts,
      output: {
        priority_level: parsed.priority_level,
        priority_insights: parsed.priority_insights
      },
      executionTimeMs: Date.now() - startTime
    };
  }
}
