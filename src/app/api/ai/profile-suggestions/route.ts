import { NextResponse } from "next/server";
import { callGemini } from "@/lib/services/gemini-client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fullName = "Talenta",
      skills = [],
      hasGitHub = false,
      hasPortfolio = false,
      hasKtp = false,
      hasAvatar = false,
      headline = "",
    } = body;

    const prompt = `Anda adalah "AI Career & Profile Strategist" di platform talenta freelance Doable (Indonesia).
Tugas Anda: Berikan 1 tips personalisasi singkat (maksimal 2 kalimat) agar profil talenta ini terlihat kredibel di mata klien UMKM & korporat.

Profil Talenta:
- Nama: ${fullName}
- Keahlian: ${skills.length > 0 ? skills.join(", ") : "Umum"}
- Headline: ${headline || "Belum diatur"}
- Portofolio/GitHub: ${hasGitHub || hasPortfolio ? "Sudah ada" : "Belum ditautkan"}
- Verifikasi KTP: ${hasKtp ? "Terverifikasi" : "Belum"}
- Foto Profil: ${hasAvatar ? "Ada" : "Belum ada"}

Instruksi:
- Fokus pada dampak penambahan tautan portofolio/GitHub, verifikasi KTP, atau penajaman keahlian untuk meningkatkan penerimaan proposal.
- Gaya bahasa profesional, ramah, dan memotivasi (Bahasa Indonesia).
- Kembalikan JSON murni:
{
  "aiTip": "1-2 kalimat tips strategis"
}`;

    const geminiRes = await callGemini({
      prompt,
      responseMimeType: "application/json",
      temperature: 0.4,
    });

    if (geminiRes.success && geminiRes.text) {
      try {
        const parsed = JSON.parse(geminiRes.text);
        if (parsed.aiTip) {
          return NextResponse.json({
            aiTip: parsed.aiTip,
            modelUsed: geminiRes.modelUsed,
            fromCache: geminiRes.fromCache,
          });
        }
      } catch (parseErr) {
        console.warn("[Profile Suggestions] Error parsing Gemini JSON:", parseErr);
      }
    }

    // Heuristic Fallback based on specific gaps
    let fallbackTip = "Profil lengkap dengan portofolio dan verifikasi identitas memiliki rasio kemenangan proposal 3.2x lebih tinggi.";
    if (!hasGitHub && !hasPortfolio) {
      fallbackTip = "Klien teknologi & UMKM lebih memprioritaskan talenta dengan tautan GitHub atau portofolio terhubung untuk memvalidasi kualitas karya secara langsung.";
    } else if (!hasKtp) {
      fallbackTip = "Verifikasi KTP Anda untuk mendapatkan badge resmi 'Verified Talent' dan meningkatkan prioritas profil di algoritma pencarian klien.";
    } else if (!hasAvatar) {
      fallbackTip = "Foto profil yang ramah dan profesional dapat meningkatkan kepercayaan klien pada proposal pertama Anda hingga 40%.";
    }

    return NextResponse.json({
      aiTip: fallbackTip,
    });
  } catch (error) {
    console.error("Error generating profile suggestions:", error);
    return NextResponse.json(
      {
        aiTip: "Lengkapi portofolio dan verifikasi identitas untuk meningkatkan kepercayaan klien.",
      },
      { status: 200 }
    );
  }
}
