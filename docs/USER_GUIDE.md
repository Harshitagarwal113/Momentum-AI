# Momentum AI — User Guide & Onboarding Manual
### *How to leverage your Autonomous Chief of Staff for peak productivity*

Welcome to **Momentum AI**, an elite, high-performance agentic co-pilot designed to streamline your daily planning, protect your cognitive energy, and coordinate your calendar automatically. This guide provides step-by-step instructions on how to use every screen, integration, and capability of this full-stack application.

---

## 🚀 Quick Setup & Authentication

Before accessing the dashboard, you must establish your workspace profile.

### Step 1: Sign In / Create Account
1. Launch the application inside your browser or development environment.
2. If you are not signed in, you will be presented with a beautiful landing page with the **Momentum AI Single Sign-on Portal**.
3. **Google Sign-In**: Click **"Sign in with Google"** for a seamless single sign-on experience. This securely stores your profile details (name, email, and profile photo) using unified Firebase Authentication.
4. **Email & Password Alternative**: If you prefer, enter an email address and a password in the inputs provided, toggle between **Login** and **Sign Up**, and click the authentication button.

### Step 2: Onboarding Setup
1. On your first successful sign-in, an interactive onboarding screen will guide you through initializing your core profile.
2. Enter your **Preferred Name** (e.g., *Executive Harshit*).
3. Select your local **Timezone** (e.g., *America/Los_Angeles* or *Asia/Kolkata*) to ensure all automated schedule blocks align correctly with your local agenda.
4. Click **"Complete Onboarding"** to load the main glassmorphic operational dashboard.

---

## 💻 Navigating the Core Dashboard Tabs

Momentum AI is organized into six elegant display views accessible via the premium glassmorphic navigation bar at the top of your screen.

---

### 1. 🏠 Home Tab (Executive Overview)
This is your operational command center. It provides a real-time status check on your active workload and focus metrics.
*   **Active Statistics Grid**: Displays your total active **Goals**, **Active Tasks**, **Completed Tasks**, and your current active **Daily Streak** for habit loops.
*   **Daily Schedule Feed**: A vertical timeline illustrating scheduled blocks for today. Completed blocks are marked with checkboxes.
*   **Proactive Focus Alert Bar**: If there are unread system alerts, your AI Chief of Staff prints an alert notice (e.g., *"Your AI Chief of Staff has resolved 3 critical focus alerts today"*).
*   **Habit Tracker**: A list of your positive habits with quick "+1" streak incremental buttons to log consistency on the fly.
*   **Operational Logs**: Live database traces and system handshake messages indicating successful database synchronizations.

---

### 2. 📅 Schedule Tab (Cognitive Calendar Grid)
Visualizes your week through a structured calendar to protect your cognitive energy.
*   **Viewing Your Week**: Look at your weekly schedule to see where your time is being allocated.
*   **Adding a Schedule Slot**:
    1. Click **"Create Schedule"** or fill out the slot form in the panel.
    2. Enter a **Title** (e.g., *Deep Design Systems Review*).
    3. Specify the duration in **Hours**.
    4. Provide a detailed **Description**.
    5. **Cognitive Reserve Toggle**: Check the *High Cognitive Resource Required* toggle if the session demands high mental focus. The AI will label this with a dedicated tech-mono tag and factor it into your mental fatigue model.
    6. Click **"Reserve Slot"** to sync it to the workspace database.

---

### 3. 📋 Tasks Tab (Task Backlog & Priority Matrices)
Manage detailed priorities with direct high, medium, and low urgency scoring.
*   **Adding a Task**:
    1. Enter a **Title** and **Description** in the *New Task* card.
    2. Choose a **Priority Level** (High, Medium, Low).
    3. Select an optional parent **Goal** to link this task to your long-term milestones.
    4. Click **"Add Task"** to persist it instantly.
*   **Modifying Tasks**:
    *   Click any task's checkbox to toggle it as **Complete** (this immediately updates your dashboard analytics).
    *   Click on a task to expand it and read its sub-steps, or click the **Delete** icon to remove it.

---

