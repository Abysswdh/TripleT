import { NextResponse } from "next/server";
import { callGemini } from "@/lib/services/gemini-client";
import {
  analyzeProjectLocally,
  validateAIResponse,
  type AIAnalysisResponse,
} from "@/lib/services/ai-project-analyzer";

/**
 * Serverless Next.js API Route for Vercel:
 * Analyzes project brief using LLM (Gemini) or enhanced semantic NLP rules.
 */
export async function POST(req: Request) {
  try {
    const { title, description } = await req.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Title is required for analysis." },
        { status: 400 }
      );
    }

    const prompt = `Anda adalah AI analisis proyek freelance profesional untuk platform Doable! Indonesia.
Analisis judul dan kebutuhan pekerjaan berikut secara akurat dan tentukan klasifikasinya:

Judul: "${title}"
Deskripsi: "${description || "-"}"

Klasifikasikan ke format JSON (hanya kembalikan JSON murni tanpa markdown):
{
  "category": "Desain & Branding" | "Foto & Video Kreatif" | "Tugas Lokal / On-Site" | "Web & IT Engineering" | "Penulisan & Admin" | "Marketing & Promosi",
  "difficulty": "Starter" | "Standard" | "Enterprise",
  "experienceLevel": "Junior" | "Intermediate" | "Senior",
  "suggestedSkills": ["skill1", "skill2", "skill3"],
  "suggestedBudget": 150000,
  "suggestedDurationDays": 3,
  "suggestedObjectives": ["poin hasil 1", "poin hasil 2"],
  "suggestedDeliverables": ["format serah terima 1", "format serah terima 2"],
  "reasoning": "Alasan singkat klasifikasi"
}`;

    const geminiRes = await callGemini({
      prompt,
      responseMimeType: "application/json",
      temperature: 0.2,
    });

    if (geminiRes.success && geminiRes.text) {
      try {
        const parsed = JSON.parse(geminiRes.text);
        if (validateAIResponse(parsed)) {
          return NextResponse.json(parsed);
        }
      } catch (parseErr) {
        console.warn("[Analyze Project] Error parsing Gemini JSON:", parseErr);
      }
    }

    // 2. Enhanced Indonesian Semantic NLP Classification Engine (High Accuracy, 0ms, 0 Cost)
    const analysis: AIAnalysisResponse = analyzeProjectLocally(title, description);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("AI Analysis route error:", error);
    return NextResponse.json(
      { error: "Internal server error during analysis." },
      { status: 500 }
    );
  }
}
