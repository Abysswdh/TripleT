import { analyzeProjectLocally, type AIAnalysisResponse } from "@/app/api/ai/analyze-project/route";

/**
 * Realtime Smart Analyzer for Project Creation Wizard
 * 1. Executes instant local heuristic analysis in 0ms.
 * 2. Optionally queries the Next.js /api/ai/analyze-project endpoint.
 */
export async function analyzeProjectBrief(
  title: string,
  description: string = ""
): Promise<AIAnalysisResponse> {
  // 1. Instant client-side analysis
  const localResult = analyzeProjectLocally(title, description);

  // If title is too short, return local immediately
  if (!title.trim() || title.trim().length < 4) {
    return localResult;
  }

  // 2. Try querying the Next.js serverless route (if deployed on Vercel with Gemini/LLM)
  try {
    const res = await fetch("/api/ai/analyze-project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });

    if (res.ok) {
      const data = await res.json();
      return data as AIAnalysisResponse;
    }
  } catch {
    // Gracefully fallback to instant local analysis if offline or route unavailable
  }

  return localResult;
}
