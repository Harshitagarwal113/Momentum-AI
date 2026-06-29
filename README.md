# Momentum AI — Autonomous Chief of Staff
### *Premium, High-Performance Agentic Co-Pilot (React + Express Monorepo)*

Momentum AI is an elite, production-grade productivity platform operating as an **Autonomous Chief of Staff**. Built around an advanced **Agentic Cognitive Loop**, it continuously monitors user calendars, logs cognitive reflection patterns, aligns execution items with long-term memories, and proactively schedules decompression buffers to guard your peak productivity cycles.

---

## ✨ Features & Capabilities

*   🧠 **Unified High-Performance Cognitive Loop**: Powered by a single-pass Gemini model call that consolidates context gathering, planning, prioritization, risk evaluation, and memory alignment. This advanced pipeline reduces latency by up to 80% while preserving detailed trace parameters for review.
*   📅 **Google Workspace Integrations**:
    *   **Calendar Sync**: Securely sync meetings and custom sessions to construct an optimized cognitive roadmap.
    *   **Auto-Schedule Focus Slots**: Reserve high-energy focus slots on your Google Calendar automatically based on your agenda.
    *   **Gmail Briefing Dispatch**: Instantly format and send executive summaries and schedule agendas to your inbox.
*   🔒 **Firebase Unified Authentication**: Seamless Google Single Sign-On and session management with local credential persistence.
*   📊 **Aesthetic Glassmorphic UI**: Ambient dark interface using a premium obsidian slate and emerald palette, featuring smooth micro-animations, real-time alerts, and responsive layouts.
*   🛠️ **Real-Time Developer Console**: Live tracing of sub-agent decisions (Context, Memory, Planner), security audit logs, and an integrated monorepo file explorer.

---

## 📖 User Segment Manual & How It Works

Here is a short guide on how to interact with each workspace segment of Momentum AI:

1.  **🏠 Home Segment**: Your Command Center. Displays focus metrics, habit rings, and daily agendas. Simply log daily habits or check today's tasks to automatically update focus scores.
2.  **📅 Schedule Segment**: Weekly planner with fatigue prevention. Fill out the slot creator and toggle *High Cognitive Resource Required* for focus-heavy slots to reserve focus blocks.
3.  **📋 Tasks Segment**: Priority matrices. Create goals, then add tasks with High, Medium, or Low urgency. Completing a task automatically advances your daily productivity metrics.
4.  **🤖 AI Assistant**: Chief of Staff Strategist. Type any prompt (e.g., *"Help me plan my week"*). A unified high-performance model processes context instantly and populates live, actionable checklists.
5.  **🧠 Insights Segment**: Cognitive analysis. Add text-based workflow preferences under **Long-Term Guidelines** (e.g., *"No meetings after 5 PM"*). Click **Get Daily Briefing** to receive optimized agendas.
6.  **⚙️ Settings Segment**: Account bridges. Connect your **Google Workspace** to unlock calendar syncing, auto-schedule focus windows directly on Google Calendar, and receive daily briefings in your real Gmail inbox.

---

## 🏗️ Architectural Blueprint

The platform is designed as a unified full-stack monorepo built using **React (Vite) + Express (NodeJS)**, optimized for seamless serverless scaling on Google Cloud Run.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Momentum React UI (Vite)                        │
│   - Glassmorphic Dashboard with fluid motion-driven animations         │
│   - Area Chart Visualizers, Habit Rings, & Cognitive Reflection Sheets │
│   - Floating Feedback Toast Engine & Real-Time Security Logs           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         REST API & Firebase Auth
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Express Backend Server                          │
│   - Stateless Router & Static Asset Server                             │
│   - AsyncLocalStorage Context Isolation Middleware                     │
│   - Lazy-Initialized SDK Clients with Graceful Key Fallbacks           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                    Structured JSON Prompt Handshakes
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Unified Agentic Orchestrator                        │
│   - Orchestrates multi-agent traces in a consolidated, single-pass     │
│     high-throughput model execution loop.                              │
└───────────────────┬───────────────┼───────────────────┬────────────────┘
                    │               │                   │
                    ▼               ▼                   ▼
          ┌───────────┐       ┌───────────┐       ┌───────────┐
          │Context    │       │Memory     │       │Planner    │
          │Agent Trace│       │Agent Trace│       │Agent Trace│
          └───────────┘       └───────────┘       └───────────┘
                    │               │                   │
                    ▼               ▼                   ▼
          ┌───────────┐       ┌───────────┐       ┌───────────┐
          │Scheduler  │       │Priority   │       │Deadline   │
          │Agent Trace│       │Agent Trace│       │Risk Trace │
          └───────────┘       └───────────┘       └───────────┘
                                    │
                     Google Gemini 3.5 Flash Model
                          (Structured JSON Schema)
