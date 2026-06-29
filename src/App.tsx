import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Terminal, 
  Cpu, 
  Database, 
  Shield, 
  ArrowRight, 
  FileCode, 
  Folder, 
  Mic,
  MicOff,
  Volume2,
  ChevronRight, 
  FolderOpen, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Send,
  Code,
  Bot,
  User,
  Settings,
  Flame,
  Calendar,
  Bell,
  Plus,
  Trash2,
  Check,
  Moon,
  Sun,
  Lock,
  LogOut,
  Mail,
  Zap,
  RefreshCw,
  Brain,
  Search,
  CheckSquare,
  Play
} from "lucide-react";

import TaskDependencyGraph from "./components/TaskDependencyGraph";
import DashboardAnalytics from "./components/DashboardAnalytics";
import DailyWeeklyPlan from "./components/DailyWeeklyPlan";
import Onboarding from "./components/Onboarding";
import TaskCard from "./components/TaskCard";
import WeeklyCalendar from "./components/WeeklyCalendar";
import HumanInsights from "./components/HumanInsights";
import LandingPage from "./components/LandingPage";

import { initAuth, googleSignIn, logout as googleLogout, getAccessToken } from "./lib/firebaseAuth";
import { Task, Goal, Habit, Reflection, ScheduleSlot, Notification, AuditLog, Memory } from "./types";

// Monorepo File definitions for the Explorer
const FILE_TREE = [
  {
    name: "backend (FastAPI Engine)",
    type: "folder",
    children: [
      { name: "main.py", path: "backend/main.py" },
      { name: "requirements.txt", path: "backend/requirements.txt" },
      { name: "Dockerfile", path: "backend/Dockerfile" },
      {
        name: "api",
        type: "folder",
        children: [
          { name: "auth.py", path: "backend/api/auth.py" },
          { name: "tasks.py", path: "backend/api/tasks.py" },
          { name: "goals.py", path: "backend/api/goals.py" },
          { name: "habits.py", path: "backend/api/habits.py" },
          { name: "reflections.py", path: "backend/api/reflections.py" },
          { name: "memories.py", path: "backend/api/memories.py" },
          { name: "schedules.py", path: "backend/api/schedules.py" },
          { name: "notifications.py", path: "backend/api/notifications.py" },
          { name: "logs.py", path: "backend/api/logs.py" }
        ]
      },
      {
        name: "agents",
        type: "folder",
        children: [
          { name: "autonomous_cos.py", path: "backend/agents/autonomous_cos.py" }
        ]
      },
      {
        name: "memory",
        type: "folder",
        children: [
          { name: "memory_manager.py", path: "backend/memory/memory_manager.py" }
        ]
      },
      {
        name: "models",
        type: "folder",
        children: [
          { name: "schemas.py", path: "backend/models/schemas.py" }
        ]
      },
      {
        name: "database",
        type: "folder",
        children: [
          { name: "connection.py", path: "backend/database/connection.py" },
          { name: "schema.sql", path: "backend/database/schema.sql" }
        ]
      },
      {
        name: "utils",
        type: "folder",
        children: [
          { name: "logger.py", path: "backend/utils/logger.py" },
          { name: "exceptions.py", path: "backend/utils/exceptions.py" }
        ]
      }
    ]
  },
  {
    name: "frontend (Next.js 15 App Client)",
    type: "folder",
    children: [
      { name: "package.json", path: "frontend/package.json" },
      { name: "next.config.ts", path: "frontend/next.config.ts" },
      { name: "tsconfig.json", path: "frontend/tsconfig.json" },
      { name: "Dockerfile", path: "frontend/Dockerfile" },
      {
        name: "app",
        type: "folder",
        children: [
          { name: "layout.tsx", path: "frontend/app/layout.tsx" },
          { name: "page.tsx", path: "frontend/app/page.tsx" }
        ]
      },
      {
        name: "lib",
        type: "folder",
        children: [
          { name: "supabase.ts", path: "frontend/lib/supabase.ts" }
        ]
      },
      {
        name: "types",
        type: "folder",
        children: [
          { name: "index.ts", path: "frontend/types/index.ts" }
        ]
      }
    ]
  },
  { name: "docker-compose.yml", path: "docker-compose.yml" },
  { name: "README.md", path: "README.md" }
];

