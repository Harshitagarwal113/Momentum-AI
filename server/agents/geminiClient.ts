import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const hasApiKey = (): boolean => {
  return !!apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "";
};

export const getGeminiClient = (): GoogleGenAI | null => {
  if (!hasApiKey()) return null;
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

/**
 * Executes a Gemini API call with exponential backoff retries and error recovery.
 */
export async function callGeminiWithRetry<T>(
  prompt: string,
  systemInstruction: string,
  responseSchema?: any,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<{ text: string; thoughts: string }> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error("GEMINI_API_KEY is not configured or invalid.");
  }

  let delay = initialDelayMs;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Gemini API] Attempt ${attempt} / ${maxRetries}...`);
      
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: responseSchema ? "application/json" : "text/plain",
          responseSchema: responseSchema || undefined,
        },
      });

      const responseText = response.text || "";
      
      // Extract thinking - since gemini-3.5-flash automatically processes, we can log details.
      // If we want the agent to explicitly think, we can request a structured JSON that includes a "thoughts" field.
      let thoughts = "Generated successfully.";
      
      // If output is expected to be JSON and contains "thoughts", let's try to extract it
      if (responseSchema) {
        try {
          const parsed = JSON.parse(responseText);
          if (parsed.thoughts) {
            thoughts = parsed.thoughts;
          }
        } catch {
          // Ignored fallback
        }
      }

      return { text: responseText, thoughts };
    } catch (error: any) {
      lastError = error;
      console.error(`[Gemini API] Attempt ${attempt} failed:`, error.message || error);
      
      if (attempt < maxRetries) {
        console.log(`[Gemini API] Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  throw new Error(`Gemini API failed after ${maxRetries} attempts. Last error: ${lastError?.message || lastError}`);
}
