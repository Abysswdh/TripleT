import { NextResponse } from "next/server";
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

    const geminiApiKey = process.env.GEMINI_API_KEY;

    // 1. If Gemini API Key is configured in Vercel environment variables:
    if (geminiApiKey) {
      try {
        const prompt = `Anda adalah AI analisis proyek freelance profesional untuk platform Doable! Indonesia.
Analisis judul dan kebutuhan pekerjaan berikut secara akurat dan tentukan klasifikasinya:

Judul: "${title}"
Deskripsi: "${description || "-"}"

Klasifikasikan ke format JSON (hanya kembalikan JSON murni tanpa markdown):
{
  "category": "Desain Grafis & Branding" | "Foto, Video & Kreatif" | "Tugas Lapangan & On-Site" | "Web & Digital Engineering" | "Penulisan & Virtual Admin" | "Pemasaran & Bisnis UMKM",
  "difficulty": "Starter" | "Standard" | "Enterprise",
  "experienceLevel": "Junior" | "Intermediate" | "Senior",
  "suggestedSkills": ["skill1", "skill2", "skill3"],
  "suggestedBudget": 150000,
  "suggestedDurationDays": 3,
  "suggestedObjectives": ["poin hasil 1", "poin hasil 2"],
  "suggestedDeliverables": ["format serah terima 1", "format serah terima 2"],
  "reasoning": "Alasan singkat klasifikasi"
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json" },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (validateAIResponse(parsed)) {
              return NextResponse.json(parsed);
            }
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini API call error, falling back to enhanced NLP engine:", geminiErr);
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