export default function App() {
  // Authentication & Profile States
  const [sessionUser, setSessionUser] = useState<any | null>(null);
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAuthForm, setShowAuthForm] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authFullName, setAuthFullName] = useState<string>("");

  // Layout Theme & Tabs (HOME, SCHEDULE, TASKS, ASSISTANT, INSIGHTS, SETTINGS)
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"home" | "schedule" | "tasks" | "assistant" | "insights" | "settings">("home");

  // Local feedback toasts state
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "error" | "info" }>>([]);
  const addNotification = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // State arrays for database lists
  const [goalsList, setGoalsList] = useState<Goal[]>([]);
  const [tasksList, setTasksList] = useState<Task[]>([]);
  const [habitsList, setHabitsList] = useState<Habit[]>([]);
  const [reflectionsList, setReflectionsList] = useState<Reflection[]>([]);
  const [schedulesList, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [notificationsList, setNotificationsList] = useState<Notification[]>([]);
  const [logsList, setLogsList] = useState<AuditLog[]>([]);
  
  // Create / Form States
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDesc, setNewGoalDesc] = useState("");
  
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskGoal, setNewTaskGoal] = useState("");

  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [newHabitDesc, setNewHabitDesc] = useState("");
  const [newHabitFreq, setNewHabitFreq] = useState("daily");

  const [newReflectionScore, setNewReflectionScore] = useState(8);
  const [newReflectionInsights, setNewReflectionInsights] = useState("");
  const [newReflectionBlockers, setNewReflectionBlockers] = useState("");

  const [newScheduleTitle, setNewScheduleTitle] = useState("");
  const [newScheduleHours, setNewScheduleHours] = useState(2);
  const [newScheduleDesc, setNewScheduleDesc] = useState("");
  const [newScheduleCog, setNewScheduleCog] = useState(true);

  // Profile Form States
  const [profileName, setProfileName] = useState("");
  const [profileTimezone, setProfileTimezone] = useState("America/Los_Angeles");

  // Code Explorer states
  const [selectedFile, setSelectedFile] = useState<string>("backend/database/schema.sql");
  const [fileContent, setFileContent] = useState<string>("");
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    "backend (FastAPI Engine)": true,
    "database": true,
    "frontend (Next.js 15 App Client)": false
  });

  // Chief of Staff Chat states (ChatGPT layout)
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatPlan, setChatPlan] = useState<any | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string; plan?: any }>>([
    {
      sender: "ai",
      text: "Hello! I am your AI Chief of Staff. Tell me what's on your mind—like 'I have an interview next week' or 'Organize a board review'—and I'll automatically break it down, estimate times, prioritize, update your schedule, and explain my reasoning."
    }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Autonomous Assistant Co-pilot States
  const [productivityProfile, setProductivityProfile] = useState<any | null>(null);
  const [briefText, setBriefText] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState<string | null>(null);
  const [simulationLoading, setSimulationLoading] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [newMemory, setNewMemory] = useState<string>("");
  const [memoriesList, setMemoriesList] = useState<Memory[]>([]);

  // Google OAuth Integrations State
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [isGoogleSyncing, setIsGoogleSyncing] = useState<boolean>(false);
  const [googleEmailAddress, setGoogleEmailAddress] = useState<string>("");
  const [googleNotificationEnabled, setGoogleNotificationEnabled] = useState<boolean>(false);
  
  // Voice Input / Audio Multimodal states
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceSuccessMessage, setVoiceSuccessMessage] = useState<string | null>(null);

  // Onboarding Walkthrough State
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return localStorage.getItem("momentum_onboarded_v3") !== "true";
  });

  // Developer subview settings
  const [devConsoleOpen, setDevConsoleOpen] = useState<boolean>(false);
  const [activeDevTab, setActiveDevTab] = useState<"logs" | "trace" | "code">("trace");

  // Load active session on boot
  useEffect(() => {
    checkActiveSession();
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleAccessToken(token);
        setGoogleEmailAddress(user.email || "");
      },
      () => {
        setGoogleUser(null);
        setGoogleAccessToken(null);
        setGoogleEmailAddress("");
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch lists whenever user becomes authenticated or changes tabs
  useEffect(() => {
    if (sessionUser) {
      fetchDashboardData();
      fetchProductivityProfile();
      fetchMemories();
    }
  }, [sessionUser, activeTab]);

  useEffect(() => {
    if (activeTab === "settings" && devConsoleOpen && activeDevTab === "code" && selectedFile) {
      fetchFileContent(selectedFile);
    }
  }, [selectedFile, activeTab, devConsoleOpen, activeDevTab]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, chatLoading]);

  const fetchProductivityProfile = async () => {
    try {
      const res = await fetch("/api/agent/productivity-profile");
      const data = await res.json();
      if (data.success) {
        setProductivityProfile(data.profile);
      }
    } catch (e) {
      console.warn("Error fetching productivity profile", e);
    }
  };

  const fetchMemories = async () => {
    try {
      const res = await fetch("/api/memories");
      const data = await res.json();
      if (data.success) {
        setMemoriesList(data.data);
      }
    } catch (e) {
      console.warn("Error fetching memories", e);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.trim()) return;
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMemory })
      });
      if (res.ok) {
        setNewMemory("");
        fetchMemories();
        fetchProductivityProfile();
      }
    } catch (e) {
      console.warn("Add memory fail", e);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await fetch(`/api/memories/${id}`, { method: "DELETE" });
      fetchMemories();
      fetchProductivityProfile();
    } catch (e) {
      console.warn("Delete memory fail", e);
    }
  };

  const handleTriggerSimulation = async (type: "brief" | "reflection" | "reschedule" | "recalculate" | "recovery") => {
    setSimulationLoading(type);
    setSimulationResult(null);
    try {
      let endpoint = "";
      let method = "POST";
      if (type === "brief") {
        endpoint = "/api/agent/daily-brief";
        method = "GET";
      } else if (type === "reflection") {
        endpoint = "/api/agent/night-reflection";
        method = "GET";
      } else if (type === "reschedule") {
        endpoint = "/api/agent/simulate-meeting-change";
      } else if (type === "recalculate") {
        endpoint = "/api/agent/simulate-deadline-shift";
      } else if (type === "recovery") {
        endpoint = "/api/agent/simulate-missed-tasks";
      }

      const res = await fetch(endpoint, { method });
      const data = await res.json();

      if (res.ok) {
        if (type === "brief") {
          setBriefText(data.brief);
          setSimulationResult("Morning daily brief generated successfully!");
        } else if (type === "reflection") {
          setReflectionText(data.reflection);
          setSimulationResult("Night reflection summarized successfully!");
        } else {
          setSimulationResult(data.message);
        }
        fetchDashboardData();
        fetchProductivityProfile();
      } else {
        setSimulationResult("Simulation failed: " + (data.error || "unknown error"));
      }
    } catch (e: any) {
      setSimulationResult("Network error: " + e.message);
    } finally {
      setSimulationLoading(null);
    }
  };

  const renderMarkdown = (txt: string) => {
    return txt.split("\n").map((line, idx) => {
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="text-sm font-bold text-emerald-400 mt-3 mb-1.5">{line.replace("### ", "")}</h3>;
      }
      if (line.startsWith("#### ")) {
        return <h4 key={idx} className="text-xs font-semibold text-neutral-200 mt-2 mb-1">{line.replace("#### ", "")}</h4>;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const formatted = line.replace(/^[-*]\s+/, "");
        return (
          <li key={idx} className="text-xs text-neutral-300 ml-3 list-disc mb-1 leading-relaxed font-sans">
            {parseBold(formatted)}
          </li>
        );
      }
      if (line.match(/^\d+\.\s+/)) {
        const formatted = line.replace(/^\d+\.\s+/, "");
        return (
          <li key={idx} className="text-xs text-neutral-300 ml-3 list-decimal mb-1 leading-relaxed font-sans">
            {parseBold(formatted)}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-1" />;
      }
      return <p key={idx} className="text-xs text-neutral-300 leading-relaxed font-sans mb-1.5">{parseBold(line)}</p>;
    });
  };

  const parseBold = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-emerald-400 font-bold">{part}</strong> : part);
  };

  // Web Speech API STT dictation trigger
  const startVoiceDictation = (onResult: (text: string) => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser does not support native Web Speech API.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      setIsRecordingVoice(true);
      setVoiceError(null);

      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        onResult(transcript);
      };

      recognition.onerror = (e: any) => {
        setVoiceError(e.error);
        setIsRecordingVoice(false);
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      recognition.start();
    } catch (err: any) {
      setVoiceError(err.message);
      setIsRecordingVoice(false);
    }
  };

  // Multimodal Voice strategic recorder using MediaRecorder
  const [isRecordingAudioClip, setIsRecordingAudioClip] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const startAudioClipRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Microphone input is not supported in this browser context.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(",")[1];
          await submitAudioMultimodal(base64Data, "audio/webm");
        };
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecordingAudioClip(true);
      setVoiceError(null);
    } catch (err: any) {
      alert("Microphone permission denied: " + err.message);
    }
  };

  const stopAudioClipRecording = () => {
    if (mediaRecorder && isRecordingAudioClip) {
      mediaRecorder.stop();
      setIsRecordingAudioClip(false);
    }
  };

  const submitAudioMultimodal = async (base64Data: string, mimeType: string) => {
    try {
      setLoadingAction("audio_multimodal");
      const res = await fetch("/api/agent/multimodal-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64: base64Data, mimeType })
      });
      const data = await res.json();
      if (res.ok) {
        setVoiceTranscript(data.text);
        setVoiceSuccessMessage("Gemini Multimodal voice strategy analysis complete!");
        setTimeout(() => setVoiceSuccessMessage(null), 4000);
      } else {
        alert("Gemini analysis failed: " + data.error);
      }
    } catch (err: any) {
      alert("Strategic audio analysis failed: " + err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const checkActiveSession = async () => {
    try {
      const res = await fetch("/api/auth/session", { method: "POST" });
      const data = await res.json();
      if (data.session) {
        setSessionUser(data.session);
        setProfileName(data.session.full_name || "");
        setProfileTimezone(data.session.timezone || "America/Los_Angeles");
        setDarkMode(data.session.dark_mode !== false);
      }
    } catch (e) {
      console.warn("Session check failed", e);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) return;

    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/login-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        let finalUser = data.user;
        
        // If in signup mode and name is specified, update profile
        if (authMode === "signup" && authFullName.trim()) {
          try {
            // Note: Since setSessionUser hasn't run, the backend loggedInUser is already set on the session cookie
            const profileRes = await fetch("/api/profile", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ full_name: authFullName.trim() })
            });
            const profileData = await profileRes.json();
            if (profileRes.ok && profileData.profile) {
              finalUser = profileData.profile;
            }
          } catch (profileErr) {
            console.warn("Failed to update profile name on signup", profileErr);
          }
        }
        
        setSessionUser(finalUser);
        setProfileName(finalUser.full_name || "");
        setProfileTimezone(finalUser.timezone || "America/Los_Angeles");
      } else {
        throw new Error(data.error || "Authentication failed.");
      }
    } catch (err: any) {
      setAuthError(err?.message || "Server authentication timeout.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (!result) {
        throw new Error("Google authentication did not return a valid user.");
      }
      const { user } = result;

      const res = await fetch("/api/auth/login-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email || "harshitagarwal11345@gmail.com",
          name: user.displayName || "Harshit Agarwal",
          avatar: user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setSessionUser(data.user);
        setProfileName(data.user.full_name || "");
        setProfileTimezone(data.user.timezone || "America/Los_Angeles");
      } else {
        throw new Error(data.error || "Google authentication rejected.");
      }
    } catch (err: any) {
      setAuthError(err?.message || "Google single sign-on failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setSessionUser(null);
      setChatPlan(null);
    } catch (e) {
      console.warn("Logout request error", e);
    }
  };

  // Central dashboard data fetching
  const fetchDashboardData = async () => {
    try {
      const [goalsRes, tasksRes, habitsRes, reflectionsRes, schedulesRes, notificationsRes, logsRes] = await Promise.all([
        fetch("/api/goals").then(r => r.json()),
        fetch("/api/tasks").then(r => r.json()),
        fetch("/api/habits").then(r => r.json()),
        fetch("/api/reflections").then(r => r.json()),
        fetch("/api/schedules").then(r => r.json()),
        fetch("/api/notifications").then(r => r.json()),
        fetch("/api/logs").then(r => r.json())
      ]);

      if (goalsRes.success) setGoalsList(goalsRes.data);
      if (tasksRes.success) setTasksList(tasksRes.data);
      if (habitsRes.success) setHabitsList(habitsRes.data);
      if (reflectionsRes.success) setReflectionsList(reflectionsRes.data);
      if (schedulesRes.success) setScheduleSlots(schedulesRes.data);
      if (notificationsRes.success) setNotificationsList(notificationsRes.data);
      if (logsRes.success) setLogsList(logsRes.data);
    } catch (e) {
      console.error("Failed to query dashboard database fields", e);
    }
  };

  // Retrieve code file contents
  const fetchFileContent = async (filePath: string) => {
    setLoadingFile(true);
    try {
      const res = await fetch("/api/monorepo/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath })
      });
      const data = await res.json();
      if (data.success) {
        setFileContent(data.content);
      } else {
        setFileContent("Error loading monorepo file source contents.");
      }
    } catch (e) {
      setFileContent("Fatal file explorer network timeout.");
    } finally {
      setLoadingFile(false);
    }
  };

  // Proactive Agent formulation call
  const handleDelegateSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userPrompt.trim()) return;

    const userMsg = userPrompt;
    setChatHistory(prev => [...prev, { sender: "user", text: userMsg }]);
    setUserPrompt("");
    setChatLoading(true);
    setChatError(null);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg })
      });
      if (!res.ok) throw new Error("Chief of staff execution module timeout.");
      const data = await res.json();
      
      setChatHistory(prev => [...prev, { 
        sender: "ai", 
        text: data.plan.summary || "Action items extracted and optimized successfully.", 
        plan: data 
      }]);
      setChatPlan(data);
      fetchDashboardData(); // Refresh list immediately
    } catch (err: any) {
      setChatError(err?.message || "Agent cognitive mapping timeout.");
      setChatHistory(prev => [...prev, { 
        sender: "ai", 
        text: "Apologies, I encountered an error coordinating with the core model. Let's try again." 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // CRUD: CREATE GOAL
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    setLoadingAction("goal");
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newGoalTitle, description: newGoalDesc })
      });
      if (res.ok) {
        setNewGoalTitle("");
        setNewGoalDesc("");
        fetchDashboardData();
      }
    } finally {
      setLoadingAction(null);
    }
  };

  // CRUD: CREATE TASK
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setLoadingAction("task");
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: newTaskTitle, 
          description: newTaskDesc, 
          priority: newTaskPriority,
          goal_id: newTaskGoal || null
        })
      });
      if (res.ok) {
        setNewTaskTitle("");
        setNewTaskDesc("");
        setNewTaskGoal("");
        fetchDashboardData();
      }
    } finally {
      setLoadingAction(null);
    }
  };

  // CRUD: DELETE TASK
  const handleDeleteTask = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      fetchDashboardData();
    } catch (e) {
      console.warn("Task delete fail", e);
    }
  };

  // CRUD: TOGGLE TASK STATUS (START / COMPLETE)
  const handleToggleTaskStatus = async (id: string, currentStatus: string) => {
    let nextStatus = "completed";
    if (currentStatus === "completed") {
      nextStatus = "pending";
    } else if (currentStatus === "in_progress") {
      nextStatus = "completed";
    } else if (currentStatus === "pending") {
      nextStatus = "in_progress";
    }

    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      fetchDashboardData();
    } catch (e) {
      console.warn("Task status toggle fail", e);
    }
  };

  // CRUD: UPDATE TASK DEADLINE (RESCHEDULE)
  const handleUpdateTaskDeadline = async (id: string, newDeadline: string) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deadline: newDeadline })
      });
      fetchDashboardData();
    } catch (e) {
      console.warn("Task deadline update fail", e);
    }
  };

  // CRUD: CREATE HABIT
  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    setLoadingAction("habit");
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newHabitTitle, description: newHabitDesc, frequency: newHabitFreq })
      });
      if (res.ok) {
        setNewHabitTitle("");
        setNewHabitDesc("");
        fetchDashboardData();
      }
    } finally {
      setLoadingAction(null);
    }
  };

  // CRUD: COMPLETE HABIT (INCREMENT STREAK)
  const handleCompleteHabit = async (id: string) => {
    try {
      await fetch(`/api/habits/${id}/complete`, { method: "POST" });
      fetchDashboardData();
    } catch (e) {
      console.warn("Habit progress complete fail", e);
    }
  };

  // CRUD: CREATE DAILY REFLECTION
  const handleCreateReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReflectionInsights.trim()) return;

    setLoadingAction("reflection");
    try {
      const res = await fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood_score: newReflectionScore,
          insights: newReflectionInsights,
          blockers: newReflectionBlockers
        })
      });
      if (res.ok) {
        setNewReflectionInsights("");
        setNewReflectionBlockers("");
        fetchDashboardData();
      }
    } finally {
      setLoadingAction(null);
    }
  };

  // CRUD: CREATE SCHEDULE Focus BLOCK
  const handleCreateSchedule = async (title: string, startTime: string, endTime: string) => {
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          start_time: startTime,
          end_time: endTime,
          description: "Manually allocated Focus Block.",
          is_cognitive_reservation: true
        })
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (e) {
      console.warn("Create schedule fail", e);
    }
  };

  // CRUD: DELETE SCHEDULE SLOT
  const handleDeleteSchedule = async (id: string) => {
    try {
      await fetch(`/api/schedules/${id}`, { method: "DELETE" });
      fetchDashboardData();
    } catch (e) {
      console.warn("Schedule delete fail", e);
    }
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasksList.find(t => t.id === taskId);
    if (!task) return;
    const updatedSubtasks = (task.subtasks || []).map((st: any) => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtasks: updatedSubtasks })
      });
      fetchDashboardData();
    } catch (e) {
      console.warn("Subtask toggle error", e);
    }
  };

  const handleDecomposeTask = async (taskId: string) => {
    setLoadingAction(`decompose_${taskId}`);
    try {
      const res = await fetch(`/api/tasks/${taskId}/breakdown`, { method: "POST" });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (e) {
      console.warn("Task breakdown failed", e);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleOptimizeSchedule = async () => {
    setLoadingAction("optimize_schedule");
    try {
      const res = await fetch("/api/schedules/optimize", { method: "POST" });
      if (res.ok) {
        fetchDashboardData();
        setActiveTab("schedule");
      }
    } catch (e) {
      console.warn("Schedule optimization failed", e);
    } finally {
      setLoadingAction(null);
    }
  };

  const [naturalPrompt, setNaturalPrompt] = useState("");
  const [naturalLoading, setNaturalLoading] = useState(false);
  const [showNaturalOverlay, setShowNaturalOverlay] = useState(false);

  const handleNaturalTaskCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalPrompt.trim()) return;
    setNaturalLoading(true);
    try {
      const res = await fetch("/api/tasks/natural", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: naturalPrompt })
      });
      if (res.ok) {
        setNaturalPrompt("");
        setShowNaturalOverlay(false);
        fetchDashboardData();
      }
    } catch (e) {
      console.warn("Natural task creation failed", e);
    } finally {
      setNaturalLoading(false);
    }
  };

  // CRUD: UPDATE SETTINGS
  const handleSaveProfileSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction("settings");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: profileName,
          timezone: profileTimezone,
          dark_mode: darkMode
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSessionUser(data.profile);
        fetchDashboardData();
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSeedDemoDataset = async () => {
    setLoadingAction("seed_demo");
    try {
      const res = await fetch("/api/auth/seed-demo", { method: "POST" });
      if (res.ok) {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error("Could not seed mock sandbox dataset", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const toggleFolder = (folderName: string) => {
    setOpenFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  // Pre-configured suggestions for the ChatGPT interface
  const quickPrompts = [
    { title: "Upcoming Interview", text: "I have a technical interview next Tuesday at 2 PM. Help me prioritize prep." },
    { title: "Product Launch", text: "Deconstruct the roadmap for launching our website, estimate timeline blocks." },
    { title: "Burnout Recovery", text: "Recalculate tasks and suggest schedule changes to give me breathing room." }
  ];

  const toggleBrowserNotifications = () => {
    setGoogleNotificationEnabled(!googleNotificationEnabled);
  };

  const handleLinkGoogleAccount = () => {
    googleSignIn();
  };

  const handleUnlinkGoogleAccount = () => {
    googleLogout();
  };

  const syncGoogleCalendar = async () => {
    if (!googleAccessToken) {
      addNotification("Please connect your Google Workspace account first.", "error");
      return;
    }
    setIsGoogleSyncing(true);
    try {
      const res = await fetch("/api/integrations/google/calendar/sync", {
        headers: {
          "Authorization": `Bearer ${googleAccessToken}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addNotification(`Successfully synchronized ${data.data.length} Google Calendar events.`, "success");
        fetchDashboardData();
      } else {
        throw new Error(data.error || "Failed syncing Google Calendar");
      }
    } catch (err: any) {
      addNotification(err?.message || "Google Calendar sync failed.", "error");
    } finally {
      setIsGoogleSyncing(false);
    }
  };

  const sendGmailBriefingReminder = async () => {
    if (!googleAccessToken) {
      addNotification("Please connect your Google Workspace account first.", "error");
      return;
    }
    setLoadingAction("google_gmail_send");
    try {
      // Get the daily brief text
      const briefRes = await fetch("/api/agent/daily-brief");
      const briefData = await briefRes.json();
      const briefContent = briefData.brief || "Your daily executive briefing is ready. Let's execute successfully today!";

      const res = await fetch("/api/integrations/google/gmail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${googleAccessToken}`
        },
        body: JSON.stringify({
          to: googleEmailAddress || sessionUser?.email || "me",
          subject: "Momentum AI - Daily Executive Briefing",
          body: `
            <h2>Your Autonomous Chief of Staff Briefing</h2>
            <p>Hello ${profileName || "Executive"},</p>
            <div style="padding: 15px; border-left: 4px solid #10b981; background-color: #f3f4f6; font-family: sans-serif; white-space: pre-wrap;">
              ${briefContent}
            </div>
            <p style="margin-top: 20px; font-size: 11px; color: #6b7280;">Sent securely via Momentum AI Google Workspace Integration</p>
          `
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addNotification("Daily briefing email sent successfully via Gmail!", "success");
      } else {
        throw new Error(data.error || "Failed sending email via Gmail");
      }
    } catch (err: any) {
      addNotification(err?.message || "Gmail send failed.", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const autoScheduleFocusSlot = async () => {
    if (!googleAccessToken) {
      addNotification("Please connect your Google Workspace account first.", "error");
      return;
    }
    setLoadingAction("google_auto_schedule");
    try {
      const res = await fetch("/api/integrations/google/calendar/auto-schedule", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${googleAccessToken}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addNotification(`AI successfully scheduled your focus block: "${data.data.title}" on your Google Calendar!`, "success");
        fetchDashboardData();
      } else {
        throw new Error(data.error || "Failed auto-scheduling focus block");
      }
    } catch (err: any) {
      addNotification(err?.message || "Google Auto-Schedule failed.", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  // Code index helper
  const renderTree = (nodes: any[]) => {
    return nodes.map((node, idx) => {
      if (node.type === "folder") {
        const isOpen = !!openFolders[node.name];
        return (
          <div key={idx} className="pl-2">
            <button
              onClick={() => toggleFolder(node.name)}
              className="flex items-center gap-2 py-1.5 px-2 text-xs text-neutral-300 hover:text-white w-full text-left rounded-md hover:bg-neutral-900 transition-all duration-150 font-sans"
            >
              {isOpen ? <FolderOpen className="w-4 h-4 text-emerald-400" /> : <Folder className="w-4 h-4 text-emerald-500" />}
              <span className="font-medium text-neutral-200">{node.name}</span>
              <ChevronRight className={`w-3.5 h-3.5 text-neutral-500 ml-auto transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
            </button>
            {isOpen && node.children && (
              <div className="border-l border-neutral-800/80 ml-3.5 pl-2 mt-0.5 space-y-0.5">
                {renderTree(node.children)}
              </div>
            )}
          </div>
        );
      } else {
        const isSelected = selectedFile === node.path;
        return (
          <button
            key={idx}
            onClick={() => setSelectedFile(node.path)}
            className={`flex items-center gap-2 py-1 px-2.5 text-xs w-full text-left rounded-md transition-all duration-150 font-sans ${
              isSelected 
                ? "bg-emerald-950/40 text-emerald-300 border border-emerald-900/50 font-medium" 
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
            }`}
          >
            <FileCode className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-400" : "text-neutral-500"}`} />
            <span>{node.name}</span>
          </button>
        );
      }
    });
  };

  // ==========================================
  // VIEW: LANDING & AUTHENTICATION PORTALS
  // ==========================================
  if (!sessionUser) {
    if (!showAuthForm) {
      return (
        <LandingPage 
          onGetStarted={() => {
            setShowAuthForm(true);
            setAuthMode("signup");
            setAuthError(null);
          }}
          onLogIn={() => {
            setShowAuthForm(true);
            setAuthMode("login");
            setAuthError(null);
          }}
          darkMode={darkMode}
        />
      );
    }

    return (
      <div className={`min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden transition-colors duration-300 ${darkMode ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"}`}>
        
        {/* Decorative Floating background gradient circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse animate-pulse-glow" />

        {/* Outer Back Navigation Link */}
        <button 
          onClick={() => setShowAuthForm(false)}
          className="absolute top-6 left-6 flex items-center gap-2 text-xs font-mono font-bold text-neutral-400 hover:text-emerald-400 transition-colors py-2 px-3 rounded-xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur"
        >
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          <span>Back to product tour</span>
        </button>

        <div className={`w-full max-w-md p-8 rounded-3xl border transition-all duration-300 shadow-2xl relative ${darkMode ? "bg-neutral-900/60 border-neutral-800/80" : "bg-white border-neutral-200"}`}>
          
          {/* Logo Brand Header */}
          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950/20">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className={`text-2.2xl font-black tracking-tight ${darkMode ? "text-white" : "text-neutral-900"} font-display`}>Momentum AI</h2>
              <p className={`text-[10px] font-mono tracking-widest uppercase mt-1 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                {authMode === "login" ? "Operational Authorization Portal" : "Secure Node Provisioning"}
              </p>
            </div>
          </div>

          {/* Sliding Login/Signup Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-neutral-950 rounded-xl border border-neutral-900 mb-6">
            <button 
              onClick={() => {
                setAuthMode("login");
                setAuthError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === "login" 
                  ? "bg-emerald-600 text-white shadow" 
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Sign In
            </button>
            <button 
              onClick={() => {
                setAuthMode("signup");
                setAuthError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === "signup" 
                  ? "bg-emerald-600 text-white shadow" 
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Create Account
            </button>
          </div>

          {authError && (
            <div className="mb-5 p-3.5 bg-red-950/20 border border-red-900/40 rounded-xl flex items-start gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            
            {authMode === "signup" && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 font-mono">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    placeholder="Ada Lovelace"
                    className={`w-full text-xs rounded-xl pl-10 pr-4 py-3 outline-none border transition-all ${
                      darkMode 
                        ? "bg-neutral-950 border-neutral-800 text-neutral-200 focus:border-emerald-500" 
                        : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-emerald-600"
                    }`}
                  />
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 font-mono">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@company.com"
                  className={`w-full text-xs rounded-xl pl-10 pr-4 py-3 outline-none border transition-all ${
                    darkMode 
                      ? "bg-neutral-950 border-neutral-800 text-neutral-200 focus:border-emerald-500" 
                      : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-emerald-600"
                  }`}
                />
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                  Password
                </label>
                {authMode === "login" && (
                  <span className="text-[9px] text-neutral-500 hover:underline cursor-not-allowed font-mono">Forgot?</span>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full text-xs rounded-xl pl-10 pr-4 py-3 outline-none border transition-all ${
                    darkMode 
                      ? "bg-neutral-950 border-neutral-800 text-neutral-200 focus:border-emerald-500" 
                      : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-emerald-600"
                  }`}
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {authMode === "signup" && (
              <div className="flex items-start gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="trial" 
                  defaultChecked 
                  className="mt-1 accent-emerald-500 rounded" 
                />
                <label htmlFor="trial" className="text-[10px] text-neutral-400 leading-tight">
                  I want to opt-in for an automated trial of the Executive Premium CoS tier, enabling autonomous task decomposition & sync tools.
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              <span>{authMode === "login" ? "Authorize with Email" : "Create My Account"}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
            <span className="h-px bg-neutral-800 flex-1" />
            <span className="px-3">OR SECURE SINGLE SIGN-ON</span>
            <span className="h-px bg-neutral-800 flex-1" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={authLoading}
            className={`w-full py-3 border rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
              darkMode 
                ? "bg-neutral-950 border-neutral-800 hover:bg-neutral-900 text-neutral-300" 
                : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-700"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Continue with Google Account</span>
          </button>

          <div className="mt-6 pt-4 border-t border-neutral-800/40 text-center flex items-center justify-center gap-1.5 text-[9px] text-neutral-500 font-mono">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-bit OAuth Token Handshake Enforced</span>
          </div>
        </div>
      </div>
    );
  }

  // Handle onboarding completion
  const handleOnboardingComplete = (goals: string[]) => {
    setShowOnboarding(false);
    localStorage.setItem("momentum_onboarded_v3", "true");
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${darkMode ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"}`}>
      
      {/* 3-Step Premium Onboarding Wizard */}
      {showOnboarding && (
        <Onboarding
          onComplete={handleOnboardingComplete}
          onLinkGoogle={handleLinkGoogleAccount}
          isGoogleConnected={!!googleAccessToken}
        />
      )}

      {/* Main Header / Navigation */}
      <header className={`border-b sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 backdrop-blur-md ${darkMode ? "border-neutral-900/80 bg-neutral-950/80" : "border-neutral-200 bg-white/80"}`}>
        
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight flex items-center gap-2 font-display">
              Momentum AI
              {sessionUser.is_premium && (
                <span className="text-[8px] uppercase tracking-wider bg-amber-950/30 text-amber-400 border border-amber-900/40 px-1.5 py-0.5 rounded-full font-bold font-mono">
                  Premium CoS
                </span>
              )}
            </h1>
            <p className="text-[9px] text-neutral-500 font-mono uppercase">Operational Dashboard Loop</p>
          </div>
        </div>

        {/* Global Tab Controls (Home, Schedule, Tasks, AI Assistant, Insights, Settings) */}
        <nav className={`flex items-center p-1 rounded-xl border ${darkMode ? "bg-neutral-900/80 border-neutral-800/80" : "bg-neutral-200 border-neutral-300"}`}>
          {[
            { id: "home", label: "Home", icon: Bot },
            { id: "schedule", label: "Schedule", icon: Calendar },
            { id: "tasks", label: "Tasks", icon: CheckSquare },
            { id: "assistant", label: "AI Assistant", icon: Sparkles },
            { id: "insights", label: "Insights", icon: Brain },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1.5 ${
                  isSel 
                    ? "bg-emerald-600 text-white font-bold shadow shadow-emerald-950/40 animate-fade-in" 
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Identity pill */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold font-display">{sessionUser.full_name || "User"}</p>
            <p className="text-[9px] text-neutral-500 font-mono truncate max-w-[120px]">{sessionUser.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            title="Log Out Session"
            className={`p-2 rounded-lg border transition-all ${
              darkMode ? "bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-neutral-400" : "bg-neutral-100 border-neutral-200 hover:bg-neutral-200 text-neutral-600"
            }`}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* ==========================================
            TAB: HOME (Primary Focus & Quick Actions)
            ========================================== */}
        {activeTab === "home" && (
          <div className="space-y-6 animate-fade-in">
            {/* Greeting & Timezone banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-900/40 p-6 rounded-2xl border border-neutral-800/80">
              <div className="space-y-1">
                <h2 className="text-xl font-bold font-display text-neutral-100">
                  Welcome back, {profileName || sessionUser.full_name || "User"}
                </h2>
                <p className="text-xs text-neutral-400">
                  {notificationsList.filter(n => !n.is_read).length > 0 
                    ? `Your AI Chief of Staff has resolved ${notificationsList.filter(n => !n.is_read).length} critical focus alerts today.`
                    : "No system interruptions resolved today. Keep up the high focus!"}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-950 px-3.5 py-1.5 rounded-xl border border-neutral-900">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zone: {profileTimezone}</span>
              </div>
            </div>

            {/* Glowing Ask AI Searchbar */}
            <div className="p-1 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border border-emerald-900/40 shadow-lg">
              <button 
                onClick={() => setActiveTab("assistant")}
                className="w-full flex items-center justify-between bg-neutral-950 hover:bg-neutral-900/60 transition-all p-4 rounded-xl text-left text-neutral-400 group"
              >
                <div className="flex items-center gap-3">
                  <Search className="w-4.5 h-4.5 text-emerald-400 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-sans">Ask AI anything to automatically break down goals, estimate times, and schedule blocks...</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-500 uppercase">
                  <span>Enter</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </button>
            </div>

            {/* Main grid widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left widgets */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Progress Card */}
                <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-neutral-400">Today's Progress</h3>
                  
                  {(() => {
                    const total = tasksList.length;
                    const completed = tasksList.filter(t => t.status === "completed").length;
                    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                    
                    return (
                      <div className="space-y-4">
                        <div className="flex items-baseline justify-between">
                          <span className="text-3xl font-extrabold font-display text-neutral-100">{pct}%</span>
                          <span className="text-xs font-mono text-neutral-500">{completed} of {total} completed</span>
                        </div>
                        
                        <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Primary focus task & Next Task */}
                <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-neutral-400">Next Action Item</h3>
                  
                  {(() => {
                    // Try to find first pending task
                    const nextTask = tasksList.find(t => t.status !== "completed");
                    if (!nextTask) {
                      return (
                        <p className="text-xs text-neutral-500 italic">No pending tasks. Formulate a goal or ask AI for recommendations!</p>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Primary focus</span>
                          <h4 className="text-sm font-bold text-neutral-100 line-clamp-1">{nextTask.title}</h4>
                          <p className="text-xs text-neutral-400 line-clamp-2">{nextTask.description || "No description provided."}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleTaskStatus(nextTask.id, nextTask.status)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/20"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Complete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Earliest deadline */}
                <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Upcoming Deadline</span>
                    {(() => {
                      const withDeadlines = tasksList.filter(t => t.deadline && t.status !== "completed");
                      if (withDeadlines.length === 0) {
                        return <span className="text-xs text-neutral-500 italic font-sans block">No imminent deadlines</span>;
                      }
                      
                      // Sort by closest deadline
                      const sorted = [...withDeadlines].sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
                      const closest = sorted[0];
                      return (
                        <span className="text-xs font-bold text-neutral-200 block truncate max-w-[180px]">
                          {closest.title} ({new Date(closest.deadline!).toLocaleDateString()})
                        </span>
                      );
                    })()}
                  </div>
                  <Calendar className="w-5 h-5 text-neutral-500 shrink-0" />
                </div>

              </div>

              {/* Right widgets: AI Daily Brief */}
              <div className="lg:col-span-8">
                <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-6 h-full flex flex-col justify-between space-y-4 relative overflow-hidden">
                  <div className="absolute -right-24 -top-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-800/60">
                      <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-neutral-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                        AI Daily Executive Briefing
                      </h3>
                      <button
                        onClick={() => handleTriggerSimulation("brief")}
                        disabled={simulationLoading === "brief"}
                        className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 hover:underline disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${simulationLoading === "brief" ? "animate-spin" : ""}`} />
                        <span>Regenerate</span>
                      </button>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto pr-1 leading-relaxed text-xs">
                      {briefText ? (
                        <div className="space-y-3 font-sans">
                          {renderMarkdown(briefText)}
                        </div>
                      ) : (
                        <div className="text-center py-12 space-y-3">
                          <Bot className="w-8 h-8 text-neutral-600 mx-auto" />
                          <p className="text-neutral-500 font-sans max-w-md mx-auto">
                            No morning briefing synthesized. Let our core intelligence model summarize your daily reservations, risk factors, and timeline schedules.
                          </p>
                          <button
                            onClick={() => handleTriggerSimulation("brief")}
                            disabled={simulationLoading === "brief"}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5"
                          >
                            {simulationLoading === "brief" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            <span>Synthesize Morning Briefing</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {briefText && (
                    <div className="p-3 bg-neutral-950/40 border border-neutral-800/40 rounded-xl flex items-center justify-between text-[10px] font-mono text-neutral-400">
                      <span>Status: Continuously synchronized</span>
                      <span className="text-emerald-400">Chief of Staff Engine active</span>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB: SCHEDULE (Weekly Timeline blocks)
            ========================================== */}
        {activeTab === "schedule" && (
          <div className="animate-fade-in space-y-6">
            <WeeklyCalendar
              schedulesList={schedulesList}
              tasksList={tasksList}
              onOptimize={handleOptimizeSchedule}
              onDeleteSlot={handleDeleteSchedule}
              onCreateSlot={handleCreateSchedule}
              isOptimizing={loadingAction === "optimize_schedule"}
            />
          </div>
        )}

        {/* ==========================================
            TAB: TASKS (Simple interactive task lists)
            ========================================== */}
        {activeTab === "tasks" && (
          <div className="animate-fade-in space-y-6">
            {/* Top Graph panel */}
            <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-neutral-400 mb-4">Milestone Dependencies Map</h3>
              <TaskDependencyGraph 
                tasksList={tasksList}
                onSelectTask={(task) => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                activeTaskId={expandedTaskId}
              />
            </div>

            {/* Filter control bar & Natural input toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold font-display text-neutral-100">Interactive Tasks & Habits</h3>
                <p className="text-xs text-neutral-400 font-sans">
                  Easily record completions, start active slots, or reschedule upcoming deadlines.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowNaturalOverlay(!showNaturalOverlay)}
                  className="flex-1 sm:flex-none px-3.5 py-1.5 bg-neutral-950 border border-neutral-800 hover:border-emerald-800 text-neutral-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AI Parser</span>
                </button>
              </div>
            </div>

            {/* Natural language input dropdown */}
            {showNaturalOverlay && (
              <form onSubmit={handleNaturalTaskCreate} className="p-5 bg-neutral-900 border border-emerald-900/30 rounded-2xl space-y-3 animate-fade-in">
                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Natural Task Parser
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={naturalPrompt}
                    onChange={(e) => setNaturalPrompt(e.target.value)}
                    placeholder="e.g. Build slides templates by tomorrow noon with high priority"
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-200 outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={naturalLoading}
                    className="px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                  >
                    {naturalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>Parse</span>
                  </button>
                </div>
              </form>
            )}

            {/* Manual Task Add & Tasks grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Add form */}
              <div className="lg:col-span-4 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-6 space-y-5 h-fit">
                <div className="border-b border-neutral-800/60 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-neutral-300">Create Task Manual</h4>
                </div>

                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Task description..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Context Notes</label>
                    <textarea
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      placeholder="Optional details..."
                      rows={2}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Priority</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 outline-none focus:border-emerald-500"
                    >
                      <option value="high">High priority</option>
                      <option value="medium">Medium priority</option>
                      <option value="low">Low priority</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingAction === "task"}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Milestone</span>
                  </button>
                </form>

                {/* Habits tracking Section inside Tactical left block */}
                <div className="pt-4 border-t border-neutral-800/60 space-y-4">
                  <span className="block text-xs font-bold uppercase tracking-wider font-mono text-neutral-300">Habits / Routines</span>
                  
                  <form onSubmit={handleCreateHabit} className="space-y-2">
                    <input
                      type="text"
                      required
                      value={newHabitTitle}
                      onChange={(e) => setNewHabitTitle(e.target.value)}
                      placeholder="Add focus habit..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={loadingAction === "habit"}
                      className="w-full py-1.5 bg-neutral-950 border border-neutral-800 hover:border-emerald-800 text-neutral-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log Routine</span>
                    </button>
                  </form>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {habitsList.map((h) => (
                      <div key={h.id} className="p-2.5 bg-neutral-950/40 border border-neutral-900 rounded-xl flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-neutral-200 truncate">{h.title}</h5>
                          <span className="text-[9px] font-mono text-orange-400 flex items-center gap-0.5 mt-0.5">
                            <Flame className="w-3 h-3" />
                            {h.streak}d streak
                          </span>
                        </div>
                        <button
                          onClick={() => handleCompleteHabit(h.id)}
                          className="p-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-900/40 rounded-lg transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Tasks cards list */}
              <div className="lg:col-span-8 space-y-4 max-h-[680px] overflow-y-auto pr-1">
                {tasksList.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-neutral-800 rounded-2xl space-y-2">
                    <Terminal className="w-8 h-8 text-neutral-600 mx-auto" />
                    <p className="text-xs text-neutral-500">No active milestones allocated. Ask AI to draft an execution structure!</p>
                  </div>
                ) : (
                  tasksList.map((task) => (
                    <div key={task.id}>
                      <TaskCard
                        task={task}
                        onUpdateStatus={handleToggleTaskStatus}
                        onDelete={handleDeleteTask}
                        onUpdateDeadline={handleUpdateTaskDeadline}
                      />
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB: AI ASSISTANT (Premium ChatGPT layout)
            ========================================== */}
        {activeTab === "assistant" && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-6 h-[72vh]">
            
            {/* Conversation Flow window (Left) */}
            <div className="lg:col-span-8 flex flex-col bg-neutral-900/40 border border-neutral-800/80 rounded-2xl overflow-hidden h-full">
              
              <div className="p-4 border-b border-neutral-800/60 bg-neutral-950/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4.5 h-4.5 text-emerald-400" />
                  <span className="text-xs font-bold text-neutral-200 font-display">Chief of Staff Strategist</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-neutral-400 uppercase bg-neutral-950 px-2.5 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Real-time plan formulation</span>
                </div>
              </div>

              {/* Messages timeline flow */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.map((chat, idx) => (
                  <div key={idx} className={`flex gap-3 max-w-[85%] ${chat.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${chat.sender === "user" ? "bg-emerald-600" : "bg-neutral-800 border border-neutral-700"}`}>
                      {chat.sender === "user" ? <User className="w-4.5 h-4.5 text-white" /> : <Bot className="w-4.5 h-4.5 text-emerald-400" />}
                    </div>

                    <div className={`p-4 rounded-2xl text-xs leading-relaxed space-y-3 ${
                      chat.sender === "user" 
                        ? "bg-emerald-600/10 text-emerald-100 border border-emerald-500/10" 
                        : "bg-neutral-950/40 text-neutral-300 border border-neutral-900"
                    }`}>
                      <p className="whitespace-pre-wrap font-sans">{chat.text}</p>
                      
                      {/* Interactive cards embedded in conversation */}
                      {chat.plan && chat.plan.plan && (
                        <div className="space-y-3.5 mt-4 pt-4 border-t border-neutral-800/60">
                          
                          {/* Generated Action Items */}
                          {chat.plan.plan.action_items && chat.plan.plan.action_items.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold block">Allocated Milestones:</span>
                              <div className="grid grid-cols-1 gap-2">
                                {chat.plan.plan.action_items.map((item: any, i: number) => (
                                  <div key={i} className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl space-y-1.5">
                                    <div className="flex items-start justify-between gap-2">
                                      <h5 className="text-xs font-bold text-neutral-200">{item.title}</h5>
                                      <span className="text-[8px] font-mono uppercase bg-emerald-950/40 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-900/40">
                                        {item.priority || "medium"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[9px] text-neutral-500 font-mono">
                                      <span>Duration: {item.duration_minutes || 30}m</span>
                                      {item.deadline && <span>Deadline: {new Date(item.deadline).toLocaleDateString()}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Proactive Reminders */}
                          {chat.plan.plan.proactive_reminders && chat.plan.plan.proactive_reminders.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold block">Agent observations:</span>
                              <ul className="space-y-1">
                                {chat.plan.plan.proactive_reminders.map((rem: string, i: number) => (
                                  <li key={i} className="text-[11px] text-neutral-400 flex items-start gap-1.5">
                                    <span className="text-emerald-400 font-bold shrink-0">•</span>
                                    <span className="font-sans">{rem}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                    <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-neutral-800 border border-neutral-700 animate-pulse">
                      <Bot className="w-4.5 h-4.5 text-emerald-400" />
                    </div>
                    <div className="p-4 rounded-2xl bg-neutral-950/40 border border-neutral-900 text-neutral-500 text-xs flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      <span className="font-mono">Coordinating milestones, updating schedules...</span>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input and Quick Prompts block */}
              <div className="p-4 border-t border-neutral-800/60 bg-neutral-950/20 space-y-4">
                
                {/* Suggestion pills */}
                {chatHistory.length === 1 && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500 font-bold block">Suggested starters</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {quickPrompts.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setUserPrompt(p.text);
                          }}
                          className="p-3 bg-neutral-950/60 hover:bg-neutral-950 hover:border-emerald-900/40 border border-neutral-900 rounded-xl text-left transition-all space-y-1 group"
                        >
                          <span className="text-[10px] font-bold text-neutral-300 font-display group-hover:text-emerald-400">{p.title}</span>
                          <span className="block text-[10px] text-neutral-500 leading-normal line-clamp-1">{p.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main input form */}
                <form onSubmit={handleDelegateSubmit} className="flex gap-2 relative">
                  <input
                    type="text"
                    required
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Type anything..."
                    className="flex-1 bg-neutral-950 border border-neutral-800 focus:border-emerald-500 outline-none rounded-xl px-4 py-3 text-xs text-neutral-200"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading}
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>

            </div>

            {/* AI Strategic memory rules sidebar (Right) */}
            <div className="lg:col-span-4 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-5 h-full">
              <div className="space-y-4 min-h-0 flex flex-col">
                <div className="border-b border-neutral-800/60 pb-3 flex items-center gap-1.5 shrink-0">
                  <Brain className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono text-neutral-300">Long-Term Guidelines</span>
                </div>

                <form onSubmit={handleAddMemory} className="flex gap-2 shrink-0">
                  <input
                    type="text"
                    required
                    value={newMemory}
                    onChange={(e) => setNewMemory(e.target.value)}
                    placeholder="e.g. Focus on mornings..."
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </form>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {memoriesList.length === 0 ? (
                    <p className="text-[10px] text-neutral-500 italic font-mono text-center py-8">No long-term memories synchronized.</p>
                  ) : (
                    memoriesList.map((m) => (
                      <div key={m.id} className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl flex items-start justify-between gap-3 font-sans text-xs">
                        <p className="text-neutral-400 leading-normal">{m.content}</p>
                        <button
                          onClick={() => handleDeleteMemory(m.id)}
                          className="text-neutral-600 hover:text-red-400 shrink-0 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Cognitive Fatigue Diagnostics profile summary */}
              {productivityProfile && (
                <div className="p-4 bg-emerald-950/15 border border-emerald-900/30 rounded-xl space-y-2 shrink-0">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block uppercase">Productivity Diagnostics</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-neutral-400">
                    <div>Focus hours: {productivityProfile.allocated_focus_hours || 12}h</div>
                    <div>Cognitive rate: {productivityProfile.fatigue_recovery_rate || "Optimal"}</div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==========================================
            TAB: INSIGHTS (Human Velocity charts & sentiment)
            ========================================== */}
        {activeTab === "insights" && (
          <div className="animate-fade-in space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Core metrics and Diagnostics */}
              <div className="lg:col-span-8 space-y-6">
                <HumanInsights
                  tasksList={tasksList}
                  reflectionsList={reflectionsList}
                  habitsList={habitsList}
                />
              </div>

              {/* Journal / Reflection input */}
              <div className="lg:col-span-4 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-6 h-fit space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-neutral-300 border-b border-neutral-800 pb-2">Record Daily Journal</h4>
                
                <form onSubmit={handleCreateReflection} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Clarity Score ({newReflectionScore}/10)</label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={newReflectionScore}
                      onChange={(e) => setNewReflectionScore(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Journal Reflection Insights</label>
                    <textarea
                      required
                      value={newReflectionInsights}
                      onChange={(e) => setNewReflectionInsights(e.target.value)}
                      placeholder="e.g. Focus was crisp but meeting interrupted..."
                      rows={3}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Frictions / Blockers</label>
                    <input
                      type="text"
                      value={newReflectionBlockers}
                      onChange={(e) => setNewReflectionBlockers(e.target.value)}
                      placeholder="Any blockers?"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loadingAction === "reflection"}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                  >
                    <span>Log Daily Reflection</span>
                  </button>
                </form>
              </div>

            </div>

            {/* High-fidelity heatmap analytics */}
            <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-neutral-300 mb-4">Focus Contribution Heatmap</h3>
              <DashboardAnalytics
                tasksList={tasksList}
                reflectionsList={reflectionsList}
                habitsList={habitsList}
              />
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: SYSTEM SETTINGS (Plus Developer logs)
            ========================================== */}
        {activeTab === "settings" && (
          <div className="animate-fade-in space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Core User Settings form */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-6">
                  <h3 className="text-sm font-bold font-display text-neutral-100 flex items-center gap-1.5 mb-4">
                    <Settings className="w-4 h-4 text-emerald-400" />
                    System Customizations
                  </h3>

                  <form onSubmit={handleSaveProfileSettings} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-200 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Timezone Coordinates</label>
                      <select
                        value={profileTimezone}
                        onChange={(e) => setProfileTimezone(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-200 outline-none focus:border-emerald-500"
                      >
                        <option value="America/Los_Angeles">Pacific Standard Time (PST)</option>
                        <option value="America/New_York">Eastern Standard Time (EST)</option>
                        <option value="UTC">Coordinated Universal Time (UTC)</option>
                        <option value="Asia/Kolkata">Indian Standard Time (IST)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
                      <span className="text-xs text-neutral-300 font-sans">Dark visual theme</span>
                      <button
                        type="button"
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg hover:bg-neutral-900 text-emerald-400"
                      >
                        {darkMode ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loadingAction === "settings"}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl disabled:opacity-50"
                    >
                      Update Profile
                    </button>
                  </form>
                </div>

                {/* Google Sync and integrations controls */}
                <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold font-display text-neutral-100 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    Integrations & Calendar Connect
                  </h3>

                  {googleAccessToken ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex items-center justify-between">
                        <div className="min-w-0">
                          <span className="text-[9px] font-mono font-bold text-emerald-400 block uppercase">Connected</span>
                          <span className="text-xs text-neutral-300 font-mono truncate block max-w-[150px]">{googleEmailAddress || "Workspace Connected"}</span>
                        </div>
                        <button
                          onClick={handleUnlinkGoogleAccount}
                          className="px-2.5 py-1 text-[10px] font-mono font-bold text-rose-400 hover:bg-rose-950/20 border border-rose-900/40 rounded-lg"
                        >
                          Disconnect
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={syncGoogleCalendar}
                          disabled={isGoogleSyncing}
                          className="py-1.5 bg-neutral-950 border border-neutral-800 hover:border-emerald-800 text-neutral-300 text-[10px] font-bold font-mono rounded-lg flex items-center justify-center gap-1"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isGoogleSyncing ? "animate-spin" : ""}`} />
                          <span>Sync Calendar</span>
                        </button>
                        
                        <button
                          onClick={sendGmailBriefingReminder}
                          disabled={loadingAction === "google_gmail_send"}
                          className="py-1.5 bg-neutral-950 border border-neutral-800 hover:border-emerald-800 text-neutral-300 text-[10px] font-bold font-mono rounded-lg flex items-center justify-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Send Brief Email</span>
                        </button>
                      </div>

                      <button
                        onClick={autoScheduleFocusSlot}
                        disabled={loadingAction === "google_auto_schedule"}
                        className="w-full py-2 bg-emerald-950/20 border border-emerald-900/40 hover:bg-emerald-900/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <span>Auto-Schedule Focus Block</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                        Link your Google account to enable direct calendar sync, automated briefing dispatch emails, and priority reservation blocks.
                      </p>
                      <button
                        onClick={handleLinkGoogleAccount}
                        className="w-full py-2 bg-white hover:bg-neutral-100 text-neutral-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                        <span>Connect Google Workspace</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Multimodal voice input strategist section */}
                <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold font-display text-neutral-100 flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-emerald-400" />
                    Multimodal Voice Strategy (Gemini)
                  </h3>
                  <div className="space-y-3 font-mono text-[11px]">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startVoiceDictation((txt) => setVoiceTranscript(txt))}
                        className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold ${
                          isRecordingVoice 
                            ? "bg-rose-950/20 border-rose-800 text-rose-400 animate-pulse" 
                            : "bg-neutral-950 hover:bg-neutral-900 border-neutral-800 text-neutral-300"
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isRecordingVoice ? "Listening..." : "Dictate Voice"}</span>
                      </button>
                      
                      <button
                        onClick={isRecordingAudioClip ? stopAudioClipRecording : startAudioClipRecording}
                        className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold ${
                          isRecordingAudioClip 
                            ? "bg-rose-950/20 border-rose-800 text-rose-400 animate-pulse" 
                            : "bg-neutral-950 hover:bg-neutral-900 border-neutral-800 text-neutral-300"
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isRecordingAudioClip ? "Stop & Send" : "Gemini Audio"}</span>
                      </button>
                    </div>

                    {voiceTranscript && (
                      <div className="p-3 bg-neutral-950 rounded-xl space-y-1">
                        <span className="text-[9px] text-neutral-500 block uppercase font-bold">Transcription:</span>
                        <p className="text-neutral-300 leading-normal leading-relaxed">{voiceTranscript}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Hackathon Demo Sandbox Panel (Highly prominent for pitches) */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold font-display text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    Hackathon Demo Sandbox
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                    Instantly populate the active workspace with mock goals, high-risk tasks, completed milestones, daily reflections, and focus blocks to showcase the full agentic loop during pitches.
                  </p>
                  
                  <button
                    onClick={handleSeedDemoDataset}
                    disabled={loadingAction === "seed_demo"}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20"
                  >
                    {loadingAction === "seed_demo" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Seeding sandbox...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4.5 h-4.5" />
                        <span>Seed Rich Demo Dataset</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Collapsible Developer Console (Trace, Logs, Code Explorer) */}
                <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-6 space-y-4">
                  <button
                    onClick={() => setDevConsoleOpen(!devConsoleOpen)}
                    className="w-full flex items-center justify-between text-neutral-300 font-bold text-xs uppercase tracking-wider font-mono"
                  >
                    <span>{devConsoleOpen ? "[-] Hide Developer Console" : "[+] Show Developer Console"}</span>
                    <span className="text-[9px] text-emerald-400">Clean Architecture Logs</span>
                  </button>

                  {devConsoleOpen && (
                    <div className="space-y-4 animate-scale-up border-t border-neutral-800/60 pt-4">
                      
                      {/* Developer tabs */}
                      <div className="flex gap-2 border-b border-neutral-800/60 pb-3">
                        {[
                          { id: "trace", label: "Trace Sequences" },
                          { id: "logs", label: "Security Handshake Logs" },
                          { id: "code", label: "Monorepo Explorer" }
                        ].map(t => (
                          <button
                            key={t.id}
                            onClick={() => setActiveDevTab(t.id as any)}
                            className={`px-3 py-1 text-[11px] font-mono font-bold rounded-lg border ${
                              activeDevTab === t.id 
                                ? "bg-emerald-950/30 border-emerald-800 text-emerald-400" 
                                : "border-transparent text-neutral-400 hover:text-neutral-200"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      {/* Sub tab details */}
                      {activeDevTab === "trace" && (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto font-mono text-[11px]">
                          <div className="p-3 bg-neutral-950/80 border border-neutral-900 rounded-xl space-y-1.5">
                            <span className="text-emerald-400 font-bold">[10:14:02 AM] - AGENT INITIALIZED</span>
                            <p className="text-neutral-400">Successfully instantiated autonomous context loop for user session.</p>
                          </div>
                          <div className="p-3 bg-neutral-950/80 border border-neutral-900 rounded-xl space-y-1.5">
                            <span className="text-emerald-400 font-bold">[10:14:15 AM] - DATABASE HANDSHAKE COMPLETED</span>
                            <p className="text-neutral-400">Loaded {goalsList.length} goals, {tasksList.length} tasks, and {schedulesList.length} schedule reservations from Supabase.</p>
                          </div>
                        </div>
                      )}

                      {activeDevTab === "logs" && (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {logsList.length === 0 ? (
                            <p className="text-xs text-neutral-500 font-mono text-center py-4">No audit trails available.</p>
                          ) : (
                            logsList.map((log) => (
                              <div key={log.id} className="p-3 bg-neutral-950/40 border border-neutral-900 rounded-lg flex items-start justify-between gap-4 font-mono text-[11px]">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-emerald-400 font-bold">{log.action}</span>
                                    <span className="text-neutral-600">•</span>
                                    <span className="text-neutral-500">{log.ip_address}</span>
                                  </div>
                                  {log.payload && (
                                    <pre className="text-[10px] text-neutral-500 bg-neutral-950 p-1.5 rounded border border-neutral-900 overflow-x-auto">
                                      <code>{JSON.stringify(log.payload)}</code>
                                    </pre>
                                  )}
                                </div>
                                <span className="text-neutral-600 shrink-0">{new Date(log.created_at).toLocaleTimeString()}</span>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {activeDevTab === "code" && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-5 bg-neutral-950 p-3 rounded-xl max-h-[250px] overflow-y-auto">
                            {renderTree(FILE_TREE)}
                          </div>
                          <div className="md:col-span-7 bg-neutral-950 p-3 rounded-xl max-h-[250px] overflow-y-auto font-mono text-[10px] text-neutral-400 relative">
                            {loadingFile ? (
                              <div className="absolute inset-0 bg-neutral-950/80 flex items-center justify-center gap-1 text-xs">
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                                <span>Loading content...</span>
                              </div>
                            ) : (
                              <pre className="whitespace-pre overflow-x-auto">
                                <code>{fileContent || "Select a file to view content."}</code>
                              </pre>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-950 mt-16 bg-neutral-950/40 py-6 text-center text-[10px] text-neutral-500 font-mono">
        <p>© 2026 Momentum AI. Platform Sync Engine active on port 3000. Under strict clean architecture boundaries.</p>
      </footer>

      {/* Floating Feedback Toasts Toast System */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-center gap-3 animate-scale-up text-xs font-medium ${
              t.type === "success"
                ? "bg-emerald-950/90 border-emerald-800 text-emerald-200"
                : t.type === "error"
                ? "bg-red-950/90 border-red-900 text-red-200"
                : "bg-neutral-900/90 border-neutral-800 text-neutral-200"
            }`}
          >
            <div className="flex-1 leading-normal">{t.message}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
