import { Type } from "@google/genai";
import { UserContext, AgentResponse, PlanningStep } from "./types.js";
import { callGeminiWithRetry, hasApiKey } from "./geminiClient.js";

export class ReflectionAgent {
  private static agentName = "Reflection Agent";
  private static instruction = `You are the Reflection Agent. Your responsibility is to analyze the user's emotional state, mental workload, past blockers, and mood scores from their recent daily reflections.
Determine if the proposed action plan is sustainable, identify psychological blockers (burnout, fatigue, friction), and provide supportive cognitive insights.
Format your response as a strict JSON object with this exact structure:
{
  "thoughts": "Your step-by-step thinking about workload sustainability and user emotional state...",
  "burnout_risk": "low | moderate | high",
  "cognitive_insights": [
    "Insight on recent blockers...",
    "Recommendation for pacing..."
  ]
}`;

  private static responseSchema = {
    type: Type.OBJECT,
    properties: {
      thoughts: { type: Type.STRING, description: "Your step-by-step reasoning/analysis." },
      burnout_risk: { type: Type.STRING, description: "burnout risk assessment rating." },
      cognitive_insights: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of psychological pacing suggestions based on past reflections."
      }
    },
    required: ["thoughts", "burnout_risk", "cognitive_insights"]
  };

  public static async execute(
    context: UserContext,
    objective: string,
    actionItems: PlanningStep[]
  ): Promise<AgentResponse> {
    const startTime = Date.now();
    console.log(`[${this.agentName}] Analyzing psychological load...`);

    if (!hasApiKey() || context.reflections.length === 0) {
      return {
        agentName: this.agentName,
        thoughts: "Simulating mental load review.",
        output: {
          burnout_risk: "low",
          cognitive_insights: [
            "User feels productive (past mood score: 9). Action items are well within threshold.",
            "Integrate proactive breathing or mindfulness slots if task backlog grows beyond 7 active blocks."
          ]
        },
        executionTimeMs: Date.now() - startTime
      };
    }

    const payload = {
      objective,
      actionItems,
      recentReflections: context.reflections.map(r => ({ date: r.date, mood: r.mood_score, insights: r.insights, blockers: r.blockers }))
    };

    const prompt = `Assess the mental sustainability of these tasks on the user's current mood and blocker patterns:\n${JSON.stringify(payload, null, 2)}`;
    
    const result = await callGeminiWithRetry(prompt, this.instruction, this.responseSchema);
    const parsed = JSON.parse(result.text);

    return {
      agentName: this.agentName,
      thoughts: parsed.thoughts,
      output: {
        burnout_risk: parsed.burnout_risk,
        cognitive_insights: parsed.cognitive_insights
      },
      executionTimeMs: Date.now() - startTime
    };
  }
}