```

---

## 📂 Repository Layout

*   `server.ts` — Central Express server coordinating Vite asset serving, middleware, static routers, and request logging.
*   `/server/` — Core backend infrastructure:
    *   `agents/orchestrator.ts` — The brain of the Chief of Staff; runs the consolidated model pipeline and maps traces.
    *   `agents/geminiClient.ts` — Low-level client wrapper for the `@google/genai` TypeScript SDK with automated retry logic.
    *   `agents/types.ts` — Type definitions for structured outputs and agent handshakes.
    *   `config/env.ts` — Advanced environment configuration validator that checks active variables on boot.
*   `/src/` — Modern React single-page frontend:
    *   `App.tsx` — Main glassmorphic application component managing state, authentication, calendar sync, and toast feedback.
    *   `/components/` — Modular visual elements: `TaskCard.tsx`, `WeeklyCalendar.tsx`, `HumanInsights.tsx`, and `LandingPage.tsx`.
    *   `/lib/firebaseAuth.ts` — Google Authentication wrapper leveraging Firebase SDKs.
*   `tests/` — Unified verification suites to audit database interfaces, routing boundaries, and model outputs.

---

## ⚙️ Quick Start Local Development

### Prerequisites
*   Node.js 18 or newer.
*   A [Google Gemini API Key](https://aistudio.google.com/) to power cognitive loop agents.

### Setup Instructions

1.  **Clone the Repository** and install dependencies:
    ```bash
    npm install
    ```

2.  **Configure Environment Variables**:
    Duplicate the example blueprint to create your local configurations:
    ```bash
    cp .env.example .env
    ```

### 🔐 Environment Variables Reference

Momentum AI is designed to integrate cleanly with your cloud services. Variables are structured by category:

#### 1. Runtime & Backend Server
*   `NODE_ENV`: Set to `development` for local hot reloading, or `production` for container builds.
*   `PORT`: Port to listen on. The platform reverse proxy routes external traffic exclusively to port `3000`.
*   `SESSION_SECRET`: Session signature token used to protect user browser cookies.

#### 2. Google Gemini AI (Required for Co-Pilot Features)
*   `GEMINI_API_KEY`: Server-side secret key from Google AI Studio. **Must never** be prefixed with `VITE_` or exposed to the client.

#### 3. Google Workspace (Required for Calendar & Gmail Sync)
*   `GOOGLE_CLIENT_ID`: OAuth 2.0 client credential.
*   `GOOGLE_CLIENT_SECRET`: Matching secret for secure server-side token exchanges.
*   `GOOGLE_REDIRECT_URI`: OAuth callback handler URI (e.g., `http://localhost:3000/api/integrations/google/oauth2callback`).

#### 4. PostgreSQL Database
*   `DATABASE_URL`: Relational PostgreSQL target URI string for secure multi-session persistence.

#### 5. Firebase Configuration
*   `FIREBASE_PROJECT_ID`: Target Google Firebase project ID.
*   `FIREBASE_API_KEY`: SDK authentication key.
*   `FIREBASE_AUTH_DOMAIN`: Domain origin used to validate auth handshakes.
*   `FIREBASE_STORAGE_BUCKET`: Storage system URL bucket.
*   `FIREBASE_MESSAGING_SENDER_ID`: Message sender ID.
*   `FIREBASE_APP_ID`: App registration identifier.

---

## 🚀 Testing & Build Operations

### Run Automated Tests
Audit model connections, schema handshakes, and API route boundaries:
```bash
npm run test
```

### Compile for Production
Compile the React frontend and bundle the Express server into a standalone optimized package:
```bash
npm run build
```

### Start Production Server
Launch the compiled backend:
```bash
npm run start
```

---

## 🛡️ Resiliency & Graceful Fallbacks

On server boot, the environment validator (`server/config/env.ts`) automatically prints a status log showing configured vs. missing variables:
*   **Safe Execution**: Missing or unconfigured integration variables (like `DATABASE_URL` or `GOOGLE_CLIENT_ID`) **will not** crash the container or local server.
*   **In-Memory Databases**: If database integrations are not connected, the server gracefully initializes an isolated, in-memory mock repository to ensure the application starts immediately.
*   **API Safeguards**: Actions requiring unconfigured endpoints (such as running the co-pilot without a `GEMINI_API_KEY`) will prompt the user with a helpful notification toast, allowing full feature explorations with zero-crash dependability.
