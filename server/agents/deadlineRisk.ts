import { Type } from "@google/genai";
import { UserContext, AgentResponse, PlanningStep } from "./types.js";
import { callGeminiWithRetry, hasApiKey } from "./geminiClient.js";

export class DeadlineRiskAgent {
  private static agentName = "Deadline Risk Agent";
  private static instruction = `You are the Deadline Risk Agent. Your responsibility is to analyze target schedules, check for timeline slips, estimate bottlenecks, and propose safety buffers or mitigations.
Identify high-risk factors that could slow down implementation.
Format your response as a strict JSON object with this exact structure:
{
  "thoughts": "Your step-by-step thinking about timeline risks and friction...",
  "risks": [
    "Identified risk with high impact...",
    "Identified risk with moderate impact..."
  ],
  "mitigations": [
    "Mitigation tactic 1...",
    "Mitigation tactic 2..."
  ]
}`;

  private static responseSchema = {
    type: Type.OBJECT,
    properties: {
      thoughts: { type: Type.STRING, description: "Your step-by-step reasoning/analysis." },
      risks: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of identified risk concerns."
      },
      mitigations: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Proactive mitigation strategies to ensure safety."
      }
    },
    required: ["thoughts", "risks", "mitigations"]
  };

  public static async execute(
    context: UserContext,
    objective: string,
    actionItems: PlanningStep[]
  ): Promise<AgentResponse> {
    const startTime = Date.now();
    console.log(`[${this.agentName}] Assessing scheduling risks...`);

    if (!hasApiKey()) {
      return {
        agentName: this.agentName,
        thoughts: "Simulating risk assessment.",
        output: {
          risks: [
            "Aggregation risk: Too many active tasks could cause cognitive overload.",
            "Schedule bottleneck: Calendar blocks might overlap with external meetings."
          ],
          mitigations: [
            "Mitigation: Limit daily high-focus slots to a maximum of 3 hours.",
            "Mitigation: Set automatic calendar alerts to fire 48 hours before milestones."
          ]
        },
        executionTimeMs: Date.now() - startTime
      };
    }

    const payload = {
      objective,
      actionItems,
      activeTasks: context.tasks.filter(t => t.status !== "completed").map(t => ({ title: t.title, priority: t.priority })),
      schedules: context.schedules.map(s => s.title)
    };

    const prompt = `Conduct a timeline risk pre-mortem on this objective: "${objective}" and these action items:\n${JSON.stringify(payload, null, 2)}`;
    
    const result = await callGeminiWithRetry(prompt, this.instruction, this.responseSchema);
    const parsed = JSON.parse(result.text);

    return {
      agentName: this.name,
      thoughts: parsed.thoughts,
      output: {
        risks: parsed.risks,
        mitigations: parsed.mitigations
      },
      executionTimeMs: Date.now() - startTime
    };
  }
}
