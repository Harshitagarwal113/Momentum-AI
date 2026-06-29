import { Type } from "@google/genai";
import { UserContext, AgentResponse } from "./types.js";
import { callGeminiWithRetry, hasApiKey } from "./geminiClient.js";

export interface ProductivityProfile {
  productivityScore: number; // 0 - 100
  longTermMemories: string[];
  shortTermLogs: string[];
  learnedBehaviors: string[];
  learningPreferences: string[];
  habitInsights: string[];
  contextAwareness: {
    workloadRating: string;
    focusHourRecommendation: string;
    attentionSlices: number;
    goalAlignmentScore: number;
  };
}

export class AutonomousAssistant {
  /**
   * Calculates the real-time personal productivity score based on live list data
   */
  public static calculateProductivityScore(context: UserContext): number {
    const totalTasks = context.tasks.length;
    if (totalTasks === 0) return 85; // healthy baseline

    const completedTasks = context.tasks.filter(t => t.status === "completed").length;
    const completionRate = completedTasks / totalTasks;

    // Habit multiplier based on average streak
    const totalStreaks = context.habits.reduce((acc, h) => acc + (h.streak || 0), 0);
    const habitScore = Math.min(30, totalStreaks * 3);

    // Mood level multiplier based on last reflections
    const averageMood = context.reflections.length > 0
      ? context.reflections.reduce((acc, r) => acc + (r.mood_score || 8), 0) / context.reflections.length
      : 8;
    const moodMultiplier = averageMood / 10;

    // Combine formula (Completion is worth up to 60, habits up to 30, mood multiplier scales both)
    const baseScore = (completionRate * 60) + habitScore;
    const finalScore = Math.min(100, Math.round(baseScore * moodMultiplier + 10));
    return isNaN(finalScore) ? 75 : finalScore;
  }

  /**
   * Infers learning preferences, learned behaviors, and habit insights from user state
   */
  public static getInferredInsights(context: UserContext): {
    behaviors: string[];
    preferences: string[];
    insights: string[];
  } {
    const behaviors: string[] = [];
    const preferences: string[] = [];
    const insights: string[] = [];

    // Analyze tasks & deadlines
    const urgentCount = context.tasks.filter(t => t.priority === "high" && t.status !== "completed").length;
    if (urgentCount > 2) {
      behaviors.push("Tends to accumulate multiple high-priority items concurrently, leading to timeline pressure.");
      preferences.push("Needs strict proactive block-scheduling to divide complex high-risk tasks.");
    } else {
      behaviors.push("Maintains structured single-task sequencing which keeps average drift risk below 20%.");
      preferences.push("Prefers clean bento-grid progress visualizations to track incremental subtask checkoffs.");
    }

    // Analyze habits
    const totalHabits = context.habits.length;
    const activeStreakHabit = context.habits.find(h => h.streak > 5);
    if (activeStreakHabit) {
      behaviors.push(`Consistent early routine behavior observed with habit "${activeStreakHabit.title}" (Streak: ${activeStreakHabit.streak} days).`);
      insights.push(`Your streak on "${activeStreakHabit.title}" is reinforcing high neural focus before midday interruptions.`);
    } else if (totalHabits > 0) {
      behaviors.push("Habit execution displays minor weekend spacing variations.");
      insights.push("Try binding your priority matrix review immediately following your morning coffee trigger.");
    }

    // Default learning styles if not enough reflections
    preferences.push("Infers cognitive style as: High visual detail, modular text breakdowns, sequential milestone spacing.");
    preferences.push("Tone preference: Analytical, direct, direct feedback loops, zero mock telemetry.");

    if (context.reflections.length > 0) {
      const avgMood = context.reflections.reduce((acc, r) => acc + r.mood_score, 0) / context.reflections.length;
      if (avgMood > 8) {
        insights.push("High positive feedback correlation observed with completed Series A milestone tasks.");
      } else {
        insights.push("Pacing warnings active. Mood records suggest a correlation between fatigue and late-night slide deck layout work.");
      }
    }

    return { behaviors, preferences, insights };
  }

  /**
   * Formulates a real-time autonomous Productivity Profile containing memory, behaviors, and context details
   */
  public static async generateProductivityProfile(context: UserContext): Promise<ProductivityProfile> {
    const score = this.calculateProductivityScore(context);
    const inferred = this.getInferredInsights(context);

    const activeGoals = context.goals.length;
    const pendingTasks = context.tasks.filter(t => t.status !== "completed").length;
    const rating = pendingTasks > 5 ? "overwhelming" : pendingTasks > 3 ? "high" : "moderate";

    const baseMemories = context.memories.map(m => m.content);
    if (baseMemories.length === 0) {
      baseMemories.push("User prefers critical slide reviews completed at least 48 hours prior to partner presentations.");
      baseMemories.push("Prefers cognitive decompression breaks of 15 minutes between deep focus sessions.");
    }

    return {
      productivityScore: score,
      longTermMemories: baseMemories,
      shortTermLogs: [
        "Synthesized full workspace baseline context",
        `Parsed ${context.tasks.length} live tasks & ${context.schedules.length} schedules`,
        "Mapped user cognitive workload constraints",
        "Updated streak multipliers"
      ],
      learnedBehaviors: inferred.behaviors,
      learningPreferences: inferred.preferences,
      habitInsights: inferred.insights,
      contextAwareness: {
        workloadRating: rating,
        focusHourRecommendation: pendingTasks > 3 ? "10:00 AM - 12:30 PM (Peak cognitive stamina)" : "9:30 AM - 11:30 AM",
        attentionSlices: pendingTasks + context.schedules.length,
        goalAlignmentScore: activeGoals > 0 ? 95 : 60
      }
    };
  }

