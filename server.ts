import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { google } from "googleapis";

import { Orchestrator } from "./server/agents/orchestrator.js";
import { ContextAgent } from "./server/agents/context.js";
import { MemoryAgent } from "./server/agents/memory.js";
import { PlannerAgent } from "./server/agents/planner.js";
import { SchedulerAgent } from "./server/agents/scheduler.js";
import { PriorityAgent } from "./server/agents/priority.js";
import { DeadlineRiskAgent } from "./server/agents/deadlineRisk.js";
import { ReflectionAgent } from "./server/agents/reflection.js";
import { AutonomousAssistant } from "./server/agents/autonomous.js";
import { UserContext } from "./server/agents/types.js";
import { hasApiKey, callGeminiWithRetry } from "./server/agents/geminiClient.js";
import { validateAndReportEnv } from "./server/config/env.js";

// ==========================================
// STATEFUL IN-MEMORY SIMULATION LAYER
// Matches the Supabase PostgreSQL structure
// ==========================================

import { AsyncLocalStorage } from "async_hooks";
const userSessionStorage = new AsyncLocalStorage<{ user: any }>();

let _legacyLoggedInUser: any = null;

declare global {
  var loggedInUser: any;
}

Object.defineProperty(globalThis, "loggedInUser", {
  get() {
    const store = userSessionStorage.getStore();
    return store ? store.user : _legacyLoggedInUser;
  },
  set(val) {
    const store = userSessionStorage.getStore();
    if (store) {
      store.user = val;
    } else {
      _legacyLoggedInUser = val;
    }
  },
  configurable: true,
});

const getCookie = (req: express.Request, name: string): string | null => {
  const list: any = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      list[parts.shift()!.trim()] = decodeURIComponent(parts.join('='));
    });
  }
  return list[name] || null;
};

