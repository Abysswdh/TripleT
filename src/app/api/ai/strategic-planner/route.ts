import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      dailyCapacityHours = 4,
      weeklyAvailability = "semi_full",
      todayTasksCount = 0,
      overdueCount = 0,
      activeProjectsCount = 0,
      todayTaskTitles = [],
    } = body;

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (geminiApiKey) {
      try {
        const prompt = `Anda adalah "Doable Strategic Workload Coach" (AI Planner platform freelance Indonesia).
Tugas Anda: Berikan 1-2 kalimat saran taktis yang ringkas, cerdas, dan memotivasi untuk talenta freelance berdasarkan beban kerja hari ini.

Data Talenta Hari Ini:
- Kapasitas Waktu: ${dailyCapacityHours} jam/hari (${weeklyAvailability})
- Tugas Terlambat (Overdue): ${overdueCount} tugas
- Total Tugas Hari Ini: ${todayTasksCount} tugas
- Proyek Klien Aktif: ${activeProjectsCount} proyek
- Daftar Tugas: ${todayTaskTitles.slice(0, 4).join(", ") || "Tidak ada tugas"}

Pedoman:
1. Jika ada overdue/terlambat: Nada URGENT, ingatkan untuk mendahulukan tugas tersebut agar reputasi & escrow aman.
2. Jika ada beberapa proyek: Berikan strategi pembagian waktu agar talenta tidak burnout / overwork.
3. Jika tugas sedikit atau kosong: Sarankan melengkapi profil atau mengambil kuis keahlian baru.
4. Gaya bahasa: Profesional, ramah, to-the-point, Bahasa Indonesia modern.

Kembalikan format JSON murni:
{
  "insight": "1-2 kalimat saran taktis untuk talenta",
  "tone": "urgent" | "balanced" | "relaxed"
}`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.3,
              },
            }),
          }
        );

        if (res.ok) {
          const geminiData = await res.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return NextResponse.json({
              insight: parsed.insight,
              tone: parsed.tone || (overdueCount > 0 ? "urgent" : "balanced"),
            });
          }
        }
      } catch (geminiError) {
        console.warn("Gemini API call failed, using deterministic coach:", geminiError);
      }
    }

    // Fallback if no GEMINI_API_KEY or call timed out
    let fallbackInsight = `Kapasitas kerja Anda hari ini dialokasikan proporsional (${dailyCapacityHours} jam). Fokus selesaikan target utama satu per satu.`;
    let fallbackTone: "urgent" | "balanced" | "relaxed" = "balanced";

    if (overdueCount > 0) {
      fallbackInsight = `⚠️ Perhatian: Ada ${overdueCount} tugas melewati tenggat. Prioritaskan penyerahan ini hari ini untuk menjaga performa skor Anda.`;
      fallbackTone = "urgent";
    } else if (todayTasksCount === 0) {
      fallbackInsight = `Jadwal hari ini lengang. Rekomendasi: Ikuti kuis keahlian atau jelajahi quest baru untuk meningkatkan daya tawar Anda.`;
      fallbackTone = "relaxed";
    }

    return NextResponse.json({
      insight: fallbackInsight,
      tone: fallbackTone,
    });
  } catch (error) {
    console.error("Error in strategic planner route:", error);
    return NextResponse.json(
      {
        insight: "Sistem MRP aktif meratakan beban kerja harian Anda.",
        tone: "balanced",
      },
      { status: 200 }
    );
  }
}
