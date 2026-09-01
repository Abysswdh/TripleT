export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SkillQuizDefinition {
  id: string;
  name: string;
  category: "Frontend" | "Backend" | "UI/UX" | "Frontend 3D" | "Fullstack" | "Database";
  categoryLabel: string;
  questionsCount: number;
  timeLimitSeconds: number; // in seconds
  timeLimitDisplay: string;
  xpReward: number;
  badgeName: string;
  badgeIcon: string;
  description: string;
  passingScore: number; // e.g. 80 (%)
  questions: QuizQuestion[];
}

export interface QuizAttemptResult {
  quizId: string;
  score: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  earnedXp: number;
  badgeName?: string;
  completedAt: string;
  userAnswers: number[]; // index of chosen option for each question
}

export const SKILL_QUIZZES: SkillQuizDefinition[] = [
  {
    id: "q-nextjs",
    name: "Next.js 14 App Router & Server Actions",
    category: "Frontend",
    categoryLabel: "Frontend Engineering",
    questionsCount: 5,
    timeLimitSeconds: 300, // 5 minutes
    timeLimitDisplay: "5 Menit",
    xpReward: 350,
    badgeName: "Next.js Verified Pro",
    badgeIcon: "⚡",
    description: "Evaluasi penguasaan Next.js 14 App Router, Server Actions, Dynamic Streaming, ISR, dan arsitektur Server Components.",
    passingScore: 80,
    questions: [
      {
        id: "q-nextjs-1",
        question: "Di mana direktif `'use server'` harus diletakkan saat mendefinisikan Server Action independen dalam modul terpisah?",
        codeSnippet: `// actions.ts\n'use server';\n\nexport async function updateProfile(formData: FormData) {\n  // database mutation\n}`,
        options: [
          "Di dalam file client component di baris paling bawah",
          "Di bagian paling atas modul (file-level) atau di baris pertama body fungsi async",
          "Hanya di dalam layout.tsx root aplikasi",
          "Di dalam package.json pada properti serverActions"
        ],
        correctIndex: 1,
        explanation: "Direktif 'use server' menandai fungsi async sebagai Server Action. Dapat diletakkan di bagian paling atas file (berlaku untuk semua export fungsi di file tersebut) atau di baris pertama fungsi async individu."
      },
      {
        id: "q-nextjs-2",
        question: "Fungsi bawaan Next.js manakah yang digunakan untuk memvalidasi ulang cache path secara on-demand setelah Server Action selesai?",
        options: [
          "router.reload()",
          "revalidatePath('/dashboard')",
          "cache.invalidateAll()",
          "fetch.refreshCache()"
        ],
        correctIndex: 1,
        explanation: "`revalidatePath()` dari `next/cache` memungkinkan Anda menghapus cache data dan me-render ulang konten pada path tertentu secara on-demand setelah mutasi Server Action."
      },
      {
        id: "q-nextjs-3",
        question: "Secara default di App Router Next.js 14, jenis komponen apa yang dihasilkan saat membuat komponen baru di dalam folder app/?",
        options: [
          "Client Component",
          "React Server Component (RSC)",
          "Pure Static HTML Generator",
          "Web Worker Component"
        ],
        correctIndex: 1,
        explanation: "Semua komponen di dalam folder app/ pada Next.js 13+ App Router secara default adalah React Server Components (RSC) kecuali secara eksplisit diberi deklarasi `'use client'`."
      },
      {
        id: "q-nextjs-4",
        question: "Bagaimana cara melakukan streaming UI sebagian halaman secara instan saat komponen data berat masih memuat data di server?",
        options: [
          "Menggunakan file loading.tsx atau membungkus komponen dengan <Suspense fallback={<Skeleton />}>",
          "Menggunakan setTimeout di client component",
          "Menonaktifkan javascript di browser",
          "Menggunakan hook useEffect dengan dependency kosong"
        ],
        correctIndex: 0,
        explanation: "Next.js App Router mendukung React Suspense dan file konvensi `loading.tsx` untuk melakukan granular streaming rendering secara instan tanpa menunggu seluruh data halaman selesai dimuat."
      },
      {
        id: "q-nextjs-5",
        question: "Apa perbedaan utama antara Route Handler (`app/api/.../route.ts`) dan Server Actions?",
        options: [
          "Route Handler tidak bisa menerima HTTP POST",
          "Server Actions dirancang khusus untuk RPC mutasi dari form/komponen UI React tanpa membuat endpoint REST API manual",
          "Route Handler hanya bekerja di lingkungan PHP",
          "Server Actions hanya bisa dipanggil dari Postman"
        ],
        correctIndex: 1,
        explanation: "Server Actions menyediakan abstraksi RPC tipe-aman yang dieksekusi langsung dari komponen React, sedangkan Route Handler digunakan untuk endpoint REST/Webhook publik atau integrasi pihak ketiga."
      }
    ]
  },
  {
    id: "q-fastapi",
    name: "Python FastAPI & Async Architecture",
    category: "Backend",
    categoryLabel: "Backend & Systems",
    questionsCount: 5,
    timeLimitSeconds: 300,
    timeLimitDisplay: "5 Menit",
    xpReward: 400,
    badgeName: "FastAPI Certified",
    badgeIcon: "🐍",
    description: "Uji keahlian pembuatan API asynchronous performa tinggi, dependency injection, validasi Pydantic v2, dan integrasi database.",
    passingScore: 80,
    questions: [
      {
        id: "q-fastapi-1",
        question: "Fitur FastAPI apa yang digunakan untuk mengelola koneksi database session per-request dan autentikasi user secara modular?",
        codeSnippet: `@app.get('/projects')\nasync def get_projects(db: AsyncSession = Depends(get_db_session), user = Depends(get_current_user)):\n    ...`,
        options: [
          "FastAPI Decorators (`@decorator`)",
          "Dependency Injection System (`Depends`)",
          "Middleware Chains (`app.middleware`)",
          "Celery Task Worker"
        ],
        correctIndex: 1,
        explanation: "`Depends()` di FastAPI menyediakan sistem Dependency Injection yang sangat kuat untuk menginjeksi database session, security context, dan validasi reusable ke route handlers."
      },
      {
        id: "q-fastapi-2",
        question: "Library apa yang digunakan FastAPI sebagai fondasi inti untuk validasi data request, parsing payload, dan serialisasi schema JSON?",
        options: [
          "Marshmallow",
          "Pydantic",
          "Cerberus",
          "Django ORM Form"
        ],
        correctIndex: 1,
        explanation: "FastAPI dibangun di atas Pydantic (saat ini Pydantic v2 berbasis Rust core) untuk validasi tipe data yang sangat cepat dan pembuatan OpenAPI schema otomatis."
      },
      {
        id: "q-fastapi-3",
        question: "Kapan Anda harus mendefinisikan route handler dengan `async def` alih-alih `def` standar di FastAPI?",
        options: [
          "Hanya saat endpoint tidak melakukan operasi database",
          "Saat fungsi memanggil operasi I/O asinkron seperti `await db.execute()` atau `await http_client.get()`",
          "Wajib di semua fungsi tanpa terkecuali",
          "Hanya saat menggunakan SQLite synchronous"
        ],
        correctIndex: 1,
        explanation: "Gunakan `async def` saat Anda menjalankan library I/O non-blocking (seperti asyncpg, httpx, atau motor) dengan kata kunci `await` agar event loop ASGI tidak terblokir."
      },
      {
        id: "q-fastapi-4",
        question: "Bagaimana cara menjalankan tugas background ringan (seperti mengirim email verifikasi) setelah response dikirim ke klien di FastAPI?",
        options: [
          "Menggunakan objek bawaan `BackgroundTasks` dari FastAPI",
          "Menggunakan `time.sleep(10)` di dalam route handler",
          "Membuka thread baru dengan `threading.Thread` manual tanpa error handler",
          "Menghentikan server sementara"
        ],
        correctIndex: 0,
        explanation: "`BackgroundTasks` dari FastAPI memungkinkan Anda menjadwalkan fungsi async/sync ringan untuk dijalankan setelah HTTP response sukses dikirim kembali ke user."
      },
      {
        id: "q-fastapi-5",
        question: "Dokumentasi interaktif apa yang secara otomatis di-generate oleh FastAPI tanpa konfigurasi tambahan?",
        options: [
          "Swagger UI (`/docs`) dan ReDoc (`/redoc`)",
          "Javadoc dan Doxygen",
          "Postman Collection binary format",
          "GraphiQL IDE"
        ],
        correctIndex: 0,
        explanation: "FastAPI secara otomatis menghasilkan dokumentasi standar OpenAPI melalui antarmuka interaktif Swagger UI pada `/docs` dan ReDoc pada `/redoc`."
      }
    ]
  },
  {
    id: "q-figma",
    name: "Figma Advanced Auto-layout & Design Tokens",
    category: "UI/UX",
    categoryLabel: "UI/UX & Design Systems",
    questionsCount: 5,
    timeLimitSeconds: 300,
    timeLimitDisplay: "5 Menit",
    xpReward: 300,
    badgeName: "Figma Design Pro",
    badgeIcon: "🎨",
    description: "Evaluasi kemampuan pembuatan Design System skalabel, Figma Variables (Color/Number/String/Boolean), dan Auto-layout responsif.",
    passingScore: 80,
    questions: [
      {
        id: "q-figma-1",
        question: "Pengaturan Auto-layout manakah yang membuat sebuah kartu (card) otomatis merenggang mengisi seluruh lebar container induknya?",
        options: [
          "Hug contents",
          "Fill container",
          "Fixed width",
          "Absolute position"
        ],
        correctIndex: 1,
        explanation: "`Fill container` memerintahkan elemen anak untuk merentang secara responsif mengisi seluruh ruang yang tersedia di dalam frame auto-layout induk."
      },
      {
        id: "q-figma-2",
        question: "Fitur Figma apa yang memungkinkan Anda beralih tema (Dark Mode / Light Mode) atau bahasa (ID / EN) secara instan pada satu set komponen?",
        options: [
          "Figma Variables & Modes",
          "Layer Blend Modes",
          "Smart Animate Transition",
          "Vector Network Pen Tool"
        ],
        correctIndex: 0,
        explanation: "Figma Variables dengan dukungan multi-modes (misalnya mode Light vs Dark) memungkinkan token warna dan tipografi berganti secara otomatis di seluruh frame anak."
      },
      {
        id: "q-figma-3",
        question: "Apa fungsi dari `Min / Max Width` pada pengaturan Auto-layout Figma?",
        options: [
          "Membatasi ukuran minimum dan maksimum elemen saat container di-resize agar tetap proporsional dan tidak rusak",
          "Mengubah format gambar dari PNG ke SVG",
          "Menonaktifkan klik pada prototipe",
          "Menghapus margin secara otomatis"
        ],
        correctIndex: 0,
        explanation: "Min dan Max width/height memastikan komponen UI fleksibel namun tetap mematuhi batas ergonomis desain responsif (misalnya tombol tidak boleh lebih lebar dari 400px)."
      },
      {
        id: "q-figma-4",
        question: "Manakah struktur penamaan token warna yang paling baik untuk arsitektur Design System berskala besar?",
        options: [
          "Global/Blue1, Blue2, Blue3",
          "Semantic/color.bg.primary, color.text.muted, color.border.default",
          "MyColors/WarnaBagus, WarnaTombol",
          "Hex/254be3, FFFFFF"
        ],
        correctIndex: 1,
        explanation: "Pendekatan Semantic Tokens (`role-based` seperti `color.bg.primary` atau `color.text.muted`) memudahkan pemeliharaan tema, mode gelap/terang, dan kolaborasi dengan developer."
      },
      {
        id: "q-figma-5",
        question: "Apa keuntungan utama menggunakan `Component Properties` (Boolean, Instance Swap, Text) dibandingkan membuat puluhan varian terpisah?",
        options: [
          "Membuat file Figma lebih lambat",
          "Mengurangi kompleksitas varian secara drastis dan menjaga memory file tetap ringan",
          "Menghilangkan kebutuhan akan auto-layout",
          "Mencegah developer mengunduh asset"
        ],
        correctIndex: 1,
        explanation: "Component Properties memungkinkan toggle ikon, perubahan teks, dan swap sub-komponen tanpa harus meledakkan kombinasi matrix varian yang membebani memori Figma."
      }
    ]
  },
  {
    id: "q-threejs",
    name: "Three.js & WebGL Interactive Shaders",
    category: "Frontend 3D",
    categoryLabel: "Interactive 3D Web",
    questionsCount: 5,
    timeLimitSeconds: 300,
    timeLimitDisplay: "5 Menit",
    xpReward: 500,
    badgeName: "3D Web Master",
    badgeIcon: "🌐",
    description: "Uji pemahaman rendering WebGL, scene graph Three.js, React Three Fiber (R3F), GLSL vertex/fragment shaders, dan optimasi GPU.",
    passingScore: 80,
    questions: [
      {
        id: "q-threejs-1",
        question: "Langkah penting apa yang HARUS dilakukan pada Three.js saat sebuah 3D Mesh atau Texture tidak lagi digunakan untuk mencegah kebocoran memori GPU (memory leak)?",
        options: [
          "Memanggil method `.dispose()` pada geometry, material, dan texture terkait",
          "Menyetel variabel ke `null` saja",
          "Menghapus canvas DOM element tanpa membersihkan WebGL context",
          "Mematikan monitor"
        ],
        correctIndex: 0,
        explanation: "Three.js mengalokasikan buffer memori langsung pada GPU. Menyetel variabel JS ke null tidak menghapus alokasi GPU WebGL; Anda harus secara eksplisit memanggil `geometry.dispose()` dan `material.dispose()`."
      },
      {
        id: "q-threejs-2",
        question: "Dalam GLSL shader, jenis shader manakah yang bertanggung jawab menghitung posisi titik 3D (koordinat vertices) sebelum rasterisasi?",
        options: [
          "Fragment Shader",
          "Vertex Shader",
          "Compute Shader 2D",
          "Raymarching Kernel"
        ],
        correctIndex: 1,
        explanation: "Vertex Shader memproses posisi titik-titik vertex 3D dan menghasilkan output `gl_Position`, sedangkan Fragment Shader menghitung warna piksel (`gl_FragColor`)."
      },
      {
        id: "q-threejs-3",
        question: "Di ekosistem React Three Fiber (R3F), hook manakah yang digunakan untuk mengeksekusi logika animasi setiap frame render loop?",
        options: [
          "useFrame((state, delta) => { ... })",
          "useLayoutEffect()",
          "useAnimationTick()",
          "useThreeScene()"
        ],
        correctIndex: 0,
        explanation: "`useFrame()` dari `@react-three/fiber` dipanggil secara kontinu pada setiap frame render loop (biasanya 60fps / 120fps) dengan parameter state dan delta time."
      },
      {
        id: "q-threejs-4",
        question: "Jenis material Three.js manakah yang bereaksi terhadap pencahayaan (light) dengan perhitungan specular highlight realistis menggunakan model Blinn-Phong?",
        options: [
          "MeshBasicMaterial",
          "MeshPhongMaterial atau MeshStandardMaterial",
          "MeshDepthMaterial",
          "MeshNormalMaterial"
        ],
        correctIndex: 1,
        explanation: "`MeshBasicMaterial` tidak bereaksi pada cahaya sama sekali. `MeshPhongMaterial` dan `MeshStandardMaterial` (PBR) menghitung interaksi cahaya dan bayangan secara realistis."
      },
      {
        id: "q-threejs-5",
        question: "Teknik apa yang paling efektif di Three.js untuk merender ribuan objek identik (misal: partikel debu, rumput, atau bintang) dalam satu draw call?",
        options: [
          "Membuat 10.000 Mesh terpisah dan menambahkannya ke scene",
          "InstancedMesh (Instanced Rendering)",
          "Menggunakan video element berulang",
          "Menggandakan canvas WebGL"
        ],
        correctIndex: 1,
        explanation: "`InstancedMesh` memanfaatkan hardware instancing GPU untuk menggambar ribuan objek yang berbagi geometry dan material yang sama hanya dalam satu kali draw call, menghemat CPU secara drastis."
      }
    ]
  },
  {
    id: "q-supabase-rls",
    name: "PostgreSQL & Supabase Row Level Security",
    category: "Database",
    categoryLabel: "Database & Security",
    questionsCount: 5,
    timeLimitSeconds: 300,
    timeLimitDisplay: "5 Menit",
    xpReward: 450,
    badgeName: "Supabase Security Specialist",
    badgeIcon: "🛡️",
    description: "Evaluasi penguasaan kebijakan Row Level Security (RLS), relasi PostgreSQL, trigger audit, dan proteksi multi-tenant di Supabase.",
    passingScore: 80,
    questions: [
      {
        id: "q-rls-1",
        question: "Klausa RLS PostgreSQL manakah yang memeriksa apakah user yang login memiliki izin untuk membaca baris data pada operasi SELECT?",
        codeSnippet: `CREATE POLICY "Users can only read own proposals"\nON proposals FOR SELECT\nUSING (auth.uid() = freelancer_id);`,
        options: [
          "WITH CHECK",
          "USING",
          "BEFORE INSERT",
          "RESTRICT"
        ],
        correctIndex: 1,
        explanation: "Klausa `USING` digunakan untuk memfilter baris yang ada (SELECT, UPDATE, DELETE), sedangkan `WITH CHECK` memvalidasi baris baru yang akan di-insert atau hasil modifikasi UPDATE."
      },
      {
        id: "q-rls-2",
        question: "Apa yang terjadi jika tabel PostgreSQL di Supabase memiliki `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;` tetapi belum ada satupun POLICY yang dibuat?",
        options: [
          "Semua user publik anonim bisa membaca dan menulis data bebas",
          "Semua query dari user non-superuser (termasuk authenticated & anon role) akan mengembalikan 0 baris (ditolak)",
          "Database otomatis rusak",
          "Supabase menonaktifkan autentikasi"
        ],
        correctIndex: 1,
        explanation: "Ketika RLS diaktifkan tanpa policy, PostgreSQL menerapkan default 'deny-all' untuk semua role standar (anon dan authenticated), sehingga tidak ada baris data yang bisa diakses."
      },
      {
        id: "q-rls-3",
        question: "Fungsi bawaan Supabase manakah yang mengembalikan UUID dari user yang saat ini sedang login melalui JWT token di dalam konteks SQL RLS?",
        options: [
          "current_user_name()",
          "auth.uid()",
          "session.get_id()",
          "jwt.user_token()"
        ],
        correctIndex: 1,
        explanation: "`auth.uid()` adalah helper function SQL di skema auth Supabase yang membaca field 'sub' dari JWT token user aktif."
      },
      {
        id: "q-rls-4",
        question: "Bagaimana cara membuat kolom foreign key di PostgreSQL yang otomatis menghapus data anak jika baris induknya dihapus?",
        options: [
          "ON DELETE CASCADE",
          "ON DELETE RESTRICT",
          "AUTO_REMOVE_CHILDREN = TRUE",
          "ON UPDATE NO ACTION"
        ],
        correctIndex: 0,
        explanation: "Constraint `ON DELETE CASCADE` pada foreign key memastikan semua baris dependen terhapus secara otomatis saat data utama dihapus, menjaga integritas referensial database."
      },
      {
        id: "q-rls-5",
        question: "Jenis index PostgreSQL manakah yang paling optimal untuk mempercepat pencarian teks penuh (Full-Text Search) multi-kata dalam deskripsi proyek?",
        options: [
          "B-Tree Index biasa",
          "GIN (Generalized Inverted Index) pada kolom `tsvector`",
          "Hash Index",
          "BRIN Index"
        ],
        correctIndex: 1,
        explanation: "Index GIN (Generalized Inverted Index) dikombinasikan dengan tipe data `tsvector` / `to_tsvector()` adalah standar industri PostgreSQL untuk Full-Text Search berkemampuan tinggi."
      }
    ]
  }
];

