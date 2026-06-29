import { Type } from "@google/genai";
import { UserContext, AgentResponse } from "./types.js";
import { callGeminiWithRetry, hasApiKey } from "./geminiClient.js";

export class MemoryAgent {
  private static agentName = "Memory Agent";
  private static instruction = `You are the Memory Agent. Your responsibility is to analyze the user's past saved memories, long-term rules, and preferences, and align them with the new objective.
Extract core rules, style choices, previous lessons, and user-specific guidelines that must be respected during planning.
Format your response as a strict JSON object with this exact structure:
{
  "thoughts": "Your step-by-step thinking about saved memories and user patterns...",
  "memoryInsights": [
    "Identified user preference: Preference description...",
    "Identified constraint: Constraint description..."
  ],
  "styleGuideline": "Guidelines for tone, communication, and visual structure based on past interactions."
}`;

  private static responseSchema = {
    type: Type.OBJECT,
    properties: {
      thoughts: { type: Type.STRING, description: "Your step-by-step reasoning/analysis." },
      memoryInsights: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of insights and preferences extracted from long-term memory."
      },
      styleGuideline: { type: Type.STRING, description: "Tonal/Style preferences aligned with user memory." }
    },
    required: ["thoughts", "memoryInsights", "styleGuideline"]
  };

  public static async execute(context: UserContext, objective: string): Promise<AgentResponse> {
    const startTime = Date.now();
    console.log(`[${this.agentName}] Analyzing long-term memory...`);

    if (!hasApiKey() || context.memories.length === 0) {
      // Fallback
      const defaultMemories = context.memories.length > 0 
        ? context.memories.map(m => m.content) 
        : ["No long-term preferences stored. Defaulting to professional, proactive styling."];
      
      return {
        agentName: this.agentName,
        thoughts: "Simulating memory analysis.",
        output: {
          memoryInsights: defaultMemories.map(m => `Memory constraint: ${m}`),
          styleGuideline: "Tone: Professional, high-leverage, direct. Style: Bento-grid aligned, high density."
        },
        executionTimeMs: Date.now() - startTime
      };
    }

    const payload = {
      objective,
      savedMemories: context.memories.map(m => ({ content: m.content, metadata: m.metadata }))
    };

    const prompt = `Review these memories to guide implementation of the following objective: "${objective}".\n\nMemories:\n${JSON.stringify(payload, null, 2)}`;
    
    const result = await callGeminiWithRetry(prompt, this.instruction, this.responseSchema);
    const parsed = JSON.parse(result.text);

    return {
      agentName: this.agentName,
      thoughts: parsed.thoughts,
      output: {
        memoryInsights: parsed.memoryInsights,
        styleGuideline: parsed.styleGuideline
      },
      executionTimeMs: Date.now() - startTime
    };
  }
}