let users = [
  {
    id: "usr_01h8a9",
    email: "harshitagarwal11345@gmail.com",
    full_name: "Harshit Agarwal",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    timezone: "America/Los_Angeles",
    is_premium: true,
    dark_mode: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let goals = [
  {
    id: "goal_9b24ac",
    user_id: "usr_01h8a9",
    title: "Finalize Series A Funding Round",
    description: "Align core metrics, secure slide templates, and compile audit checklists.",
    target_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: "in_progress",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let tasks = [
  {
    id: "tsk_research",
    user_id: "usr_01h8a9",
    goal_id: "goal_9b24ac",
    title: "Conduct Initial Market Research",
    description: "Gather industry sizing data, compound annual growth rate (CAGR), and segment profiles.",
    deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "medium",
    status: "completed",
    is_proactive: false,
    subtasks: [
      { id: "sub_r1", title: "Collect Gartner research reports", completed: true },
      { id: "sub_r2", title: "Sift through segment financial disclosures", completed: true }
    ],
    dependencies: [],
    duration_minutes: 90,
    risk_score: 10,
    predicted_deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    risk_reason: "Research completed ahead of schedule with zero blockers.",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "tsk_8a43fbc",
    user_id: "usr_01h8a9",
    goal_id: "goal_9b24ac",
    title: "Draft Pitch Deck Slide Template",
    description: "Structure core slides: Market Sizing, Unit Economics, and competitive matrices.",
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "high",
    status: "in_progress",
    is_proactive: true,
    subtasks: [
      { id: "sub_1", title: "Formulate market opportunity statement", completed: true },
      { id: "sub_2", title: "Illustrate Unit Economics equation", completed: false },
      { id: "sub_3", title: "Insert competitive quadrants framework", completed: false }
    ],
    dependencies: ["tsk_research"],
    duration_minutes: 120,
    risk_score: 35,
    predicted_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    risk_reason: "Minor bottleneck on unit economics draft validation.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "tsk_pitch",
    user_id: "usr_01h8a9",
    goal_id: "goal_9b24ac",
    title: "Partner Mock Pitch Session",
    description: "Walkthrough deck draft with leadership to validate flow, rhythm, and tone.",
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "high",
    status: "pending",
    is_proactive: false,
    subtasks: [
      { id: "sub_p1", title: "Schedule session with advisors", completed: false },
      { id: "sub_p2", title: "Synthesize mock presentation script", completed: false }
    ],
    dependencies: ["tsk_8a43fbc"],
    duration_minutes: 60,
    risk_score: 65,
    predicted_deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    risk_reason: "Requires draft slide completion first. High schedule drift risk if slides are delayed.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let habits = [
  {
    id: "hab_3c45de",
    user_id: "usr_01h8a9",
    title: "Morning Routine: High-Priority Matrix Review",
    description: "Evaluate core task blocks before Slack notification floods begin.",
    frequency: "daily",
    streak: 8,
    last_completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  }
];

let dailyReflections = [
  {
    id: "ref_7f1a9b",
    user_id: "usr_01h8a9",
    date: new Date().toISOString().split("T")[0],
    mood_score: 9,
    insights: "Formulated highly scalable core API endpoints and registered NextJS layout routers.",
    blockers: "Minor network constraints resolved via customized Port 3000 mapping structures.",
    created_at: new Date().toISOString()
  }
];

let aiMemories = [
  {
    id: "mem_8h7g2f",
    user_id: "usr_01h8a9",
    content: "User prefers critical slide reviews completed at least 48 hours prior to partner presentations.",
    metadata: { source: "briefing_agent_feedback", confidence: 0.95 },
    created_at: new Date().toISOString()
  }
];

let schedules = [
  {
    id: "sch_2k3j4h",
    user_id: "usr_01h8a9",
    title: "Focus Reservation: Q3 Slide Deck Layouts",
    start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    description: "Chief of Staff blocked slots automatically to avoid scheduling overlaps.",
    is_cognitive_reservation: true,
    created_at: new Date().toISOString()
  }
];

let notifications = [
  {
    id: "not_1n2m3b",
    user_id: "usr_01h8a9",
    title: "Proactive Task Reservation Executed",
    message: "I have blocked 2 hours today to draft the slide templates based on your target deadlines.",
    is_read: false,
    type: "schedule",
    created_at: new Date().toISOString()
  }
];

let activityLogs = [
  {
    id: "log_5f6g7h",
    user_id: "usr_01h8a9",
    action: "SECURE_AUTH_SIGN_IN",
    ip_address: "127.0.0.1",
    payload: { provider: "supabase_google_oauth" },
    created_at: new Date().toISOString()
  }
];

// Helper to push audit logs easily
const logActivity = (userId: string, action: string, payload: any = {}) => {
  activityLogs.unshift({
    id: "log_" + Math.random().toString(36).substr(2, 6),
    user_id: userId,
    action,
    ip_address: "127.0.0.1",
    payload,
    created_at: new Date().toISOString()
  });
};

async function startServer() {
  // Validate and report environment variables state
  validateAndReportEnv();

  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Read injected variables
  const apiKey = process.env.GEMINI_API_KEY;

  // JSON request body parser
  app.use(express.json());

  // Middleware to ensure Google Gemini API Key exists for all agentic loop interactions
  const requireGeminiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!hasApiKey()) {
      return res.status(503).json({
        error: "Google Gemini API Key is missing or unconfigured.",
        message: "The Autonomous Chief of Staff agentic loops require a valid GEMINI_API_KEY to run. Please define it in your AI Studio Secrets panel or .env configuration file."
      });
    }
    next();
  };

  // Guard all agentic endpoint requests
  app.use("/api/agent", requireGeminiKey);

  // Request-scoped Session Context Middleware
  app.use((req, res, next) => {
    const sessionUserId = getCookie(req, "session_user_id");
    const user = users.find(u => u.id === sessionUserId) || null;
    userSessionStorage.run({ user }, () => {
      next();
    });
  });

  // ==========================================
  // AUTHENTICATION APIs (Supabase Mimicry)
  // ==========================================

  app.post("/api/auth/session", (req, res) => {
    res.json({ session: loggedInUser });
  });

  app.post("/api/auth/login-email", (req, res) => {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    // Find or bootstrap user
    let user = users.find(u => u.email === email);
    if (!user) {
      user = {
        id: "usr_" + Math.random().toString(36).substr(2, 6),
        email,
        full_name: email.split("@")[0].toUpperCase(),
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        timezone: "UTC",
        is_premium: false,
        dark_mode: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      users.push(user);
    }

    loggedInUser = user;
    res.setHeader("Set-Cookie", `session_user_id=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
    logActivity(user.id, "SECURE_AUTH_SIGN_IN", { method: "email_password" });
    res.json({ success: true, user });
  });

  app.post("/api/auth/login-google", (req, res) => {
    const { email, name, avatar } = req.body;
    const targetEmail = email || "harshitagarwal11345@gmail.com";
    
    let user = users.find(u => u.email === targetEmail);
    if (!user) {
      user = {
        id: "usr_01h8a9",
        email: targetEmail,
        full_name: name || "Harshit Agarwal",
        avatar_url: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        timezone: "America/Los_Angeles",
        is_premium: true,
        dark_mode: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      users.push(user);
    }

    loggedInUser = user;
    res.setHeader("Set-Cookie", `session_user_id=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
    logActivity(user.id, "SECURE_AUTH_SIGN_IN", { method: "supabase_google_oauth" });
    res.json({ success: true, user });
  });

  app.post("/api/auth/logout", (req, res) => {
    if (loggedInUser) {
      logActivity(loggedInUser.id, "SECURE_AUTH_SIGN_OUT");
    }
    loggedInUser = null;
    res.setHeader("Set-Cookie", `session_user_id=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
    res.json({ success: true });
  });

  app.post("/api/auth/seed-demo", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized session." });
    const userId = loggedInUser.id;

    // 1. Remove existing records for this user
    goals = goals.filter(g => g.user_id !== userId);
    tasks = tasks.filter(t => t.user_id !== userId);
    habits = habits.filter(h => h.user_id !== userId);
    dailyReflections = dailyReflections.filter(r => r.user_id !== userId);
    schedules = schedules.filter(s => s.user_id !== userId);
    notifications = notifications.filter(n => n.user_id !== userId);

    // 2. Add gorgeous, high-fidelity mock dataset
    const goalAId = "g_series_a_" + Math.random().toString(36).substr(2, 6);
    const goalBId = "g_launch_" + Math.random().toString(36).substr(2, 6);

    const seededGoals = [
      {
        id: goalAId,
        user_id: userId,
        title: "Secure Series A Funding Round",
        description: "Align financial models, finalize partner pitch decks, and coordinate mock roadshows.",
        target_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: "in_progress",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: goalBId,
        user_id: userId,
        title: "Launch Mobile Companion App v1.0",
        description: "Draft App Store deployment assets, finalize backend indexing, and complete QA testing.",
        target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "in_progress",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const t1Id = "t_research_" + Math.random().toString(36).substr(2, 6);
    const t2Id = "t_deck_" + Math.random().toString(36).substr(2, 6);
    const t3Id = "t_pitch_" + Math.random().toString(36).substr(2, 6);
    const t4Id = "t_backend_" + Math.random().toString(36).substr(2, 6);
    const t5Id = "t_appstore_" + Math.random().toString(36).substr(2, 6);

    const seededTasks = [
      {
        id: t1Id,
        user_id: userId,
        goal_id: goalAId,
        title: "Conduct Competitive Market Analysis",
        description: "Synthesize sizing estimates, market growth rates (CAGR), and core segment barriers.",
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        priority: "medium",
        status: "completed",
        is_proactive: false,
        subtasks: [
          { id: "sb1", title: "Review industry disclosure reports", completed: true },
          { id: "sb2", title: "Draft competitive quadrant diagram", completed: true }
        ],
        dependencies: [],
        duration_minutes: 90,
        risk_score: 5,
        predicted_deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        risk_reason: "Task completed successfully with zero blockers.",
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: t2Id,
        user_id: userId,
        goal_id: goalAId,
        title: "Draft Series A Pitch Deck Slides",
        description: "Format slide templates covering product vision, unit economics, and pipeline momentum.",
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        priority: "high",
        status: "in_progress",
        is_proactive: true,
        subtasks: [
          { id: "sb3", title: "Complete Unit Economics spreadsheet", completed: true },
          { id: "sb4", title: "Draft high-impact market sizing slide", completed: false },
          { id: "sb5", title: "Refine slide narrative pacing", completed: false }
        ],
        dependencies: [t1Id],
        duration_minutes: 120,
        risk_score: 28,
        predicted_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        risk_reason: "Progress is steady; pending visual review from the branding team.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: t3Id,
        user_id: userId,
        goal_id: goalAId,
        title: "Partner Mock Pitch Session",
        description: "Rehearse live deck draft with advisors to refine presentation pacing and flow.",
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        priority: "high",
        status: "pending",
        is_proactive: false,
        subtasks: [
          { id: "sb6", title: "Schedule Google Meet conference", completed: false },
          { id: "sb7", title: "Synthesize structured presentation script", completed: false }
        ],
        dependencies: [t2Id],
        duration_minutes: 60,
        risk_score: 72,
        predicted_deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        risk_reason: "High drift risk! Dependent on completing Pitch Deck Slides first.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: t4Id,
        user_id: userId,
        goal_id: goalBId,
        title: "Optimize Database Queries & API Caching",
        description: "Add custom indexes for fast monorepo parsing and configure Redis storage structures.",
        deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        priority: "medium",
        status: "in_progress",
        is_proactive: false,
        subtasks: [
          { id: "sb8", title: "Audit slow-running SQL transactions", completed: true },
          { id: "sb9", title: "Apply indexing rules", completed: false }
        ],
        dependencies: [],
        duration_minutes: 90,
        risk_score: 15,
        predicted_deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        risk_reason: "Under control; indexing has low risk of drift.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: t5Id,
        user_id: userId,
        goal_id: goalBId,
        title: "Draft App Store Submission Checklist",
        description: "Synthesize screenshots, compliance briefs, and core release tags.",
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        priority: "low",
        status: "pending",
        is_proactive: false,
        subtasks: [
          { id: "sb10", title: "Capture dashboard screenshots", completed: false },
          { id: "sb11", title: "Complete age-rating questionnaires", completed: false }
        ],
        dependencies: [t4Id],
        duration_minutes: 45,
        risk_score: 8,
        predicted_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        risk_reason: "Trivial task; dependencies have healthy buffer.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const seededHabits = [
      {
        id: "h1_" + Math.random().toString(36).substr(2, 6),
        user_id: userId,
        title: "Inbox Zero Alignment Review",
        description: "Sift through critical updates before meeting blocks begin.",
        frequency: "daily",
        streak: 14,
        last_completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: "h2_" + Math.random().toString(36).substr(2, 6),
        user_id: userId,
        title: "90-Minute High-Cognitive Deep Focus Block",
        description: "Zero notifications, dedicated flow time for priority objectives.",
        frequency: "daily",
        streak: 6,
        last_completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: "h3_" + Math.random().toString(36).substr(2, 6),
        user_id: userId,
        title: "Strategic Reflection & Mental Gratitude Review",
        description: "Log daily clarity metrics and map blockers.",
        frequency: "daily",
        streak: 3,
        last_completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      }
    ];

    const seededReflections = [
      {
        id: "ref_yest_" + Math.random().toString(36).substr(2, 6),
        user_id: userId,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        mood_score: 8,
        insights: "Validated the Series A financial sheets and synchronized slide placeholders. Pacing is healthy.",
        blockers: "Minor coordination delay on branding assets.",
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "ref_prev_" + Math.random().toString(36).substr(2, 6),
        user_id: userId,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        mood_score: 6,
        insights: "Completed the initial market sizing slides. Felt high cognitive fatigue around 4pm.",
        blockers: "Too many back-to-back meeting blocks. Need to inject decompression buffers.",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "ref_prev2_" + Math.random().toString(36).substr(2, 6),
        user_id: userId,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        mood_score: 9,
        insights: "Resolved database querying lag. Local performance increased by 400%.",
        blockers: "None. Feeling hyper-productive.",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const seededSchedules = [
      {
        id: "s1_" + Math.random().toString(36).substr(2, 6),
        user_id: userId,
        title: "Focus Block: Pitch Deck Visual Formatting",
        start_time: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        description: "Autonomous Chief of Staff locked focus block.",
        is_cognitive_reservation: true,
        created_at: new Date().toISOString()
      },
      {
        id: "s2_" + Math.random().toString(36).substr(2, 6),
        user_id: userId,
        title: "15m Decompression Buffer",
        start_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() + 3.25 * 60 * 60 * 1000).toISOString(),
        description: "Decompression interval scheduled to offset mental fatigue.",
        is_cognitive_reservation: true,
        created_at: new Date().toISOString()
      },
      {
        id: "s3_" + Math.random().toString(36).substr(2, 6),
        user_id: userId,
        title: "Advisory Sync with Financial Board",
        start_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        description: "Calendar sync placeholder.",
        is_cognitive_reservation: false,
        created_at: new Date().toISOString()
      }
    ];

    goals.push(...seededGoals);
    tasks.push(...seededTasks);
    habits.push(...seededHabits);
    dailyReflections.push(...seededReflections);
    schedules.push(...seededSchedules);

    // Add immediate notification
    notifications.push({
      id: "not_seed_" + Math.random().toString(36).substr(2, 6),
      user_id: userId,
      title: "Co-pilot Demo Sandbox Populated Successfully",
      message: "Goals, tasks, custom habits, clarity logs, and optimized focus schedules are fully synchronized.",
      is_read: false,
      type: "success",
      created_at: new Date().toISOString()
    });

    logActivity(userId, "CO_PILOT_DEMO_SANDBOX_SEED", { goalsCount: seededGoals.length, tasksCount: seededTasks.length });
    res.json({ success: true, message: "Demo dataset seeded successfully." });
  });

  // ==========================================
  // PROFILE & SETTINGS APIs
  // ==========================================

  app.get("/api/profile", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized session." });
    res.json({ success: true, profile: loggedInUser });
  });

  app.patch("/api/profile", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized session." });
    const { full_name, timezone, dark_mode, is_premium } = req.body;

    const userIdx = users.findIndex(u => u.id === loggedInUser.id);
    if (userIdx !== -1) {
      if (full_name !== undefined) users[userIdx].full_name = full_name;
      if (timezone !== undefined) users[userIdx].timezone = timezone;
      if (dark_mode !== undefined) users[userIdx].dark_mode = dark_mode;
      if (is_premium !== undefined) users[userIdx].is_premium = is_premium;
      users[userIdx].updated_at = new Date().toISOString();
      loggedInUser = users[userIdx];
      logActivity(loggedInUser.id, "PROFILE_RECORD_UPDATE", { keys: Object.keys(req.body) });
    }

    res.json({ success: true, profile: loggedInUser });
  });

  // ==========================================
  // GOAL CRUD APIs
  // ==========================================

  app.get("/api/goals", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    const userGoals = goals.filter(g => g.user_id === loggedInUser.id);
    res.json({ success: true, data: userGoals });
  });

  app.post("/api/goals", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    const { title, description, target_date } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required." });

    const newGoal = {
      id: "goal_" + Math.random().toString(36).substr(2, 6),
      user_id: loggedInUser.id,
      title,
      description: description || "",
      target_date: target_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "in_progress",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    goals.push(newGoal);
    logActivity(loggedInUser.id, "GOAL_RECORD_CREATE", { title });
    res.json({ success: true, data: newGoal });
  });

  app.patch("/api/goals/:id", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    const { title, description, target_date, status } = req.body;
    
    const goalIdx = goals.findIndex(g => g.id === req.params.id && g.user_id === loggedInUser.id);
    if (goalIdx === -1) return res.status(404).json({ error: "Goal not found." });

    if (title !== undefined) goals[goalIdx].title = title;
    if (description !== undefined) goals[goalIdx].description = description;
    if (target_date !== undefined) goals[goalIdx].target_date = target_date;
    if (status !== undefined) goals[goalIdx].status = status;
    goals[goalIdx].updated_at = new Date().toISOString();

    logActivity(loggedInUser.id, "GOAL_RECORD_UPDATE", { id: req.params.id });
    res.json({ success: true, data: goals[goalIdx] });
  });

  app.delete("/api/goals/:id", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    goals = goals.filter(g => !(g.id === req.params.id && g.user_id === loggedInUser.id));
    logActivity(loggedInUser.id, "GOAL_RECORD_DELETE", { id: req.params.id });
    res.json({ success: true });
  });

  // ==========================================
  // TASK CRUD APIs
  // ==========================================

  app.get("/api/tasks", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    const userTasks = tasks.filter(t => t.user_id === loggedInUser.id);
    res.json({ success: true, data: userTasks });
  });

  app.post("/api/tasks", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    const { title, description, deadline, priority, goal_id, subtasks, dependencies, duration_minutes, risk_score, risk_reason, predicted_deadline } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required." });

    const newTask = {
      id: "tsk_" + Math.random().toString(36).substr(2, 6),
      user_id: loggedInUser.id,
      goal_id: goal_id || null,
      title,
      description: description || "",
      deadline: deadline || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      priority: priority || "medium",
      status: "pending",
      is_proactive: false,
      subtasks: subtasks || [],
      dependencies: dependencies || [],
      duration_minutes: duration_minutes || 60,
      risk_score: risk_score || 20,
      risk_reason: risk_reason || "Standard schedule pacing applied.",
      predicted_deadline: predicted_deadline || deadline || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    tasks.push(newTask);
    logActivity(loggedInUser.id, "TASK_RECORD_CREATE", { title });
    res.json({ success: true, data: newTask });
  });

  // Natural language task input parser
  app.post("/api/tasks/natural", async (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "A non-empty prompt string is required." });
    }

    try {
      let parsedTask;

      if (hasApiKey()) {
        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            priority: { type: Type.STRING, description: "high, medium, or low" },
            duration_minutes: { type: Type.INTEGER },
            risk_score: { type: Type.INTEGER, description: "Timeline drift risk score from 0 to 100" },
            risk_reason: { type: Type.STRING, description: "Brief rationale of why there is timeline risk" },
            subtasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING }
                },
                required: ["title"]
              }
            },
            relative_deadline_days: { type: Type.INTEGER, description: "Number of days from now that this task is due (e.g. 1 if tomorrow, 3 if in three days)" }
          },
          required: ["title", "description", "priority", "duration_minutes", "risk_score", "risk_reason", "subtasks", "relative_deadline_days"]
        };

        const instruction = `You are an AI Productivity Expert. Your job is to parse natural language prompts describing a todo task or work item and output a beautifully structured JSON payload with title, description, priority (high, medium, low), typical duration in minutes, risk_score (0-100 estimate based on task complexity), risk_reason, relative_deadline_days, and an array of 3-5 logical subtasks.`;
        
        const response = await callGeminiWithRetry(prompt, instruction, responseSchema);
        const data = JSON.parse(response.text);

        const calculatedDeadline = new Date(Date.now() + data.relative_deadline_days * 24 * 60 * 60 * 1000);
        const calculatedPredicted = new Date(Date.now() + Math.max(1, data.relative_deadline_days - 1) * 24 * 60 * 60 * 1000);

        parsedTask = {
          title: data.title,
          description: data.description,
          priority: ["high", "medium", "low"].includes(data.priority?.toLowerCase()) ? data.priority.toLowerCase() : "medium",
          duration_minutes: data.duration_minutes || 60,
          risk_score: data.risk_score || 30,
          risk_reason: data.risk_reason || "Timeline pacing calculated.",
          deadline: calculatedDeadline.toISOString(),
          predicted_deadline: calculatedPredicted.toISOString(),
          subtasks: (data.subtasks || []).map((st: any, index: number) => ({
            id: `sub_${Math.random().toString(36).substr(2, 4)}_${index}`,
            title: st.title,
            completed: false
          }))
        };
      } else {
        // Mock parsing logic
        console.log("[Natural Language Parser] Mocking response...");
        const containsHigh = /\b(urgent|critical|high|asap|now)\b/i.test(prompt);
        const containsLow = /\b(low|flexible|chill|later)\b/i.test(prompt);
        const matchedPriority = containsHigh ? "high" : containsLow ? "low" : "medium";
        
        const matchesDeck = /\b(deck|slide|pitch|presentation)\b/i.test(prompt);
        const matchesCode = /\b(code|build|implement|api|endpoint|refactor|fix|bug)\b/i.test(prompt);

        let title = prompt.trim();
        if (title.length > 50) {
          title = title.substring(0, 47) + "...";
        }

        let mockSubtasks = [
          { id: `sub_${Math.random().toString(36).substr(2, 4)}_1`, title: "Define scope & objective", completed: false },
          { id: `sub_${Math.random().toString(36).substr(2, 4)}_2`, title: "Gather requirements & parameters", completed: false },
          { id: `sub_${Math.random().toString(36).substr(2, 4)}_3`, title: "Execute core implementation", completed: false }
        ];

        if (matchesDeck) {
          mockSubtasks = [
            { id: `sub_d1`, title: "Outline slide layout hierarchy", completed: false },
            { id: `sub_d2`, title: "Fill in market size & metrics metrics data", completed: false },
            { id: `sub_d3`, title: "Format visual layout and polish graphics", completed: false }
          ];
        } else if (matchesCode) {
          mockSubtasks = [
            { id: `sub_c1`, title: "Draft schema mapping & service layout", completed: false },
            { id: `sub_c2`, title: "Code controllers & integrate routing", completed: false },
            { id: `sub_c3`, title: "Review linter output & verify API endpoints", completed: false }
          ];
        }

        parsedTask = {
          title,
          description: `Extracted from prompt: "${prompt}"`,
          priority: matchedPriority,
          duration_minutes: matchesCode ? 120 : matchesDeck ? 90 : 60,
          risk_score: containsHigh ? 55 : 25,
          risk_reason: containsHigh ? "Urgent timeline increases delivery execution friction." : "Standard cognitive overhead estimated.",
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          predicted_deadline: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString(),
          subtasks: mockSubtasks
        };
      }

      // Detect dependencies from matching task titles in prompt
      const detectedDependencies: string[] = [];
      const userTasks = tasks.filter(t => t.user_id === loggedInUser.id);
      for (const t of userTasks) {
        const words = t.title.toLowerCase().split(/\s+/);
        // If prompt contains more than two words of any task, suggest it as dependency
        const matchedWords = words.filter(word => word.length > 3 && prompt.toLowerCase().includes(word));
        if (matchedWords.length >= 2) {
          detectedDependencies.push(t.id);
        }
      }

      const newTask = {
        id: "tsk_" + Math.random().toString(36).substr(2, 6),
        user_id: loggedInUser.id,
        goal_id: goals[0] ? goals[0].id : null,
        title: parsedTask.title,
        description: parsedTask.description,
        deadline: parsedTask.deadline,
        priority: parsedTask.priority as any,
        status: "pending" as any,
        is_proactive: false,
        subtasks: parsedTask.subtasks,
        dependencies: detectedDependencies,
        duration_minutes: parsedTask.duration_minutes,
        risk_score: parsedTask.risk_score,
        risk_reason: parsedTask.risk_reason,
        predicted_deadline: parsedTask.predicted_deadline,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      tasks.push(newTask);
      logActivity(loggedInUser.id, "TASK_NATURAL_PARSED_CREATE", { title: newTask.title });
      res.json({ success: true, data: newTask });

    } catch (err: any) {
      console.error("Natural language parser failed:", err);
      res.status(500).json({ error: err.message || "Failed parsing natural prompt" });
    }
  });

  // Task subtasks auto-breakdown endpoint
  app.post("/api/tasks/:id/breakdown", async (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    
    const taskIdx = tasks.findIndex(t => t.id === req.params.id && t.user_id === loggedInUser.id);
    if (taskIdx === -1) return res.status(404).json({ error: "Task not found." });

    const task = tasks[taskIdx];

    try {
      let subtasksList: { id: string, title: string, completed: boolean }[] = [];
      let duration = task.duration_minutes || 60;
      let riskScore = task.risk_score || 30;
      let riskReason = task.risk_reason || "Timeline pacing calculations active.";

      if (hasApiKey()) {
        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            duration_minutes: { type: Type.INTEGER },
            risk_score: { type: Type.INTEGER },
            risk_reason: { type: Type.STRING },
            subtasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING }
                },
                required: ["title"]
              }
            }
          },
          required: ["subtasks", "duration_minutes", "risk_score", "risk_reason"]
        };

        const instruction = `You are a productivity breakdown coordinator. Given a high-level task title and description, deconstruct it into 4 to 6 discrete, manageable subtask action items, estimate total duration in minutes, and score timeline risk from 0-100 with a detailed risk reason.`;
        const prompt = `Task Title: "${task.title}"\nDescription: "${task.description}"\nDeadline: "${task.deadline}"\nPriority: "${task.priority}"`;

        const response = await callGeminiWithRetry(prompt, instruction, responseSchema);
        const data = JSON.parse(response.text);

        duration = data.duration_minutes || duration;
        riskScore = data.risk_score || riskScore;
        riskReason = data.risk_reason || riskReason;
        subtasksList = (data.subtasks || []).map((st: any, i: number) => ({
          id: `sub_${Math.random().toString(36).substr(2, 4)}_${i}`,
          title: st.title,
          completed: false
        }));
      } else {
        // Simulated breakdown
        subtasksList = [
          { id: `sub_b_${Math.random().toString(36).substr(2, 4)}_1`, title: `Initialize research for "${task.title}"`, completed: false },
          { id: `sub_b_${Math.random().toString(36).substr(2, 4)}_2`, title: `Structure core execution components`, completed: false },
          { id: `sub_b_${Math.random().toString(36).substr(2, 4)}_3`, title: `Polish deliverables and cross-reference specifications`, completed: false }
        ];
        duration = 120;
        riskScore = task.priority === "high" ? 60 : 30;
        riskReason = "Mock breakdown generated: timeline risks calculated via static prioritizer.";
      }

      tasks[taskIdx].subtasks = subtasksList;
      tasks[taskIdx].duration_minutes = duration;
      tasks[taskIdx].risk_score = riskScore;
      tasks[taskIdx].risk_reason = riskReason;
      tasks[taskIdx].updated_at = new Date().toISOString();

      logActivity(loggedInUser.id, "TASK_AUTO_BREAKDOWN", { id: task.id, subtasksCount: subtasksList.length });
      res.json({ success: true, data: tasks[taskIdx] });

    } catch (err: any) {
      console.error("Task auto-breakdown failed:", err);
      res.status(500).json({ error: err.message || "Failed decomposing task subtasks" });
    }
  });

  app.patch("/api/tasks/:id", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    const { title, description, deadline, priority, status, subtasks, dependencies, duration_minutes, risk_score, risk_reason, predicted_deadline } = req.body;

    const taskIdx = tasks.findIndex(t => t.id === req.params.id && t.user_id === loggedInUser.id);
    if (taskIdx === -1) return res.status(404).json({ error: "Task not found." });

    if (title !== undefined) tasks[taskIdx].title = title;
    if (description !== undefined) tasks[taskIdx].description = description;
    if (deadline !== undefined) tasks[taskIdx].deadline = deadline;
    if (priority !== undefined) tasks[taskIdx].priority = priority;
    if (status !== undefined) tasks[taskIdx].status = status;
    if (subtasks !== undefined) tasks[taskIdx].subtasks = subtasks;
    if (dependencies !== undefined) tasks[taskIdx].dependencies = dependencies;
    if (duration_minutes !== undefined) tasks[taskIdx].duration_minutes = duration_minutes;
    if (risk_score !== undefined) tasks[taskIdx].risk_score = risk_score;
    if (risk_reason !== undefined) tasks[taskIdx].risk_reason = risk_reason;
    if (predicted_deadline !== undefined) tasks[taskIdx].predicted_deadline = predicted_deadline;
    tasks[taskIdx].updated_at = new Date().toISOString();

    logActivity(loggedInUser.id, "TASK_RECORD_UPDATE", { id: req.params.id, status });
    res.json({ success: true, data: tasks[taskIdx] });
  });

  app.delete("/api/tasks/:id", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    tasks = tasks.filter(t => !(t.id === req.params.id && t.user_id === loggedInUser.id));
    logActivity(loggedInUser.id, "TASK_RECORD_DELETE", { id: req.params.id });
    res.json({ success: true });
  });

  // Automated Schedule Optimization Endpoint
  app.post("/api/schedules/optimize", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });

    const userId = loggedInUser.id;
    const activeTasks = tasks.filter(t => t.user_id === userId && t.status !== "completed");
    
    if (activeTasks.length === 0) {
      return res.status(400).json({ error: "No pending tasks available to optimize schedule." });
    }

    // Sort active tasks by: Priority (high first), then Deadline (earlier first)
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const sortedTasks = [...activeTasks].sort((a, b) => {
      const pDiff = (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
      if (pDiff !== 0) return pDiff;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

    // Clear existing automated schedules first to perform a clean re-optimization
    schedules = schedules.filter(s => !(s.user_id === userId && s.description.includes("optimized")));

    // We will allocate them in logical cognitive blocks starting tomorrow morning (or today afternoon depending on time)
    const startBase = new Date();
    startBase.setHours(9, 0, 0, 0); // Start at 9:00 AM
    if (startBase.getTime() < Date.now()) {
      startBase.setDate(startBase.getDate() + 1); // Move to tomorrow if 9:00 AM is past
    }

    const optimizedBlocks: any[] = [];
    let currentSlotStart = new Date(startBase.getTime());

    sortedTasks.forEach((task, index) => {
      const duration = task.duration_minutes || 60;
      
      // Calculate end time
      const currentSlotEnd = new Date(currentSlotStart.getTime() + duration * 60 * 1000);

      // Create focused schedule slot
      const block = {
        id: "sch_" + Math.random().toString(36).substr(2, 6),
        user_id: userId,
        title: `Optimized: ${task.title}`,
        start_time: currentSlotStart.toISOString(),
        end_time: currentSlotEnd.toISOString(),
        description: `CoS optimized focus reservation block for "${task.title}". [Risk: ${task.risk_score || 20}%]`,
        is_cognitive_reservation: true,
        created_at: new Date().toISOString()
      };

      optimizedBlocks.push(block);
      schedules.push(block);

      // Move slot start forward, add a 15-minute "Decompression & Break" buffer
      currentSlotStart = new Date(currentSlotEnd.getTime() + 15 * 60 * 1000);

      // Avoid scheduling during late night (past 6 PM)
      if (currentSlotStart.getHours() >= 18) {
        currentSlotStart.setDate(currentSlotStart.getDate() + 1);
        currentSlotStart.setHours(9, 0, 0, 0); // Reset to 9:00 AM next day
      }
    });

    // Send dispatch alert notifications
    notifications.unshift({
      id: "not_" + Math.random().toString(36).substr(2, 6),
      user_id: userId,
      title: "Timeline Schedule Optimized",
      message: `Your calendar has been optimized dynamically. Reallocated ${optimizedBlocks.length} tasks into non-overlapping cognitive focus blocks with 15m decompression buffers.`,
      is_read: false,
      type: "schedule",
      created_at: new Date().toISOString()
    });

    logActivity(userId, "SCHEDULE_DYNAMICAL_OPTIMIZE", { count: optimizedBlocks.length });

    res.json({ success: true, message: "Calendar optimization completed successfully.", data: optimizedBlocks });
  });

  // ==========================================
  // HABITS APIs
  // ==========================================

  app.get("/api/habits", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    const userHabits = habits.filter(h => h.user_id === loggedInUser.id);
    res.json({ success: true, data: userHabits });
  });

  app.post("/api/habits", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    const { title, description, frequency } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required." });

    const newHabit = {
      id: "hab_" + Math.random().toString(36).substr(2, 6),
      user_id: loggedInUser.id,
      title,
      description: description || "",
      frequency: frequency || "daily",
      streak: 0,
      last_completed_at: null,
      created_at: new Date().toISOString()
    };

    habits.push(newHabit);
    logActivity(loggedInUser.id, "HABIT_RECORD_CREATE", { title });
    res.json({ success: true, data: newHabit });
  });

  app.post("/api/habits/:id/complete", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    const habitIdx = habits.findIndex(h => h.id === req.params.id && h.user_id === loggedInUser.id);
    if (habitIdx === -1) return res.status(404).json({ error: "Habit not found." });

    habits[habitIdx].streak += 1;
    habits[habitIdx].last_completed_at = new Date().toISOString();

    logActivity(loggedInUser.id, "HABIT_RECORD_COMPLETE", { id: req.params.id, new_streak: habits[habitIdx].streak });
    res.json({ success: true, data: habits[habitIdx] });
  });

  app.delete("/api/habits/:id", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    habits = habits.filter(h => !(h.id === req.params.id && h.user_id === loggedInUser.id));
    logActivity(loggedInUser.id, "HABIT_RECORD_DELETE", { id: req.params.id });
    res.json({ success: true });
  });

  // ==========================================
  // REFLECTION APIs
  // ==========================================

  app.get("/api/reflections", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    const userReflections = dailyReflections.filter(r => r.user_id === loggedInUser.id);
    res.json({ success: true, data: userReflections });
  });

  app.post("/api/reflections", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    const { mood_score, insights, blockers } = req.body;

    const newReflection = {
      id: "ref_" + Math.random().toString(36).substr(2, 6),
      user_id: loggedInUser.id,
      date: new Date().toISOString().split("T")[0],
      mood_score: parseInt(mood_score) || 8,
      insights: insights || "",
      blockers: blockers || "",
      created_at: new Date().toISOString()
    };

    dailyReflections.push(newReflection);
    logActivity(loggedInUser.id, "REFLECTION_RECORD_CREATE", { mood_score });
    res.json({ success: true, data: newReflection });
  });

  // ==========================================
  // AI MEMORIES APIs
  // ==========================================

  app.get("/api/memories", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    const userMemories = aiMemories.filter(m => m.user_id === loggedInUser.id);
    res.json({ success: true, data: userMemories });
  });

  app.post("/api/memories", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    const { content, metadata } = req.body;
    if (!content) return res.status(400).json({ error: "Memory content is required." });

    const newMemory = {
      id: "mem_" + Math.random().toString(36).substr(2, 6),
      user_id: loggedInUser.id,
      content,
      metadata: metadata || {},
      created_at: new Date().toISOString()
    };

    aiMemories.push(newMemory);
    logActivity(loggedInUser.id, "COGNITIVE_MEMORY_PERSIST", { preview: content.substr(0, 30) });
    res.json({ success: true, data: newMemory });
  });

  app.delete("/api/memories/:id", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    const memoryId = req.params.id;
    aiMemories = aiMemories.filter(m => !(m.id === memoryId && m.user_id === loggedInUser.id));
    logActivity(loggedInUser.id, "COGNITIVE_MEMORY_PURGE", { id: memoryId });
    res.json({ success: true });
  });

  // ==========================================
  // SCHEDULES APIs
  // ==========================================

  app.get("/api/schedules", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    const userSchedules = schedules.filter(s => s.user_id === loggedInUser.id);
    res.json({ success: true, data: userSchedules });
  });

  app.post("/api/schedules", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    const { title, start_time, end_time, description, is_cognitive_reservation } = req.body;
    if (!title || !start_time || !end_time) return res.status(400).json({ error: "Missing required schedule values." });

    const newSchedule = {
      id: "sch_" + Math.random().toString(36).substr(2, 6),
      user_id: loggedInUser.id,
      title,
      start_time,
      end_time,
      description: description || "",
      is_cognitive_reservation: !!is_cognitive_reservation,
      created_at: new Date().toISOString()
    };

    schedules.push(newSchedule);
    logActivity(loggedInUser.id, "SCHEDULE_SLOT_RESERVE", { title });
    res.json({ success: true, data: newSchedule });
  });

  app.delete("/api/schedules/:id", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    schedules = schedules.filter(s => !(s.id === req.params.id && s.user_id === loggedInUser.id));
    logActivity(loggedInUser.id, "SCHEDULE_SLOT_RELEASE", { id: req.params.id });
    res.json({ success: true });
  });

  // ==========================================
  // NOTIFICATIONS APIs
  // ==========================================

  app.get("/api/notifications", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    const userNotifs = notifications.filter(n => n.user_id === loggedInUser.id);
    res.json({ success: true, data: userNotifs });
  });

  app.post("/api/notifications/:id/read", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    const notifIdx = notifications.findIndex(n => n.id === req.params.id && n.user_id === loggedInUser.id);
    if (notifIdx !== -1) {
      notifications[notifIdx].is_read = true;
    }
    res.json({ success: true });
  });

  // ==========================================
  // ACTIVITY AUDIT LOGS APIs
  // ==========================================

  app.get("/api/logs", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    const userLogs = activityLogs.filter(l => l.user_id === loggedInUser.id);
    res.json({ success: true, data: userLogs });
  });

  // ==========================================
  // AUTONOMOUS ASSISTANT CO-PILOT APIs
  // ==========================================

  app.get("/api/agent/productivity-profile", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    try {
      const context = getContextForUser(loggedInUser.id);
      AutonomousAssistant.generateProductivityProfile(context).then((profile) => {
        res.json({ success: true, profile });
      }).catch((err) => {
        res.status(500).json({ error: err.message });
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/agent/daily-brief", async (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    try {
      const context = getContextForUser(loggedInUser.id);
      const result = await AutonomousAssistant.generateDailyBrief(context);
      
      logActivity(loggedInUser.id, "AI_DAILY_BRIEF_GENERATED", { preview: result.brief.slice(0, 50) });
      
      // Dispatch morning notification alert
      notifications.unshift({
        id: "not_" + Math.random().toString(36).substr(2, 6),
        user_id: loggedInUser.id,
        title: "AI Daily Brief Prepared",
        message: "Your personalized executive briefing has been prepared automatically for this morning.",
        is_read: false,
        type: "agent",
        created_at: new Date().toISOString()
      });

      res.json({ success: true, brief: result.brief, thoughts: result.thoughts });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/agent/night-reflection", async (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    try {
      const context = getContextForUser(loggedInUser.id);
      const result = await AutonomousAssistant.generateNightReflection(context);

      logActivity(loggedInUser.id, "AI_NIGHT_REFLECTION_GENERATED", { preview: result.reflection.slice(0, 50) });

      // Dispatch evening notification alert
      notifications.unshift({
        id: "not_" + Math.random().toString(36).substr(2, 6),
        user_id: loggedInUser.id,
        title: "AI Night Reflection Compiled",
        message: "Your evening cognitive and burnout analysis has been synthesized.",
        is_read: false,
        type: "agent",
        created_at: new Date().toISOString()
      });

      res.json({ success: true, reflection: result.reflection, thoughts: result.thoughts });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/agent/simulate-meeting-change", async (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    try {
      const userId = loggedInUser.id;
      
      // 1. Insert or adjust an overlapping high-importance meeting
      const meetingId = "sch_conflict_" + Math.random().toString(36).substr(2, 6);
      const startTime = new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(); // 1.5 hours from now
      const endTime = new Date(Date.now() + 3.0 * 60 * 60 * 1000).toISOString(); // 3 hours from now

      const conflictingMeeting = {
        id: meetingId,
        user_id: userId,
        title: "⚠️ CRITICAL: Series A Partners Q&A Session",
        start_time: startTime,
        end_time: endTime,
        description: "Emergency partner briefing - schedule change forced automatically.",
        is_cognitive_reservation: false,
        created_at: new Date().toISOString()
      };

      schedules.push(conflictingMeeting);

      // 2. Clear any optimized focus blocks in that window
      schedules = schedules.filter(s => {
        if (s.user_id !== userId || !s.is_cognitive_reservation) return true;
        // If overlap with [startTime, endTime], remove it
        const sStart = new Date(s.start_time).getTime();
        const sEnd = new Date(s.end_time).getTime();
        const cStart = new Date(startTime).getTime();
        const cEnd = new Date(endTime).getTime();
        const overlap = sStart < cEnd && sEnd > cStart;
        return !overlap;
      });

      // 3. Run re-optimization
      const activeTasks = tasks.filter(t => t.user_id === userId && t.status !== "completed");
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const sortedTasks = [...activeTasks].sort((a, b) => {
        const pDiff = (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
        if (pDiff !== 0) return pDiff;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });

      // Allocate focus blocks after the conflicting meeting
      let currentSlotStart = new Date(endTime);
      currentSlotStart = new Date(currentSlotStart.getTime() + 15 * 60 * 1000); // 15m buffer

      sortedTasks.forEach((task) => {
        const duration = task.duration_minutes || 60;
        const currentSlotEnd = new Date(currentSlotStart.getTime() + duration * 60 * 1000);

        schedules.push({
          id: "sch_" + Math.random().toString(36).substr(2, 6),
          user_id: userId,
          title: `Optimized: ${task.title}`,
          start_time: currentSlotStart.toISOString(),
          end_time: currentSlotEnd.toISOString(),
          description: `Auto-rescheduled around Q&A. [Risk: ${task.risk_score || 20}%]`,
          is_cognitive_reservation: true,
          created_at: new Date().toISOString()
        });

        currentSlotStart = new Date(currentSlotEnd.getTime() + 15 * 60 * 1000);
        if (currentSlotStart.getHours() >= 18) {
          currentSlotStart.setDate(currentSlotStart.getDate() + 1);
          currentSlotStart.setHours(9, 0, 0, 0);
        }
      });

      // Dispatch alert
      notifications.unshift({
        id: "not_" + Math.random().toString(36).substr(2, 6),
        user_id: userId,
        title: "📅 Calendar Collision Rescheduled",
        message: "An emergency partner briefing was added. CoS automatically rescheduled your focus blocks to avoid overlaps.",
        is_read: false,
        type: "schedule",
        created_at: new Date().toISOString()
      });

      logActivity(userId, "MEETING_COLLISION_AUTO_RESCHEDULE", { meeting: conflictingMeeting.title });

      res.json({
        success: true,
        message: "Emergency meeting added. Calendar reallocated automatically.",
        conflictingMeeting,
        schedules: schedules.filter(s => s.user_id === userId)
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/agent/simulate-deadline-shift", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    try {
      const userId = loggedInUser.id;

      // 1. Move a task's deadline earlier
      const targetTask = tasks.find(t => t.user_id === userId && t.status !== "completed");
      if (!targetTask) {
        return res.status(400).json({ error: "No pending tasks to shift." });
      }

      const oldDeadline = targetTask.deadline;
      const newDeadline = new Date(new Date(oldDeadline).getTime() - 24 * 60 * 60 * 1000).toISOString(); // 1 day earlier
      
      targetTask.deadline = newDeadline;
      targetTask.predicted_deadline = new Date(new Date(newDeadline).getTime() - 12 * 60 * 60 * 1000).toISOString(); // 12h buffer
      targetTask.risk_score = Math.min(95, (targetTask.risk_score || 30) + 25); // elevate risk score
      targetTask.risk_reason = "⚠️ DEADLINE ACCELERATED: Shifted 24 hours earlier. Requires immediate cognitive priority.";
      targetTask.updated_at = new Date().toISOString();

      // 2. Recalculate schedule blocks so focus window is moved ahead
      schedules = schedules.filter(s => !(s.user_id === userId && s.title.includes(targetTask.title)));

      // Insert immediate focus block today afternoon
      const slotStart = new Date();
      slotStart.setHours(slotStart.getHours() + 1); // 1 hour from now
      const slotEnd = new Date(slotStart.getTime() + (targetTask.duration_minutes || 60) * 60 * 1000);

      schedules.push({
        id: "sch_" + Math.random().toString(36).substr(2, 6),
        user_id: userId,
        title: `Optimized (Accelerated): ${targetTask.title}`,
        start_time: slotStart.toISOString(),
        end_time: slotEnd.toISOString(),
        description: `CoS prioritized block due to accelerated deadline.`,
        is_cognitive_reservation: true,
        created_at: new Date().toISOString()
      });

      // Dispatch alert
      notifications.unshift({
        id: "not_" + Math.random().toString(36).substr(2, 6),
        user_id: userId,
        title: "⚠️ Deadline Shipped - Recalculating",
        message: `Deadline for "${targetTask.title}" shifted earlier. CoS bumped cognitive reservation priority to high and moved focus block to immediate.`,
        is_read: false,
        type: "agent",
        created_at: new Date().toISOString()
      });

      logActivity(userId, "DEADLINE_SHIFT_RECALCULATE", { task: targetTask.title, new_deadline: newDeadline });

      res.json({
        success: true,
        message: "Deadline shifted. Risk score and schedule blocks recalculated.",
        updatedTask: targetTask,
        schedules: schedules.filter(s => s.user_id === userId)
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/agent/simulate-missed-tasks", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    try {
      const userId = loggedInUser.id;

      // Ensure at least one task is marked "overdue" (deadline in the past and status !== 'completed')
      let overdueTask = tasks.find(t => t.user_id === userId && new Date(t.deadline).getTime() < Date.now() && t.status !== "completed");
      
      if (!overdueTask) {
        // Create a fake missed task for simulation
        overdueTask = {
          id: "tsk_missed_" + Math.random().toString(36).substr(2, 6),
          user_id: userId,
          goal_id: goals[0] ? goals[0].id : null,
          title: "Verify Q3 CAC Ratio Ingestion",
          description: "Synthesize marketing funnel CAC with sales pipeline numbers.",
          deadline: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
          priority: "high",
          status: "pending",
          is_proactive: false,
          subtasks: [
            { id: "sub_m1", title: "Extract stripe conversion counts", completed: false },
            { id: "sub_m2", title: "Cross check with LinkedIn spend sheets", completed: false }
          ],
          dependencies: [],
          duration_minutes: 60,
          risk_score: 90,
          risk_reason: "🚨 OVERDUE: Due 12 hours ago with zero completion checkpoints.",
          predicted_deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        };
        tasks.push(overdueTask);
      }

      // Generate Recovery Plan:
      // 1. Create AI Recovery Plan Task
      const recoveryTask = {
        id: "tsk_recovery_" + Math.random().toString(36).substr(2, 6),
        user_id: userId,
        goal_id: overdueTask.goal_id,
        title: "🚨 CoS Recovery Plan: Missed Tasks Catch-Up",
        description: `Direct neural recovery timeline targeting overdue item: "${overdueTask.title}"`,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // due in 24 hours
        priority: "high" as any,
        status: "pending" as any,
        is_proactive: true,
        subtasks: [
          { id: "sub_rc1", title: "Review backlog & suppress non-critical tabs", completed: false },
          { id: "sub_rc2", title: "Execute prioritized focus slot for: " + overdueTask.title, completed: false },
          { id: "sub_rc3", title: "Log blockers & perform 15m decompression walk", completed: false }
        ],
        dependencies: [overdueTask.id],
        duration_minutes: 90,
        risk_score: 15,
        risk_reason: "CoS safety recovery buffer applied successfully.",
        predicted_deadline: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      tasks.push(recoveryTask);

      // 2. Allocate an immediate focus block for recovery
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 1); // start in 1 hour
      const endTime = new Date(startTime.getTime() + 90 * 60 * 1000); // 90 mins duration

      schedules.push({
        id: "sch_" + Math.random().toString(36).substr(2, 6),
        user_id: userId,
        title: "🧠 Recovery Session: " + overdueTask.title,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        description: `Autonomous CoS recovery window. Locked focus block to complete missed item.`,
        is_cognitive_reservation: true,
        created_at: new Date().toISOString()
      });

      // 3. Dispatch high-urgency alert notification
      notifications.unshift({
        id: "not_" + Math.random().toString(36).substr(2, 6),
        user_id: userId,
        title: "🚨 CoS Recovery Plan Triggered",
        message: `Task overdue detection was triggered for "${overdueTask.title}". A custom Recovery Plan has been injected and focus scheduled.`,
        is_read: false,
        type: "agent",
        created_at: new Date().toISOString()
      });

      logActivity(userId, "MISSED_TASK_RECOVERY_TRIGGERED", { overdue: overdueTask.title });

      res.json({
        success: true,
        message: "Overdue tasks resolved. AI Recovery Plan and immediate focus schedule block injected.",
        recoveryTask,
        overdueTask
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // AGENT WORKLOAD CHAT ENDPOINT (ORCHESTRATOR)
  // ==========================================

  // Helper to build user context
  const getContextForUser = (userId: string): UserContext => {
    return {
      profile: users.find(u => u.id === userId) || users[0],
      goals: goals.filter(g => g.user_id === userId),
      tasks: tasks.filter(t => t.user_id === userId),
      habits: habits.filter(h => h.user_id === userId),
      reflections: dailyReflections.filter(r => r.user_id === userId),
      schedules: schedules.filter(s => s.user_id === userId),
      memories: aiMemories.filter(m => m.user_id === userId),
    };
  };

  // ==========================================
  // INDEPENDENT AGENT ENDPOINTS
  // ==========================================

  app.post("/api/agent/context", async (req, res) => {
    try {
      const { prompt } = req.body;
      const userId = loggedInUser?.id || "usr_01h8a9";
      const context = getContextForUser(userId);
      const result = await ContextAgent.execute(context, prompt || "Analyze workspace context");
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Context Agent execution failed" });
    }
  });

  app.post("/api/agent/memory", async (req, res) => {
    try {
      const { prompt } = req.body;
      const userId = loggedInUser?.id || "usr_01h8a9";
      const context = getContextForUser(userId);
      const result = await MemoryAgent.execute(context, prompt || "Retrieve memory alignments");
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Memory Agent execution failed" });
    }
  });

  app.post("/api/agent/planner", async (req, res) => {
    try {
      const { prompt, contextSummary, memoryInsights } = req.body;
      const userId = loggedInUser?.id || "usr_01h8a9";
      const context = getContextForUser(userId);
      const result = await PlannerAgent.execute(
        context,
        prompt || "Plan steps",
        contextSummary || "Default context",
        memoryInsights || []
      );
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Planner Agent execution failed" });
    }
  });

  app.post("/api/agent/scheduler", async (req, res) => {
    try {
      const { prompt, actionItems } = req.body;
      const userId = loggedInUser?.id || "usr_01h8a9";
      const context = getContextForUser(userId);
      const result = await SchedulerAgent.execute(context, prompt || "Schedule blocks", actionItems || []);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Scheduler Agent execution failed" });
    }
  });

  app.post("/api/agent/priority", async (req, res) => {
    try {
      const { prompt, actionItems } = req.body;
      const userId = loggedInUser?.id || "usr_01h8a9";
      const context = getContextForUser(userId);
      const result = await PriorityAgent.execute(context, prompt || "Score priorities", actionItems || []);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Priority Agent execution failed" });
    }
  });

  app.post("/api/agent/deadline-risk", async (req, res) => {
    try {
      const { prompt, actionItems } = req.body;
      const userId = loggedInUser?.id || "usr_01h8a9";
      const context = getContextForUser(userId);
      const result = await DeadlineRiskAgent.execute(context, prompt || "Assess deadline risks", actionItems || []);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Deadline Risk Agent execution failed" });
    }
  });

  app.post("/api/agent/reflection", async (req, res) => {
    try {
      const { prompt, actionItems } = req.body;
      const userId = loggedInUser?.id || "usr_01h8a9";
      const context = getContextForUser(userId);
      const result = await ReflectionAgent.execute(context, prompt || "Assess mental pacing", actionItems || []);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Reflection Agent execution failed" });
    }
  });

  // ==========================================
  // CENTRAL ORCHESTRATOR ENDPOINT
  // ==========================================

  app.post("/api/agent/chat", async (req, res) => {
    try {
      const { prompt, history } = req.body;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Instruction prompt is required and must be a string." });
      }

      const userId = loggedInUser?.id || "usr_01h8a9";
      const context = getContextForUser(userId);

      // Trigger the multi-agent coordination loop
      const orchestrationResult = await Orchestrator.coordinate(context, prompt, history || []);
      const parsedPlan = orchestrationResult.plan;

      // Automatically inject active plan tasks and schedules into the live dashboard
      if (loggedInUser) {
        const firstItem = parsedPlan.action_items[0];
        
        // 1. Create schedule focus block from the first action item
        schedules.push({
          id: "sch_" + Math.random().toString(36).substr(2, 6),
          user_id: loggedInUser.id,
          title: `Focus Block: ${firstItem?.title || prompt}`,
          start_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + (4 + (firstItem?.estimated_duration_minutes || 60) / 60) * 60 * 60 * 1000).toISOString(),
          description: firstItem?.description || "Agent auto-reservation slot.",
          is_cognitive_reservation: true,
          created_at: new Date().toISOString()
        });

        // 2. Push first action item as pending task
        tasks.push({
          id: "tsk_" + Math.random().toString(36).substr(2, 6),
          user_id: loggedInUser.id,
          goal_id: goals[0] ? goals[0].id : null,
          title: `CoS Deliverable: ${firstItem?.title || prompt}`,
          description: firstItem?.description || "",
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          priority: (parsedPlan.priority_level === "high" ? "high" : "medium") as any,
          status: "pending" as any,
          is_proactive: true,
          subtasks: [],
          dependencies: [],
          duration_minutes: firstItem?.estimated_duration_minutes || 60,
          risk_score: parsedPlan.priority_level === "high" ? 45 : 20,
          risk_reason: "CoS multi-agent plan synchronized.",
          predicted_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        // 3. Dispatch Notification
        notifications.unshift({
          id: "not_" + Math.random().toString(36).substr(2, 6),
          user_id: loggedInUser.id,
          title: `Autonomous Engine Synchronized`,
          message: `Orchestrated plan '${parsedPlan.plan_id}' constructed successfully containing ${parsedPlan.action_items.length} steps.`,
          is_read: false,
          type: "agent",
          created_at: new Date().toISOString()
        });

        // 4. Audit Log
        logActivity(loggedInUser.id, "PROACTIVE_AGENT_PLAN_SYNC", { 
          prompt, 
          plan_id: parsedPlan.plan_id,
          priority: parsedPlan.priority_level
        });
      }

      return res.json(orchestrationResult);

    } catch (error: any) {
      console.error("Orchestration endpoint error:", error);
      return res.status(500).json({ error: error?.message || "Internal Agent Error" });
    }
  });

  // ==========================================
  // GOOGLE WORKSPACE INTEGRATIONS
  // ==========================================

  app.get("/api/integrations/google/calendar/sync", async (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({ error: "Missing Google OAuth access token." });
    }
    const accessToken = authHeader.split(" ")[1];

    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });
      const calendarResponse = await calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        maxResults: 15,
        singleEvents: true,
        orderBy: "startTime"
      });

      const googleEvents = calendarResponse.data.items || [];
      const syncedSchedules = googleEvents.map((event: any) => ({
        id: "google_" + event.id,
        user_id: loggedInUser.id,
        title: event.summary || "Google Calendar Event",
        start_time: event.start?.dateTime || event.start?.date || new Date().toISOString(),
        end_time: event.end?.dateTime || event.end?.date || new Date().toISOString(),
        description: event.description || "Synced from Google Calendar",
        is_cognitive_reservation: false,
        is_google_event: true,
        created_at: new Date().toISOString()
      }));

      // Remove previous synced Google events to avoid duplicates, then push new ones
      schedules = schedules.filter(s => !s.id.startsWith("google_") || s.user_id !== loggedInUser.id);
      schedules.push(...syncedSchedules);

      logActivity(loggedInUser.id, "GOOGLE_CALENDAR_SYNC", { count: googleEvents.length });

      res.json({ success: true, data: syncedSchedules });
    } catch (error: any) {
      console.error("Google Calendar sync error:", error);
      res.status(500).json({ error: error?.message || "Failed to sync Google Calendar." });
    }
  });

  app.post("/api/integrations/google/calendar/event", async (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({ error: "Missing Google OAuth access token." });
    }
    const accessToken = authHeader.split(" ")[1];

    const { title, start_time, end_time, description } = req.body;
    if (!title || !start_time || !end_time) {
      return res.status(400).json({ error: "Missing required event fields." });
    }

    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });
      const createdEvent = await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: title,
          description: description || "Created via Momentum AI Co-pilot",
          start: { dateTime: start_time },
          end: { dateTime: end_time }
        }
      });

      const newSchedule = {
        id: "google_" + createdEvent.data.id,
        user_id: loggedInUser.id,
        title,
        start_time,
        end_time,
        description: description || "Created via Momentum AI Co-pilot",
        is_cognitive_reservation: true,
        created_at: new Date().toISOString()
      };

      schedules.push(newSchedule);
      logActivity(loggedInUser.id, "GOOGLE_EVENT_CREATE", { title });

      res.json({ success: true, data: newSchedule });
    } catch (error: any) {
      console.error("Google Event Creation error:", error);
      res.status(500).json({ error: error?.message || "Failed to create Google Calendar event." });
    }
  });

  app.post("/api/integrations/google/calendar/auto-schedule", async (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({ error: "Missing Google OAuth access token." });
    }
    const accessToken = authHeader.split(" ")[1];

    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });
      
      // Fetch events for the next 3 days
      const eventsRes = await calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        timeMax: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        singleEvents: true,
        orderBy: "startTime"
      });
      const events = eventsRes.data.items || [];

      // Consolidate all busy intervals
      const busyIntervals = [
        ...events.map((e: any) => ({
          start: new Date(e.start?.dateTime || e.start?.date || ""),
          end: new Date(e.end?.dateTime || e.end?.date || "")
        })),
        ...schedules
          .filter(s => s.user_id === loggedInUser.id && !s.id.startsWith("google_"))
          .map(s => ({
            start: new Date(s.start_time),
            end: new Date(s.end_time)
          }))
      ].filter(i => !isNaN(i.start.getTime()) && !isNaN(i.end.getTime()));

      // Algorithmic focus slot solver (9 AM - 5 PM)
      let foundStart: Date | null = null;
      let foundEnd: Date | null = null;

      for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
        const targetDay = new Date();
        targetDay.setDate(targetDay.getDate() + dayOffset);
        
        const windowStart = new Date(targetDay);
        windowStart.setHours(9, 0, 0, 0);
        const windowEnd = new Date(targetDay);
        windowEnd.setHours(17, 0, 0, 0);

        if (dayOffset === 0) {
          const minStart = new Date(Date.now() + 60 * 60 * 1000); // at least 1 hr from now
          if (minStart > windowStart) {
            windowStart.setTime(minStart.getTime());
          }
        }

        let candidate = new Date(windowStart);
        while (candidate.getTime() + 90 * 60 * 1000 <= windowEnd.getTime()) {
          const candEnd = new Date(candidate.getTime() + 90 * 60 * 1000);
          
          const overlaps = busyIntervals.some(interval => {
            return (candidate < interval.end && candEnd > interval.start);
          });

          if (!overlaps) {
            foundStart = candidate;
            foundEnd = candEnd;
            break;
          }
          candidate.setTime(candidate.getTime() + 30 * 60 * 1000); // step by 30 mins
        }
        if (foundStart) break;
      }

      // Default fallback
      if (!foundStart || !foundEnd) {
        foundStart = new Date();
        foundStart.setDate(foundStart.getDate() + 1);
        foundStart.setHours(10, 0, 0, 0);
        foundEnd = new Date(foundStart.getTime() + 90 * 60 * 1000);
      }

      const autoTitle = "Autonomous Focus Block: Deep Focus & Strategy";
      const autoDesc = "Scheduled automatically by Momentum AI Co-pilot to maximize cognitive bandwidth protection.";

      const createdEvent = await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: autoTitle,
          description: autoDesc,
          start: { dateTime: foundStart.toISOString() },
          end: { dateTime: foundEnd.toISOString() }
        }
      });

      const newSchedule = {
        id: "google_" + createdEvent.data.id,
        user_id: loggedInUser.id,
        title: autoTitle,
        start_time: foundStart.toISOString(),
        end_time: foundEnd.toISOString(),
        description: autoDesc,
        is_cognitive_reservation: true,
        created_at: new Date().toISOString()
      };

      schedules.push(newSchedule);
      logActivity(loggedInUser.id, "GOOGLE_AUTO_SCHEDULE", { title: autoTitle });

      res.json({ success: true, data: newSchedule });
    } catch (error: any) {
      console.error("Google Auto Schedule error:", error);
      res.status(500).json({ error: error?.message || "Failed to auto-schedule focus block." });
    }
  });

  app.post("/api/integrations/google/gmail/send", async (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({ error: "Missing Google OAuth access token." });
    }
    const accessToken = authHeader.split(" ")[1];

    const { to, subject, body } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ error: "Missing required email details." });
    }

    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const gmail = google.gmail({ version: "v1", auth: oauth2Client });
      
      const emailContent = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: text/html; charset=utf-8`,
        `MIME-Version: 1.0`,
        ``,
        `<div>${body.replace(/\n/g, "<br/>")}</div>`
      ].join("\r\n");

      const encodedMessage = Buffer.from(emailContent)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedMessage
        }
      });

      logActivity(loggedInUser.id, "GOOGLE_GMAIL_SEND", { subject });
      res.json({ success: true });
    } catch (error: any) {
      console.error("Google Gmail send error:", error);
      res.status(500).json({ error: error?.message || "Failed to send email via Gmail." });
    }
  });

  // ==========================================
  // MULTIMODAL AUDIO VOICE STRATEGY API
  // ==========================================

  app.post("/api/agent/multimodal-audio", async (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized." });

    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: "Missing audioBase64 string." });
    }

    try {
      const { getGeminiClient, hasApiKey } = await import("./server/agents/geminiClient.js");
      if (!hasApiKey()) {
        return res.json({
          success: true,
          text: "### Voice Input Processed (Simulated Fallback)\n- **Spoken Intention**: \"ReviewSeries A Slide Designs and coordinate feedback loops with advisor teams.\"\n- **CoS Action Plan**: Automatically queued a 90-minute focus reservation to audit design templates tomorrow at 10:00 AM."
        });
      }

      const client = getGeminiClient();
      if (!client) {
        return res.status(500).json({ error: "Gemini client could not be initialized." });
      }

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: mimeType || "audio/webm",
              data: audioBase64
            }
          },
          "Extract the spoken thoughts, plans, or tasks from this voice recording. Render a structured Markdown breakdown outlining: 1. Spoken Intention Summary, 2. Suggested Milestone Actions, and 3. Timeline Allocation details."
        ]
      });

      logActivity(loggedInUser.id, "VOICE_INPUT_TRANSCRIBE");
      res.json({ success: true, text: response.text || "Could not extract voice narration summary." });
    } catch (error: any) {
      console.error("Multimodal audio error:", error);
      res.status(500).json({ error: error?.message || "Failed to parse voice strategy input." });
    }
  });

  // Serve static code contents for the Monorepo Explorer to prevent file read errors in sandbox
  app.post("/api/monorepo/file", (req, res) => {
    try {
      const { filePath } = req.body;
      if (!filePath || typeof filePath !== "string") {
        return res.status(400).json({ error: "filePath is required" });
      }

      const sanitizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\))+/, "");
      const fullPath = path.join(process.cwd(), sanitizedPath);

      if (!sanitizedPath.startsWith("frontend") && !sanitizedPath.startsWith("backend") && sanitizedPath !== "docker-compose.yml" && sanitizedPath !== "README.md") {
        return res.status(403).json({ error: "Access denied to path: " + sanitizedPath });
      }

      res.sendFile(fullPath);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "File read failed." });
    }
  });

  // Vite development vs production asset serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