const LOCAL_STORAGE_QUIZ_RESULTS_KEY = "doable_freelancer_quiz_results";

/**
 * Get all completed quiz results for current user (from localStorage with fallbacks)
 */
export function getSavedQuizResults(): Record<string, QuizAttemptResult> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_QUIZ_RESULTS_KEY);
    if (!raw) {
      // Default seeded completions for initial demo experience
      const defaultSeeded: Record<string, QuizAttemptResult> = {
        "q-nextjs": {
          quizId: "q-nextjs",
          score: 100,
          passed: true,
          correctCount: 5,
          totalQuestions: 5,
          earnedXp: 350,
          badgeName: "Next.js Verified Pro",
          completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          userAnswers: [1, 1, 1, 0, 1]
        },
        "q-fastapi": {
          quizId: "q-fastapi",
          score: 100,
          passed: true,
          correctCount: 5,
          totalQuestions: 5,
          earnedXp: 400,
          badgeName: "FastAPI Certified",
          completedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          userAnswers: [1, 1, 1, 0, 0]
        }
      };
      localStorage.setItem(LOCAL_STORAGE_QUIZ_RESULTS_KEY, JSON.stringify(defaultSeeded));
      return defaultSeeded;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to read quiz results:", err);
    return {};
  }
}

/**
 * Save or update a quiz completion attempt and broadcast update event
 */
export function saveQuizResult(result: QuizAttemptResult): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getSavedQuizResults();
    existing[result.quizId] = result;
    localStorage.setItem(LOCAL_STORAGE_QUIZ_RESULTS_KEY, JSON.stringify(existing));

    // Also sync verified badge into profile skills if passed
    if (result.passed && result.badgeName) {
      syncBadgeToProfile(result.badgeName);
    }

    window.dispatchEvent(new CustomEvent("quiz-completed", { detail: result }));
  } catch (err) {
    console.warn("Failed to save quiz result:", err);
  }
}

function syncBadgeToProfile(badgeName: string): void {
  try {
    const rawCustomSkills = localStorage.getItem("doable_verified_badges");
    let badges: string[] = rawCustomSkills ? JSON.parse(rawCustomSkills) : [];
    if (!badges.includes(badgeName)) {
      badges.push(badgeName);
      localStorage.setItem("doable_verified_badges", JSON.stringify(badges));
      window.dispatchEvent(new CustomEvent("profile-updated"));
    }
  } catch (e) {
    console.warn("Could not sync badge to profile:", e);
  }
}