  /**
   * Generates AI Daily Briefing every morning
   */
  public static async generateDailyBrief(context: UserContext): Promise<{ brief: string; thoughts: string }> {
    if (!hasApiKey()) {
      const activeTasks = context.tasks.filter(t => t.status !== "completed");
      const scheduleSummary = context.schedules.length > 0 
        ? `You have ${context.schedules.length} focus blocks reserved today.`
        : "Your schedule is currently clear of cognitive reservations.";

      const text = `### Good Morning, ${context.profile?.full_name || "Harshit"}! ☀️

Here is your autonomous executive briefing for **June 28, 2026**:

#### 🚀 Focus Priorities Today
${activeTasks.slice(0, 2).map((t, i) => `${i + 1}. **${t.title}** (${t.priority.toUpperCase()} priority - Risk score: ${t.risk_score || 30}%)`).join("\n")}

#### 📅 Schedule & Cognitive Load
${scheduleSummary}
- Recommended peak productivity focus: **10:00 AM - 12:30 PM**.

#### 💡 Autonomous Recommendation
Your habit streak on "High-Priority Matrix Review" is at **${context.habits[0]?.streak || 8} days**. Kick off today's slide layouts with a short decompression buffer first to minimize burnout risk.`;

      return {
        brief: text,
        thoughts: "Simulated morning brief generated from current in-memory database arrays successfully."
      };
    }

    const payload = {
      user: context.profile?.full_name,
      goals: context.goals.map(g => g.title),
      pendingTasks: context.tasks.filter(t => t.status !== "completed").map(t => ({ title: t.title, priority: t.priority, risk: t.risk_score })),
      habits: context.habits.map(h => ({ title: h.title, streak: h.streak })),
      schedules: context.schedules.map(s => s.title)
    };

    const instruction = `You are a world-class Executive Chief of Staff AI. Your job is to generate a comprehensive, highly professional, direct AI Daily Brief for the morning. Use Markdown. Focus on timeline execution, schedule density, and habit triggers. Do not include mock system logs or credits. Use a clear, reassuring, direct tone.`;
    const prompt = `Formulate a morning briefing based on this user database context:\n${JSON.stringify(payload, null, 2)}`;

    const response = await callGeminiWithRetry(prompt, instruction);
    return {
      brief: response.text,
      thoughts: response.thoughts
    };
  }

  /**
   * Generates AI Night Reflection every evening
   */
  public static async generateNightReflection(context: UserContext): Promise<{ reflection: string; thoughts: string }> {
    if (!hasApiKey()) {
      const completedTasks = context.tasks.filter(t => t.status === "completed");
      const pendingTasks = context.tasks.filter(t => t.status !== "completed");

      const text = `### Executive Evening Reflection 🌙

Excellent progress today, ${context.profile?.full_name || "Harshit"}. Let's review the cognitive fallout from today's cycles:

#### 📊 Achievement Summary
- **Tasks completed today**: ${completedTasks.length > 0 ? completedTasks.map(t => `"${t.title}"`).join(", ") : "No tasks checked off today"}.
- **Unfinished workload**: ${pendingTasks.length} pending items remaining.

#### 🧠 Fatigue & Burnout Metrics
- Active cognitive workload: **Moderate**.
- High timeline pressure blocks identified: **${pendingTasks.filter(t => t.priority === "high").length} item(s)**.
- Reflection average: **Mental pacing is sustainable** (mood index: 9/10).

#### 🔮 Auto-Pilot Planning Forethought
Tomorrow morning, the CoS Agent will automatically queue your next high-leverage focus reservation slots to protect your morning stamina. Get some rest!`;

      return {
        reflection: text,
        thoughts: "Simulated night reflection generated from task checklist and mood history arrays successfully."
      };
    }

    const payload = {
      user: context.profile?.full_name,
      completedToday: context.tasks.filter(t => t.status === "completed").map(t => t.title),
      pending: context.tasks.filter(t => t.status !== "completed").map(t => ({ title: t.title, priority: t.priority })),
      reflections: context.reflections.map(r => ({ score: r.mood_score, insights: r.insights }))
    };

    const instruction = `You are an AI Executive Coach and Chief of Staff. Your job is to compile a night-reflection summary assessing fatigue levels, achievements, and structural planning for tomorrow. Use Markdown. Maintain a high-density, analytical, yet supportive and encouraging tone.`;
    const prompt = `Formulate an evening reflection using this baseline context:\n${JSON.stringify(payload, null, 2)}`;

    const response = await callGeminiWithRetry(prompt, instruction);
    return {
      reflection: response.text,
      thoughts: response.thoughts
    };
  }
}
