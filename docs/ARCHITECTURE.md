# Momentum AI — System Architecture & Database Design

This document details the software architecture, modular class diagrams, multi-agent control loops, and database entity relationships for **Momentum AI**, your Autonomous Chief of Staff.

---

## 🏗️ System Architecture Diagram

Momentum AI operates as an **Agentic Cognitive Loop** running a full-stack, decoupled monorepo architecture. Below is the technical flow of data and execution:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Momentum React UI (Vite)                        │
│   - Glassmorphic Interface                                            │
│   - Custom SVG Contribution Heatmap, Area Curves, & Task Trees        │
│   - Real-time Speech-to-Text Dictation Transcription                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         HTTP & Cookie Credentials
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Express Full-Stack Server                        │
│   - Stateless REST Router                                              │
│   - AsyncLocalStorage Context Middleware (Request Isolation)           │
│   - Lazy-Initialized Google Workspace Integrations                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                    Structured Prompt Handshakes
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Agentic Orchestrator                            │
│   Coordination of specialized sub-agents via standard TypeScript interfaces│
└───────────────────┬───────────────┼───────────────────┬────────────────┘
                    │               │                   │
                    ▼               ▼                   ▼
          ┌───────────┐       ┌───────────┐       ┌───────────┐
          │Context    │       │Memory     │       │Planner    │
          │Agent      │       │Agent      │       │Agent      │
          └───────────┘       └───────────┘       └───────────┘
                    │               │                   │
                    ▼               ▼                   ▼
          ┌───────────┐       ┌───────────┐       ┌───────────┐
          │Scheduler  │       │Priority   │       │Deadline   │
          │Agent      │       │Agent      │       │Risk Agent │
          └───────────┘       └───────────┘       └───────────┘
                                    │
                                    ▼
                              ┌───────────┐
                              │Reflection │
                              │Agent      │
                              └───────────┘
                                    │
                     Google Gemini 3.5 Flash Model
                         (Structured JSON Schemas)
```

### Modular Components:
1. **Request Middleware Isolation**: Uses Node's native `AsyncLocalStorage` to isolate user sessions per transaction. This completely prevents multi-tenant session leakage on serverless environments like Google Cloud Run.
2. **Autonomous Co-pilot Pipeline**:
   - **ContextAgent**: Sifts through historical user logs, settings, and workspace tasks to establish current operational context.
   - **MemoryAgent**: Searches and summarizes user preference parameters (e.g., "Always keep mornings meeting-free").
   - **PlannerAgent**: Deconstructs big goals into logical steps and checklists.
   - **SchedulerAgent**: Reserves empty time blocks and injects 15-minute decompression intervals between meetings.
   - **PriorityAgent**: Continuously scores tasks for Urgency and Impact.
   - **DeadlineRiskAgent**: Predicts schedule drift based on subtask counts, meeting load, and mood indexes.
   - **ReflectionAgent**: Calculates daily mental clear-headedness scores (Clarity Index) and logs cognitive fatigue.

---

## 📊 Database Entity-Relationship (ER) Diagram

The data architecture is designed for full persistence, mapping standard transactional relational structures.

```
       ┌───────────────────┐
       │       users       │
       ├───────────────────┤
       │ id (PK)           │◄──────────────────────────────┐
       │ email             │                               │
       │ full_name         │                               │
       │ timezone          │                               │
       │ is_premium        │                               │
       │ dark_mode         │                               │
       │ created_at        │                               │
       └─────────┬─────────┘                               │
                 │                                         │
        1:N      │                                         │
        ┌────────┴────────┐                                │
        │                 │                                │
        ▼                 ▼                                │
┌───────────────┐ ┌───────────────┐                        │
│     goals     │ │    habits     │                        │
├───────────────┤ ├───────────────┤                        │
│ id (PK)       │ │ id (PK)       │                        │
│ user_id (FK)  │ │ user_id (FK)  │                        │
│ title         │ │ title         │                        │
│ description   │ │ description   │                        │
│ status        │ │ frequency     │                        │
│ target_date   │ │ streak        │                        │
│ created_at    │ │ last_completed│                        │
└───────┬───────┘ └───────────────┘                        │
        │                                                  │
        │ 1:N                                              │
        ▼                                                  │
┌───────────────┐                                          │
│     tasks     │                                          │
├───────────────┤                                          │
│ id (PK)       │                                          │
│ user_id (FK)  │                                          │
│ goal_id (FK)  │                                          │
│ title         │                                          │
│ description   │                                          │
│ deadline      │                                          │
│ priority      │                                          │
│ status        │                                          │
│ risk_score    │                                          │
│ risk_reason   │                                          │
│ pred_deadline │                                          │
│ subtasks (JSON)                                          │
│ dependencies  │                                          │
└───────┬───────┘                                          │
        │                                                  │
        │ 1:N                                              │
        ▼                                                  │
┌───────────────┐      ┌─────────────────┐                 │
│   schedules   │      │daily_reflections│                 │
├───────────────┤      ├─────────────────┤                 │
│ id (PK)       │      │ id (PK)         │◄────────────────┘
│ user_id (FK)  │      │ user_id (FK)    │
│ title         │      │ date            │
│ start_time    │      │ mood_score      │
│ end_time      │      │ insights        │
│ is_cognitive  │      │ blockers        │
│ created_at    │      └─────────────────┘
└───────────────┘
```

### Table Definitions & Constraints:
- **`users`**: Unique email index, stores UI theme preferences and premium flags.
- **`goals`**: Maps strategic initiatives. Cascades deletes to related `tasks`.
- **`tasks`**: Tracks status, custom dependencies arrays, structured subtask checklists, and AI-derived deadline risk estimations.
- **`schedules`**: Blocks specific focus reservations or represents real-time calendar syncing.
- **`habits`**: Tracks routine completion counts and daily streaking lengths.
- **`daily_reflections`**: Stores journal data, mental blocker records, and user clarity ratings.
