/**
 * Shared Resilient Gemini AI Client with:
 * 1. Multi-model fallback (gemini-1.5-flash -> gemini-1.5-flash-latest -> gemini-2.0-flash -> gemini-1.5-pro)
 * 2. API Key sanitization (whitespace & quotes stripping)
 * 3. In-memory Server-side LRU/TTL caching to protect Free-Tier limits (15 RPM)
 * 4. Transparent error logging of Google's raw responses
 */

interface GeminiCallParams {
  prompt: string;
  responseMimeType?: "application/json" | "text/plain";
  temperature?: number;
  systemInstruction?: string;
}

interface GeminiCallResult {
  success: boolean;
  text?: string;
  modelUsed?: string;
  fromCache?: boolean;
  error?: string;
}

// Ordered candidate models to attempt in case of 404 / retirement
const CANDIDATE_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-2.0-flash",
  "gemini-1.5-flash-001",
  "gemini-1.5-flash-002",
  "gemini-1.5-pro",
];

// Memory cache: cacheKey -> { text: string; model: string; expiry: number }
const serverCache = new Map<string, { text: string; model: string; expiry: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes TTL

// Remember the last confirmed working model to avoid wasteful trial queries
let lastConfirmedWorkingModel: string | null = null;

/**
 * Sanitizes and extracts the GEMINI_API_KEY from environment variables.
 */
export function getSanitizedGeminiKey(): string | null {
  const raw = process.env.GEMINI_API_KEY;
  if (!raw) return null;
  const cleaned = raw.trim().replace(/^["']|["']$/g, "").trim();
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Executes a resilient generateContent call against the Gemini REST API.
 */
export async function callGemini(params: GeminiCallParams): Promise<GeminiCallResult> {
  const apiKey = getSanitizedGeminiKey();
  if (!apiKey) {
    return {
      success: false,
      error: "GEMINI_API_KEY is not configured or is empty.",
    };
  }

  // 1. Check in-memory server cache
  const cacheKey = `${params.responseMimeType || "json"}_${params.prompt.trim()}`;
  const cached = serverCache.get(cacheKey);
  if (cached && Date.now() < cached.expiry) {
    return {
      success: true,
      text: cached.text,
      modelUsed: cached.model,
      fromCache: true,
    };
  }

  // 2. Determine model candidates order (start with last working model if known)
  const modelsToTry = lastConfirmedWorkingModel
    ? [lastConfirmedWorkingModel, ...CANDIDATE_MODELS.filter((m) => m !== lastConfirmedWorkingModel)]
    : [...CANDIDATE_MODELS];

  let lastError = "";

  for (const model of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

      const requestBody: any = {
        contents: [
          {
            parts: [{ text: params.prompt }],
          },
        ],
        generationConfig: {
          temperature: params.temperature ?? 0.3,
        },
      };

      if (params.responseMimeType) {
        requestBody.generationConfig.responseMimeType = params.responseMimeType;
      }

      if (params.systemInstruction) {
        requestBody.systemInstruction = {
          parts: [{ text: params.systemInstruction }],
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (rawText) {
          lastConfirmedWorkingModel = model;

          // Store in server cache
          serverCache.set(cacheKey, {
            text: rawText,
            model,
            expiry: Date.now() + CACHE_TTL_MS,
          });

          // Prevent cache map from growing indefinitely
          if (serverCache.size > 200) {
            const firstKey = serverCache.keys().next().value;
            if (firstKey) serverCache.delete(firstKey);
          }

          return {
            success: true,
            text: rawText,
            modelUsed: model,
            fromCache: false,
          };
        }
      }

      // If not ok, capture exact Google error message
      const errBody = await res.text();
      lastError = `Model ${model} failed with HTTP ${res.status}: ${errBody.slice(0, 200)}`;

      if (res.status === 404) {
        console.warn(`[Gemini Client] 404 NotFound on model '${model}'. Trying next candidate...`);
      } else if (res.status === 429) {
        console.warn(`[Gemini Client] 429 RateLimit/ResourceExhausted on model '${model}'.`);
        // If rate limited, don't keep hammering other models immediately
        break;
      } else {
        console.warn(`[Gemini Client] ${lastError}`);
      }
    } catch (networkErr: any) {
      lastError = `Network error on ${model}: ${networkErr?.message || networkErr}`;
      console.warn(`[Gemini Client] ${lastError}`);
    }
  }

  return {
    success: false,
    error: lastError || "All Gemini candidate models failed to generate content.",
  };
}
