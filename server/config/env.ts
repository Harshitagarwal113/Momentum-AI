// ==============================================================================
// Momentum AI — Environment Configuration and Validation Engine
// Handles environment variable auditing, reporting, and lazy assertions.
// ==============================================================================

export interface EnvVariableStatus {
  name: string;
  category: string;
  isSet: boolean;
  isCritical: boolean;
  description: string;
}

export const envConfig = {
  // Runtime Server
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
  SESSION_SECRET: process.env.SESSION_SECRET || "momentum-secure-fallback-cookie-session-key",

  // Google Gemini AI
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",

  // Google Calendar & OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || "",

  // Database
  DATABASE_URL: process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING || "",
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  // Firebase
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "",
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || "",
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || "",
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || "",
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || "",

  // Custom Authentication (JWT)
  JWT_SECRET: process.env.JWT_SECRET || "momentum-ai-super-secret-fallback-jwt-key-256",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "30d",

  // URLs
  APP_URL: process.env.APP_URL || process.env.VITE_APP_URL || "http://localhost:3000"
};

// Map of variables with description and critical indicators
const VARIABLE_REGISTRY: { name: keyof typeof envConfig; category: string; isCritical: boolean; description: string }[] = [
  {
    name: "GEMINI_API_KEY",
    category: "Google Gemini AI",
    isCritical: true,
    description: "Powers all multi-agent cognitive planning, priority scoring, and natural language parsing."
  },
  {
    name: "NODE_ENV",
    category: "Server Runtime",
    isCritical: false,
    description: "Toggles development features vs production optimizations."
  },
  {
    name: "SESSION_SECRET",
    category: "Server Runtime",
    isCritical: false,
    description: "Secures cookie structures and limits session hijacking risks."
  },
  {
    name: "DATABASE_URL",
    category: "Database & Storage",
    isCritical: false,
    description: "Standard PostgreSQL connection URI for enterprise persistence."
  },
  {
    name: "SUPABASE_URL",
    category: "Database & Storage",
    isCritical: false,
    description: "Supabase endpoint URL for relational client operations."
  },
  {
    name: "SUPABASE_ANON_KEY",
    category: "Database & Storage",
    isCritical: false,
    description: "Supabase public anonymous credentials."
  },
  {
    name: "GOOGLE_CLIENT_ID",
    category: "Google OAuth & Calendar",
    isCritical: false,
    description: "Client ID enabling standard user authorization flows."
  },
  {
    name: "GOOGLE_CLIENT_SECRET",
    category: "Google OAuth & Calendar",
    isCritical: false,
    description: "Client Secret matching Google ID credentials."
  },
  {
    name: "FIREBASE_API_KEY",
    category: "Firebase",
    isCritical: false,
    description: "Web client credentials matching Firebase service pools."
  },
  {
    name: "JWT_SECRET",
    category: "Authentication Security",
    isCritical: false,
    description: "Signing key for issued custom tokens."
  },
  {
    name: "APP_URL",
    category: "Web Frontend Assets",
    isCritical: false,
    description: "Used to determine absolute self-referencing callbacks."
  }
];

/**
 * Evaluates the current state of variables, outputting a high-fidelity audit log report to console.
 */
export function validateAndReportEnv(): { success: boolean; statuses: EnvVariableStatus[] } {
  console.log("\n======================================================================");
  console.log("       Momentum AI Environment Variable Security Audit & Validation   ");
  console.log("======================================================================");

  let allCriticalSet = true;
  const statuses: EnvVariableStatus[] = [];

  VARIABLE_REGISTRY.forEach(({ name, category, isCritical, description }) => {
    const rawVal = process.env[name] || process.env[`NEXT_PUBLIC_${name}`] || process.env[`VITE_${name}`];
    // Check if set and not placeholder
    const isSet = !!rawVal && rawVal !== `MY_${name}` && rawVal !== `your-${name.toLowerCase().replace(/_/g, "-")}-here` && rawVal.trim() !== "";
    
    if (isCritical && !isSet) {
      allCriticalSet = false;
    }

    statuses.push({
      name,
      category,
      isSet,
      isCritical,
      description
    });

    const statusIndicator = isSet ? "🟢 CONFIGURED" : isCritical ? "🔴 MISSING (CRITICAL)" : "🟡 NOT SET (OPTIONAL)";
    console.log(`[${category}] ${name.padEnd(25)} : ${statusIndicator}`);
  });

  console.log("----------------------------------------------------------------------");

  if (!allCriticalSet) {
    console.log("\n⚠️  WARNING: Critical environmental configurations are missing!");
    console.log("   Momentum AI will boot, but certain core agentic services will fail");
    console.log("   gracefully when accessed by returning detailed warning prompts.");
    console.log("   Please configure these variables in your .env or AI Studio secrets.\n");
  } else {
    console.log("\n✅ SUCCESS: All critical environmental variables are successfully configured.");
    console.log("   Momentum AI is operating at 100% capacity with fully loaded agent loops.\n");
  }
  console.log("======================================================================\n");

  return {
    success: allCriticalSet,
    statuses
  };
}

/**
 * Asserts the presence of a variable lazily.
 * Throws a highly detailed error message if missing, preventing silent crashes.
 */
export function assertEnv(name: keyof typeof envConfig, contextDescription?: string): string {
  const val = envConfig[name];
  if (!val || val === `MY_${String(name)}` || String(val).trim() === "") {
    const errorMsg = `Configuration Error: The environment variable '${String(name)}' is missing or unconfigured.${
      contextDescription ? ` Context: ${contextDescription}.` : ""
    } Please declare it in your .env or AI Studio Secrets manager to resolve this.`;
    
    console.error(`[Environment Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }
  return String(val);
}
