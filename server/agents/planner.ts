import { Type } from "@google/genai";
import { UserContext, AgentResponse } from "./types.js";
import { callGeminiWithRetry, hasApiKey } from "./geminiClient.js";

export class PlannerAgent {
  private static agentName = "Planner Agent";
  private static instruction = `You are the Planner Agent. Your responsibility is to break down high-level business or personal objectives into a clean, logical, sequential timeline of action items and milestones.
Ensure each step is discrete, has clear success criteria, and targets high impact.
Format your response as a strict JSON object with this exact structure:
{
  "thoughts": "Your step-by-step thinking about decomposing the goal...",
  "action_items": [
    {
      "step": 1,
      "title": "Action title...",
      "description": "Action description with clear outcomes...",
      "estimated_duration_minutes": 30,
      "proactive": true
    }
  ]
}`;

  private static responseSchema = {
    type: Type.OBJECT,
    properties: {
      thoughts: { type: Type.STRING, description: "Your step-by-step reasoning/analysis." },
      action_items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            step: { type: Type.INTEGER },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            estimated_duration_minutes: { type: Type.INTEGER },
            proactive: { type: Type.BOOLEAN, description: "Whether this item is a proactive step that can be auto-scheduled." }
          },
          required: ["step", "title", "description", "estimated_duration_minutes", "proactive"]
        }
      }
    },
    required: ["thoughts", "action_items"]
  };

  public static async execute(
    context: UserContext,
    objective: string,
    contextSummary: string,
    memoryInsights: string[]
  ): Promise<AgentResponse> {
    const startTime = Date.now();
    console.log(`[${this.agentName}] Developing action plan...`);

    if (!hasApiKey()) {
      return {
        agentName: this.agentName,
        thoughts: "Simulating plan formulation.",
        output: {
          action_items: [
            {
              step: 1,
              title: `Deconstruct objective: "${objective}"`,
              description: "Perform initial outline, list core questions, and map dependencies.",
              estimated_duration_minutes: 30,
              proactive: true
            },
            {
              step: 2,
              title: "Establish prototype skeleton",
              description: "Build mock routing, interface placeholders, and schema hooks.",
              estimated_duration_minutes: 60,
              proactive: true
            },
            {
              step: 3,
              title: "Final signoff and sync",
              description: "Validate correctness against baseline guidelines.",
              estimated_duration_minutes: 45,
              proactive: false
            }
          ]
        },
        executionTimeMs: Date.now() - startTime
      };
    }

    const payload = {
      objective,
      contextSummary,
      memoryInsights
    };

    const prompt = `Formulate a structured action plan for achieving this objective: "${objective}". Use the situational summary and memory guidelines to customize the complexity and depth.\n\nParameters:\n${JSON.stringify(payload, null, 2)}`;
    
    const result = await callGeminiWithRetry(prompt, this.instruction, this.responseSchema);
    const parsed = JSON.parse(result.text);

    return {
      agentName: this.agentName,
      thoughts: parsed.thoughts,
      output: {
        action_items: parsed.action_items
      },
      executionTimeMs: Date.now() - startTime
    };
  }
}
