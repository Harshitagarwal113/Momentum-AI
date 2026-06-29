import { 
  UserContext, 
  OrchestratedResult, 
  OrchestratedPlan, 
  ChatMessage, 
  AgentResponse 
} from "./types.js";
import { callGeminiWithRetry, hasApiKey } from "./geminiClient.js";
import { Type } from "@google/genai";

export class Orchestrator {
  /**
   * Orchestrates the multi-agent planning loop in a single consolidated fast call.
   */
  public static async coordinate(
    context: UserContext,
    objective: string,
    history: ChatMessage[] = []
  ): Promise<OrchestratedResult> {
    const startTime = Date.now();
    const thinkingLogs: string[] = [];

    console.log(`[Orchestrator] Initiating fast consolidated orchestration for objective: "${objective}"`);
    thinkingLogs.push(`[1] Consolidated Coordinator started. History depth: ${history.length} messages.`);

    const isMockMode = !hasApiKey();

    if (isMockMode) {
      thinkingLogs.push("[WARNING] GEMINI_API_KEY is not configured. Running in high-speed mock mode.");
      const fallbackPlan: OrchestratedPlan = {
        plan_id: `plan_fallback_${Math.random().toString(36).substr(2, 6)}`,
        summary: `Hello! Since you are running in offline/mock mode, I've created a baseline outline to help you execute on "${objective}" immediately. Let me know how we should proceed!`,
        priority_level: "medium",
        action_items: [
          {
            step: 1,
            title: `Execute objective: "${objective}"`,
            description: "Direct outline delivery matching standard parameters.",
            estimated_duration_minutes: 60,
            proactive: true
          }
        ],
        proactive_reminders: ["Audit system outputs to verify correctness."],
        suggested_deadlines: { "Primary Milestone": "In 3 days" },
        risks: ["System running in mock recovery mode."],
        cognitive_insights: ["Take regular breaks when working on deep development cycles."],
        memory_alignments: ["Default guidelines restored."]
      };

      return {
        plan: fallbackPlan,
        thinkingLogs,
        agentTraces: {},
        conversationHistory: [
          ...history,
          { role: "user", text: objective },
          { role: "model", text: JSON.stringify(fallbackPlan) }
        ],
        is_mock: true
      };
    }

    try {
      thinkingLogs.push("[2] Formatting consolidated context and saved memories into a single elite payload.");
      
      const prompt = `Assess the workspace context and memories to provide an elite strategic response and plan for: "${objective}".

CURRENT STATE:
- User Profile: ${JSON.stringify(context.profile)}
- Active Goals: ${JSON.stringify(context.goals.map(g => ({ title: g.title, description: g.description, status: g.status, target_date: g.target_date })))}
- Pending/Active Tasks: ${JSON.stringify(context.tasks.map(t => ({ title: t.title, priority: t.priority, status: t.status, deadline: t.deadline })))}
- Active Habits: ${JSON.stringify(context.habits.map(h => ({ title: h.title, frequency: h.frequency, streak: h.streak })))}
- Schedules: ${JSON.stringify(context.schedules.map(s => ({ title: s.title, start: s.start_time, end: s.end_time })))}
- Long-term Memories/Preferences: ${JSON.stringify(context.memories.map(m => m.content))}

CONVERSATION HISTORY:
${JSON.stringify(history)}

OBJECTIVE TO EXECUTE:
"${objective}"`;

      const systemInstruction = `You are the Momentum AI Chief of Staff. 
Your goal is to provide a lightning-fast, premium, elite response that directly answers the user's objective while aligning with their goals and active workload context.

CRITICAL DIRECTIVES:
1. "summary": This is the primary text response displayed directly to the user as your reply.
   - It MUST be a direct, conversational, warm, and highly personalized reply to what the user wrote. 
   - NEVER simply repeat a dry summary of their database state.
   - If they say "hello" or greet you, greet them back warmly, reference their goals briefly, and ask how you can assist.
   - If they ask a question or raise an issue (e.g., about sign in or integrations), provide clear, actionable troubleshooting steps or direct answers.
2. "action_items": An array of actionable, discrete sequential steps (step, title, description, estimated_duration_minutes, proactive).
   - If the user is just chatting or greeting you, keep this to 1-2 generic productive actions (e.g. "Review today's active schedule alignment").
   - If the user specifies an objective or task, break it down step-by-step.
3. "suggested_deadlines": Map key milestone names to estimated timeframes/dates.
4. "proactive_reminders", "risks", "cognitive_insights", "memory_alignments": Synthesize high-quality contextual alerts, fatigue indicators, and preference alignments.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "A conversational, context-aware direct response to the user's message." },
          priority_level: { type: Type.STRING, description: "high | medium | low" },
          action_items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.INTEGER },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                estimated_duration_minutes: { type: Type.INTEGER },
                proactive: { type: Type.BOOLEAN }
              },
              required: ["step", "title", "description", "estimated_duration_minutes", "proactive"]
            }
          },
          proactive_reminders: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggested_deadlines: {
            type: Type.OBJECT,
            properties: {
              Milestone: { type: Type.STRING }
            },
            additionalProperties: { type: Type.STRING }
          },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } },
          cognitive_insights: { type: Type.ARRAY, items: { type: Type.STRING } },
          memory_alignments: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: [
          "summary",
          "priority_level",
          "action_items",
          "proactive_reminders",
          "suggested_deadlines",
          "risks",
          "cognitive_insights",
          "memory_alignments"
        ]
      };

      thinkingLogs.push("[3] Executing unified, high-performance Gemini cognitive mapping model call...");
      const result = await callGeminiWithRetry(prompt, systemInstruction, responseSchema);
      const parsedPlan = JSON.parse(result.text);

      const mergedPlan: OrchestratedPlan = {
        plan_id: `plan_cos_${Math.random().toString(36).substr(2, 6)}`,
        summary: parsedPlan.summary,
        priority_level: parsedPlan.priority_level || "medium",
        action_items: parsedPlan.action_items || [],
        proactive_reminders: parsedPlan.proactive_reminders || [],
        suggested_deadlines: parsedPlan.suggested_deadlines || {},
        risks: parsedPlan.risks || [],
        cognitive_insights: parsedPlan.cognitive_insights || [],
        memory_alignments: parsedPlan.memory_alignments || []
      };

      const executionTime = Date.now() - startTime;
      thinkingLogs.push(`[4] Cognitive model call returned. Processing took ${executionTime}ms.`);

      // Maintain trace compatibility for the developer view
      const agentTraces: Record<string, AgentResponse> = {
        ContextAgent: {
          agentName: "Context Agent",
          thoughts: "Unified context synthesis completed in single-pass.",
          output: { contextSummary: mergedPlan.summary, activeWorkloadRating: "moderate" },
          executionTimeMs: Math.round(executionTime / 3)
        },
        MemoryAgent: {
          agentName: "Memory Agent",
          thoughts: "Memory constraints extracted and merged in single-pass.",
          output: { memoryInsights: mergedPlan.memory_alignments, styleGuideline: "Professional & elite" },
          executionTimeMs: Math.round(executionTime / 3)
        },
        PlannerAgent: {
          agentName: "Planner Agent",
          thoughts: "Milestone steps and action planning synthesized in single-pass.",
          output: { action_items: mergedPlan.action_items },
          executionTimeMs: Math.round(executionTime / 3)
        }
      };

      const finalHistory: ChatMessage[] = [
        ...history,
        { role: "user", text: objective },
        { role: "model", text: JSON.stringify(mergedPlan) }
      ];

      thinkingLogs.push(`[5] Consolidated coordination complete. Response delivers pristine direct answer.`);

      return {
        plan: mergedPlan,
        thinkingLogs,
        agentTraces,
        conversationHistory: finalHistory,
        is_mock: false
      };

    } catch (error: any) {
      console.error("[Orchestrator] Consolidated pipeline failed:", error);
      thinkingLogs.push(`[ERROR] Consolidated loop failed: ${error.message || error}. Falling back.`);
      
      const fallbackPlan: OrchestratedPlan = {
        plan_id: "plan_fallback_recovery",
        summary: `I apologize for the minor glitch in our multi-agent thinking cycle. I have established a direct execution framework for "${objective}" to keep us moving seamlessly.`,
        priority_level: "medium",
        action_items: [
          {
            step: 1,
            title: `Execute: "${objective}"`,
            description: "Proceed with direct focus and clear milestone targets.",
            estimated_duration_minutes: 45,
            proactive: true
          }
        ],
        proactive_reminders: ["Audit system outputs to verify correctness."],
        suggested_deadlines: { "Primary Objective": "In 2 days" },
        risks: ["Fallback execution active."],
        cognitive_insights: ["Take standard rest breaks to maximize execution capacity."],
        memory_alignments: ["Default alignments applied."]
      };

      return {
        plan: fallbackPlan,
        thinkingLogs,
        agentTraces: {},
        conversationHistory: [
          ...history,
          { role: "user", text: objective },
          { role: "model", text: JSON.stringify(fallbackPlan) }
        ],
        is_mock: true
      };
    }
  }
}

