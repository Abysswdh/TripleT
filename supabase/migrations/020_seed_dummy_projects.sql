-- ============================================================================
-- Migration 020: Seed Dummy Projects for Youth Portfolio Simulation (0-to-1)
-- ============================================================================

-- 1. Ensure System Academy User exists in public.users
INSERT INTO public.users (
  id, email, full_name, avatar_url, bio, role, location, is_active, is_verified, onboarding_completed
)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'academy@doable.id',
  'Doable! Sandbox Academy',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80',
  'Lembaga simulasi dan inkubasi kasus riil untuk melatih talenta muda membangun portofolio 0-to-1.',
  'customer',
  'Jakarta, Indonesia',
  true,
  true,
  true
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url;

-- 2. Seed 3 Dummy Simulation Projects matching the Landing Page promises
INSERT INTO public.projects (
  id, owner_id, title, description, category, required_skills, difficulty, experience_level,
  budget_type, budget_min, budget_max, budget_display, timeline_days, status, is_dummy,
  proposals_count, objectives, escrow_secured, posted_at
)
VALUES
  -- Brief 1: Branding & Logo (KopiSenja)
  (
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Desain Brand Identity Kopi Artisan ''KopiSenja''',
    'Brief simulasi untuk kedai kopi lokal KopiSenja. Buat logo minimalis modern, skema warna earthy, eksplorasi moodboard konsep, dan mockup kemasan cup paper untuk membangun portofolio awal Anda.',
    'Desain & Branding',
    ARRAY['Adobe Illustrator', 'Logo Design', 'Mockup Presentation', 'Branding'],
    'Starter',
    'Junior',
    'fixed',
    0,
    0,
    'Simulasi Portofolio',
    5,
    'open',
    true,
    0,
    ARRAY['Riset Konsep, Moodboard & Filosofi Logo KopiSenja', 'Desain Vektor Logo Utama, Alternatif, dan Tipografi', 'Mockup Desain Paper Cup & Panduan Brand Guidelines Singkat'],
    false,
    now() - interval '2 hours'
  ),

  -- Brief 2: UI/UX & Mobile App (SayurFresh)
  (
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'UI/UX Mobile App Marketplace Sayur Organik ''SayurFresh''',
    'Desain antarmuka 5 layar utama aplikasi belanja sayur lokal SayurFresh: Beranda Katalog, Detail Produk Sayur, Keranjang Belanja, Checkout, dan Live Tracking Kurir.',
    'Web & IT Engineering',
    ARRAY['Figma', 'Mobile UI', 'Prototyping', 'Design Systems'],
    'Standard',
    'Intermediate',
    'fixed',
    0,
    0,
    'Simulasi Portofolio',
    7,
    'open',
    true,
    0,
    ARRAY['User Flow & Wireframing 5 Layar Utama', 'High-Fidelity UI Design Berbasis Komponen Modern', 'Interactive Clickable Prototype Figma Siap Uji Pengguna'],
    false,
    now() - interval '4 hours'
  ),

  -- Brief 3: Video Reel & Social Media (GlowGen)
  (
    'd0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Video Reel & Banner Promosi Produk Skincare ''GlowGen''',
    'Sunting video reel vertikal 30 detik dan rancang 3 variasi banner feed untuk kampanye media sosial peluncuran serum wajah GlowGen menggunakan aset stok & musik berlisensi.',
    'Foto & Video Kreatif',
    ARRAY['CapCut / Premiere', 'Short-Form Video', 'Storyboarding', 'Canva'],
    'Starter',
    'Junior',
    'fixed',
    0,
    0,
    'Simulasi Portofolio',
    4,
    'open',
    true,
    0,
    ARRAY['Storyboard & Hook Naskah Video 30 Detik', 'Editing Video Vertikal 9:16 dengan Subtitle Dinamis', 'Paket 3 Banner Feed Instagram Peluncuran Promo'],
    false,
    now() - interval '6 hours'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  required_skills = EXCLUDED.required_skills,
  is_dummy = EXCLUDED.is_dummy,
  budget_display = EXCLUDED.budget_display,
  objectives = EXCLUDED.objectives;

-- 3. Milestones for each Dummy Project
INSERT INTO public.milestones (
  id, project_id, phase, title, description, percentage, amount, amount_display, deliverables, sort_order, status
)
VALUES
  -- Milestones for Project 1 (KopiSenja)
  (
    'd0000000-0000-0001-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'Milestone 1',
    'Konsep Logo, Moodboard & Eksplorasi Visual',
    'Eksplorasi moodboard gaya visual kedai kopi, sketsa konsep logo awal, dan palet warna earthy.',
    50,
    0,
    'Simulasi',
    ARRAY['File konsep logo (.ai/.figma)', 'Moodboard warna'],
    1,
    'pending'
  ),
  (
    'd0000000-0000-0001-0000-000000000002',
    'd0000000-0000-0000-0000-000000000001',
    'Milestone 2',
    'Mockup Kemasan Cup & Mini Brand Guidelines',
    'Penerapan logo pada mockup kemasan paper cup kopi serta mini guidelines panduan tipografi.',
    50,
    0,
    'Simulasi',
    ARRAY['Mockup cup 3D (.png/.jpg)', 'Mini brand guideline PDF'],
    2,
    'pending'
  ),

  -- Milestones for Project 2 (SayurFresh)
  (
    'd0000000-0000-0002-0000-000000000001',
    'd0000000-0000-0000-0000-000000000002',
    'Milestone 1',
    'Wireframe & User Flow 5 Layar Utama',
    'Wireframe low-fidelity dan diagram alur pemesanan sayur dari katalog hingga checkout.',
    50,
    0,
    'Simulasi',
    ARRAY['Wireframe Figma Link', 'User flow diagram'],
    1,
    'pending'
  ),
  (
    'd0000000-0000-0002-0000-000000000002',
    'd0000000-0000-0000-0000-000000000002',
    'Milestone 2',
    'Hi-Fi Design System & Clickable Prototype',
    'Desain antarmuka resolusi tinggi 5 layar beserta prototype interaktif di Figma.',
    50,
    0,
    'Simulasi',
    ARRAY['Figma Hi-Fi Prototype Link', 'Component library UI kit'],
    2,
    'pending'
  ),

  -- Milestones for Project 3 (GlowGen)
  (
    'd0000000-0000-0003-0000-000000000001',
    'd0000000-0000-0000-0000-000000000003',
    'Milestone 1',
    'Storyboard & Hook Naskah Video 30 Detik',
    'Naskah copywriting video promosi skincare 30 detik berdurasi cepat beserta rancangan storyboard visual.',
    50,
    0,
    'Simulasi',
    ARRAY['Naskah copywriting hook', 'Storyboard frame referensi'],
    1,
    'pending'
  ),
  (
    'd0000000-0000-0003-0000-000000000002',
    'd0000000-0000-0000-0000-000000000003',
    'Milestone 2',
    'Final Video 9:16 & Asset Carousel Feed 1:1',
    'File video reel vertikal 1080x1920 MP4 dan paket 3 desain banner feed Instagram persegi.',
    50,
    0,
    'Simulasi',
    ARRAY['Video MP4 Google Drive link', '3 Banner JPG High-Res'],
    2,
    'pending'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  phase = EXCLUDED.phase,
  description = EXCLUDED.description,
  deliverables = EXCLUDED.deliverables,
  percentage = EXCLUDED.percentage;