### 4. 🤖 AI Assistant Tab (Chief of Staff Strategist)
The primary interface for delegating high-stakes planning and objective management to your AI.
*   **Delegating an Objective (Step-by-Step)**:
    1. Click on the **AI Assistant** tab.
    2. Locate the **Chief of Staff Strategist** chat panel.
    3. Type your natural language prompt into the input field at the bottom.
       *   *Example 1*: `"Organize a pitch template review for our Series A funding round by tomorrow morning."`
       *   *Example 2*: `"I have an interview next Wednesday. Plan prep steps and block out time."`
    4. Click **"Send"** (or press Enter).
    5. **Consolidated Cognitive Reasoning**: The AI Chief of Staff starts coordinating. Because it runs on a custom, high-speed unified prompt wrapper, it will respond in a fraction of the time of traditional chain agents.
    6. Read the **Conversational Executive Summary** delivered in the chat message bubble.
    7. Review the **Allocated Milestones Checklist** generated below the message. It breaks your objective down into steps, displays calculated durations, and provides proactive tags.
    8. **Auto-Scheduling**: The agent automatically inserts these recommended steps directly into your local database and suggests optimal scheduling times.

---

### 5. 🧠 Insights Tab (Cognitive Intelligence Center)
Analyzes your execution history, highlights fatigue patterns, and generates summaries.
*   **Productivity Profile Metrics**: Read your AI-generated productivity profile, including your calculated **Average Daily Workload**, **Focus Balance index**, and **Fatigue Level Indicator**.
*   **Long-Term Guidelines (Memory Synchronization)**:
    *   Momentum AI remembers your permanent workflow rules.
    *   Type a new rule in the **Long-Term Guidelines** box (e.g., *"Focus on deep programming tasks in the mornings"* or *"No meetings after 5 PM"*).
    *   Click **"Add"**. The AI will automatically factor this preference into all subsequent planning loops!
*   **Daily Executive Briefing**:
    1. Click the **"Get Daily Briefing"** button under the *Daily Agenda Briefing* panel.
    2. The AI parses your active goals, pending tasks, and meeting schedules to write a unified, professional briefing designed to start your day.
*   **Night Reflection Log**:
    1. At the end of your day, click **"Formulate Night Reflection"**.
    2. The AI evaluates your logged task completions and energy levels to summarize your performance, identify blockers, and optimize your schedule for tomorrow.

---

### 6. ⚙️ Settings Tab (Google Workspace & Profile Config)
Configure third-party accounts and profile details to enable seamless automation.

#### A. Connect Google Workspace Account
To unlock Gmail integrations and auto-scheduling tools, you must link your Google account:
1. In the **Settings** panel, locate **Google Workspace Integrations**.
2. Click **"Connect Google Workspace Account"** to initiate the OAuth flow.
3. Grant permissions for Google Calendar and Gmail when prompted.
4. Once authenticated, your profile photo and email address (e.g., *harshit@gmail.com*) will appear, confirming active synchronization.

#### B. Synchronize Google Calendar Events
1. With your Google account connected, click the **"Sync Google Calendar"** button.
2. Momentum AI instantly contacts the Google Calendar API, fetches your upcoming calendar appointments, and incorporates them directly into your dashboard to prevent scheduling conflicts.

#### C. Send Gmail Briefing Email
1. Want your daily briefing delivered directly to your actual inbox? Click **"Send Daily Briefing via Gmail"**.
2. The server compiles your latest daily executive summary and sends a beautifully styled, high-contrast HTML newsletter secure to your Google account email address.

#### D. Auto-Schedule Focus Slots
1. If your day is crowded with meetings, click **"Auto-Schedule Focus Block"**.
2. The agent analyzes your free blocks on Google Calendar, calculates the best window, and reserves a custom focus slot (e.g., *"Momentum AI deep-work block"*) directly back onto your live Google Calendar.

#### E. Profile Settings & Dev Console
*   **Update Profile**: Change your name, target timezone, or toggle the **Global Dark Mode** switch.
*   **System Tracing & Logs**: Click the **Developer Console** toggle at the bottom of settings to view real-time log handshakes, database sync streams, or browse files directly.

---

## 💡 Best Practices for Maximum Leverage

1.  **Be Explicit with Memory**: If you have specific habits, preferences, or schedules you always follow, log them as a *Long-Term Guideline* in the **Insights** tab. It guarantees that the AI Assistant will always honor those boundaries.
2.  **Toggle Cognitive Reserves**: Always toggle the *High Cognitive Resource Required* switch on intense tasks. This lets the scheduler guard those blocks from meeting interruptions.
3.  **Sync Daily**: Sync your Google Calendar at the start of each morning and generate a **Daily Briefing** to review your optimized day before entering focus.
