-- ============================================================================
-- Doable! — Seed Data Migration
-- ============================================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste & Run
-- This populates realistic demo clients, freelancers, projects, milestones,
-- tasks, proposals, contracts, reviews, and portfolio showcases.
-- ============================================================================

-- 1. SEED USERS
INSERT INTO public.users (id, email, full_name, avatar_url, bio, role, location, is_active, is_verified, onboarding_completed)
VALUES
  -- Clients
  (
    '11111111-1111-1111-1111-111111111111',
    'client.inovasi@doable.id',
    'PT Inovasi Digital Nusantara',
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=200&auto=format&fit=crop&q=80',
    'Perusahaan teknologi inkubator startup digital di Jakarta & Bandung.',
    'customer',
    'Jakarta Selatan, DKI Jakarta',
    true,
    true,
    true
  ),
  (
    '11111111-1111-1111-1111-222222222222',
    'kopi.kenari@umkm.id',
    'Kopi Seduh Kenari (UMKM)',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&auto=format&fit=crop&q=80',
    'Brand kedai kopi lokal dengan 5 cabang di Yogyakarta & Solo.',
    'customer',
    'Yogyakarta, DI Yogyakarta',
    true,
    true,
    true
  ),

  -- Freelancers (Indonesian Youth Digital Talents)
  (
    '22222222-2222-2222-2222-111111111111',
    'dimas.arya@student.itb.ac.id',
    'Dimas Arya Pratama',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'Senior Fullstack Engineer & Cloud Architect. Spesialis Next.js 14, Flutter, dan Supabase backend.',
    'freelancer',
    'Bandung, Jawa Barat',
    true,
    true,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'siti.rahmawati@alumni.ui.ac.id',
    'Siti Rahmawati',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    'Lead UI/UX Designer | Figma Atomic Design Systems, User Research & Interactive Prototype.',
    'freelancer',
    'Jakarta Selatan, DKI Jakarta',
    true,
    true,
    true
  ),
  (
    '22222222-2222-2222-2222-333333333333',
    'reza.mahendra@student.ugm.ac.id',
    'Reza Mahendra',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'AI & Machine Learning Engineer | FastAPI, OpenAI Realtime, LangChain & WebSockets.',
    'freelancer',
    'Yogyakarta, DI Yogyakarta',
    true,
    true,
    true
  ),
  (
    '22222222-2222-2222-2222-444444444444',
    'budi.santoso@binus.ac.id',
    'Budi Santoso',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    'Mobile Engineer | Flutter, Dart, Firebase & Midtrans Payment Gateway Solutions.',
    'freelancer',
    'Malang, Jawa Timur',
    true,
    true,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  role = EXCLUDED.role,
  location = EXCLUDED.location,
  is_verified = EXCLUDED.is_verified,
  onboarding_completed = EXCLUDED.onboarding_completed;


-- 2. SEED CLIENT PROFILES
INSERT INTO public.client_profiles (id, user_id, company_name, company_website, company_size, client_type, industry, is_verified)
VALUES
  (
    '33333333-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'PT Inovasi Digital Nusantara',
    'https://inovasidigital.id',
    '11-50 karyawan',
    'Perusahaan / Startup',
    'Software & Digital Agency',
    true
  ),
  (
    '33333333-1111-1111-1111-222222222222',
    '11111111-1111-1111-1111-222222222222',
    'Kopi Seduh Kenari',
    'https://instagram.com/kopiseduhkenari',
    '1-10 karyawan',
    'UMKM / Bisnis Lokal',
    'Food & Beverage',
    true
  )
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  is_verified = EXCLUDED.is_verified;


-- 3. SEED FREELANCER PROFILES
INSERT INTO public.freelancer_profiles (
  id, user_id, headline, hourly_rate, experience_level, availability, badge_level, category,
  skills, verified_skills, completed_projects, rating, reviews_count, response_time, total_earnings,
  organization, github_url, starting_price, cover_image, about_me
)
VALUES
  (
    '44444444-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-111111111111',
    'Senior Fullstack Engineer | Next.js 14, React, Supabase & Cloud Architect',
    175000,
    'Expert',
    'available',
    'Verified Pro',
    'Web Development',
    ARRAY['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Flutter', 'PostgreSQL'],
    ARRAY['Next.js', 'TypeScript', 'PostgreSQL'],
    42,
    4.9,
    38,
    '< 1 jam',
    145000000,
    'Institut Teknologi Bandung',
    'https://github.com/dimaspratama',
    'Rp 3.500.000',
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=600&auto=format&fit=crop&q=80',
    ARRAY['Fullstack developer dengan 4+ tahun pengalaman dalam ekosistem Next.js dan Supabase.', 'Telah membantu 30+ startup dan UMKM Indonesia meluncurkan produk digital skala produksi.']
  ),
  (
    '44444444-1111-1111-1111-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'Lead UI/UX Designer | Figma Atomic Design Systems & User Research',
    150000,
    'Expert',
    'available',
    'Top Rated',
    'UI/UX & Product Design',
    ARRAY['Figma', 'Atomic Design', 'Prototyping', 'Design Systems', 'User Research', 'Wireframing'],
    ARRAY['Figma', 'Design Systems'],
    56,
    5.0,
    52,
    '< 30 menit',
    112000000,
    'Universitas Indonesia',
    'https://dribbble.com/sitirahmawati',
    'Rp 2.800.000',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    ARRAY['Spesialis UI/UX modern dengan fokus pada usability, micro-interaction, dan aksesibilitas.', 'Berpengalaman mendesain aplikasi mobile FinTech dan dashboard B2B SaaS.']
  ),
  (
    '44444444-1111-1111-1111-333333333333',
    '22222222-2222-2222-2222-333333333333',
    'AI & Machine Learning Engineer | FastAPI, OpenAI Realtime & LangChain',
    250000,
    'Intermediate',
    'available',
    'Verified Pro',
    'AI & Machine Learning',
    ARRAY['Python', 'FastAPI', 'OpenAI API', 'LangChain', 'PyTorch', 'PostgreSQL'],
    ARRAY['Python', 'FastAPI'],
    31,
    4.9,
    29,
    '< 2 jam',
    98000000,
    'Universitas Gadjah Mada',
    'https://github.com/rezamahendra',
    'Rp 5.500.000',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80',
    ARRAY['Fokus membangun pipeline AI end-to-end, RAG chatbot pintar, dan integrasi model LLM ke produk bisnis nyata.']
  ),
  (
    '44444444-1111-1111-1111-444444444444',
    '22222222-2222-2222-2222-444444444444',
    'Mobile Engineer | Flutter, Dart, Firebase & Midtrans Solutions',
    180000,
    'Intermediate',
    'available',
    'Top Rated',
    'Mobile App Development',
    ARRAY['Flutter', 'Dart', 'Firebase', 'Midtrans', 'REST API', 'Riverpod'],
    ARRAY['Flutter', 'Dart'],
    39,
    4.8,
    24,
    '< 1 jam',
    85000000,
    'BINUS University',
    'https://github.com/budisantoso',
    'Rp 4.200.000',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    ARRAY['Spesialis Flutter untuk iOS & Android cross-platform dengan performa native 60fps.']
  )
ON CONFLICT (user_id) DO UPDATE SET
  headline = EXCLUDED.headline,
  hourly_rate = EXCLUDED.hourly_rate,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  completed_projects = EXCLUDED.completed_projects;


-- 4. SEED PROJECTS
INSERT INTO public.projects (
  id, owner_id, title, description, category, required_skills, difficulty, experience_level,
  budget_type, budget_min, budget_max, budget_display, timeline_days, status, is_dummy,
  proposals_count, objectives, escrow_secured, posted_at
)
VALUES
  -- Live Project 1: Mobile App Redesign
  (
    '55555555-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'E-Commerce Mobile App Redesign with Flutter',
    'Peremajaan total antarmuka UI/UX mobile app dengan arsitektur modular Flutter, integrasi gateway Midtrans, dan push notification Firebase.',
    'Mobile App Development',
    ARRAY['Flutter', 'Dart', 'Midtrans', 'Firebase', 'State Management'],
    'Standard',
    'Intermediate',
    'fixed',
    15000000,
    15000000,
    'Rp 15.000.000',
    14,
    'hiring',
    false,
    8,
    ARRAY['Desain antarmuka modern Flutter 60fps', 'Integrasi API Payment Gateway Midtrans', 'Testing dan upload ke Google Play Store'],
    true,
    now() - interval '2 days'
  ),

  -- Live Project 2: AI Chatbot Support
  (
    '55555555-1111-1111-1111-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'AI Customer Support Chatbot & WhatsApp Integration',
    'Membangun sistem chatbot AI pintar berbasis OpenAI API + LangChain yang terhubung langsung ke WhatsApp Cloud API untuk otomatisasi tanya jawab CS toko online 24/7.',
    'AI & Machine Learning',
    ARRAY['Python', 'FastAPI', 'OpenAI', 'LangChain', 'PostgreSQL'],
    'Enterprise',
    'Expert',
    'fixed',
    12000000,
    12000000,
    'Rp 12.000.000',
    21,
    'in_progress',
    false,
    6,
    ARRAY['Integrasi OpenAI RAG Pipeline', 'Webhook WhatsApp Cloud API', 'Dashboard analytics percakapan CS'],
    true,
    now() - interval '5 days'
  ),

  -- Live Project 3: UMKM Social Media Design
  (
    '55555555-1111-1111-1111-333333333333',
    '11111111-1111-1111-1111-222222222222',
    'Desain Poster Promosi Instagram Kopi Beli 1 Gratis 1',
    'Dibutuhkan desainer kreatif untuk membuat poster Instagram feed (1:1) dan story (9:16) promo Buy 1 Get 1 Matcha Latte untuk kedai kopi lokal.',
    'UI/UX & Product Design',
    ARRAY['Figma', 'Photoshop', 'Typography', 'Social Media'],
    'Starter',
    'Starter',
    'fixed',
    1500000,
    1500000,
    'Rp 1.500.000',
    5,
    'hiring',
    false,
    4,
    ARRAY['3 Variasi Banner Feed Instagram', '3 Variasi Banner Story Instagram', 'Source file Figma & PDF Siap Cetak'],
    true,
    now() - interval '1 hour'
  ),

  -- Dummy Portfolio Project: Rebranding Coffee Shop (For Youth Training)
  (
    '55555555-1111-1111-1111-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'Simulasi Kasus: Rebranding Identitas Visual Kedai Kopi Lokal',
    'Kerjakan brief realistis desain logo, cup packaging, dan banner promo untuk membangun bukti portofolio terverifikasi pertama Anda di ekosistem Doable!.',
    'UI/UX & Product Design',
    ARRAY['Brand Identity', 'Logo Design', 'Packaging', 'Figma'],
    'Starter',
    'Starter',
    'fixed',
    0,
    0,
    'Simulasi Portofolio',
    7,
    'open',
    true,
    18,
    ARRAY['Eksplorasi Moodboard & Filosofi Logo', 'Packaging Desain Paper Cup & Box', 'Brand Guidelines Singkat'],
    false,
    now() - interval '1 day'
  ),

  -- Live Project 4: SaaS Dashboard Next.js
  (
    '55555555-1111-1111-1111-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'Build Responsive SaaS Analytics Dashboard with Next.js 14',
    'Membangun dashboard SaaS responsif dengan dark mode, visual chart interaktif, dan micro-animation yang mulus menggunakan Next.js 14 App Router.',
    'Web Development',
    ARRAY['Next.js', 'TypeScript', 'Tailwind CSS', 'React', 'Recharts'],
    'Standard',
    'Intermediate',
    'fixed',
    6500000,
    6500000,
    'Rp 6.500.000',
    14,
    'hiring',
    false,
    5,
    ARRAY['Responsive layout desktop & mobile', 'Integrasi Recharts & Supabase Realtime', 'Dark/Light theme toggle'],
    true,
    now() - interval '3 hours'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  budget_display = EXCLUDED.budget_display,
  status = EXCLUDED.status,
  proposals_count = EXCLUDED.proposals_count;


-- 5. SEED MILESTONES
INSERT INTO public.milestones (id, project_id, phase, title, description, percentage, amount, amount_display, deliverables, sort_order)
VALUES
  -- Milestones for Project 1 (Mobile App)
  (
    '66666666-1111-1111-1111-111111111111',
    '55555555-1111-1111-1111-111111111111',
    'Phase 1',
    'Setup Project & UI Kit Implementation (40%)',
    'Konfigurasi repository Flutter, setup state management, dan styling widget sesuai mockup.',
    40,
    6000000,
    'Rp 6.000.000',
    ARRAY['Flutter codebase repo', 'UI Components Kit'],
    1
  ),
  (
    '66666666-1111-1111-1111-222222222222',
    '55555555-1111-1111-1111-111111111111',
    'Phase 2',
    'API Integration, Checkout & Final Handover (60%)',
    'Integrasi API Midtrans, push notification Firebase, dan deployment testing APK/IPA.',
    60,
    9000000,
    'Rp 9.000.000',
    ARRAY['Payment Gateway working flow', 'Final Release APK'],
    2
  ),

  -- Milestones for Project 2 (AI Chatbot)
  (
    '66666666-1111-1111-1111-333333333333',
    '55555555-1111-1111-1111-222222222222',
    'Phase 1',
    'FastAPI & OpenAI Embeddings Setup (50%)',
    'Setup vector search PostgreSQL dan endpoint REST API.',
    50,
    6000000,
    'Rp 6.000.000',
    ARRAY['FastAPI Backend API', 'Vector Embeddings'],
    1
  ),
  (
    '66666666-1111-1111-1111-444444444444',
    '55555555-1111-1111-1111-222222222222',
    'Phase 2',
    'WhatsApp Webhook & Production Deployment (50%)',
    'Menghubungkan webhook Meta WhatsApp dan deploy ke cloud server.',
    50,
    6000000,
    'Rp 6.000.000',
    ARRAY['WhatsApp webhook verified', 'Cloud production server'],
    2
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  amount_display = EXCLUDED.amount_display;


-- 6. SEED AUTO-GENERATED PROJECT TASKS (Gantt chart items)
INSERT INTO public.project_tasks (id, project_id, milestone_id, name, description, status, start_date, end_date, sort_order, is_auto_generated)
VALUES
  (
    '77777777-1111-1111-1111-111111111111',
    '55555555-1111-1111-1111-111111111111',
    '66666666-1111-1111-1111-111111111111',
    'Setup Project Architecture & Riverpod State',
    'Struktur folder modular Flutter & tema warna.',
    'completed',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE - INTERVAL '2 days',
    1,
    true
  ),
  (
    '77777777-1111-1111-1111-222222222222',
    '55555555-1111-1111-1111-111111111111',
    '66666666-1111-1111-1111-111111111111',
    'Slicing UI Mockup & Catalog Product Flow',
    'Implementasi halaman katalog dan filter kategori.',
    'in_progress',
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '3 days',
    2,
    true
  ),
  (
    '77777777-1111-1111-1111-333333333333',
    '55555555-1111-1111-1111-111111111111',
    '66666666-1111-1111-1111-222222222222',
    'Integrasi Midtrans Snap SDK & Firebase',
    'Webhook verifikasi status pembayaran otomatis.',
    'planned',
    CURRENT_DATE + INTERVAL '4 days',
    CURRENT_DATE + INTERVAL '8 days',
    3,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status;


-- 7. SEED PROPOSALS
INSERT INTO public.proposals (id, project_id, freelancer_id, bid_amount, bid_display, delivery_days, cover_letter, skills, status)
VALUES
  (
    '88888888-1111-1111-1111-111111111111',
    '55555555-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-111111111111',
    14500000,
    'Rp 14.500.000',
    12,
    'Halo! Saya berpengalaman 4+ tahun dalam Flutter dan arsitektur modular. Siap mengerjakan redesign mobile app ini lengkap dengan integrasi Midtrans dan Firebase dalam 12 hari sprint.',
    ARRAY['Flutter', 'Dart', 'Midtrans', 'Firebase'],
    'pending'
  ),
  (
    '88888888-1111-1111-1111-222222222222',
    '55555555-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-444444444444',
    15000000,
    'Rp 15.000.000',
    14,
    'Halo! Saya spesialis mobile Flutter dari Malang. Portofolio saya mencakup 5 aplikasi e-commerce yang sudah live di Play Store. Saya siap menjamin performa 60fps bebas jank.',
    ARRAY['Flutter', 'Dart', 'Firebase'],
    'pending'
  )
ON CONFLICT (project_id, freelancer_id) DO UPDATE SET
  bid_amount = EXCLUDED.bid_amount,
  status = EXCLUDED.status;


-- 8. SEED CONTRACTS (Active Workspace Example)
INSERT INTO public.contracts (
  id, project_id, proposal_id, client_id, freelancer_id, total_amount, amount_display,
  status, progress, deadline, started_at
)
VALUES
  (
    '99999999-1111-1111-1111-111111111111',
    '55555555-1111-1111-1111-222222222222',
    NULL,
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-333333333333',
    12000000,
    'Rp 12.000.000',
    'active',
    60,
    now() + interval '10 days',
    now() - interval '5 days'
  )
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  progress = EXCLUDED.progress;


-- 9. SEED REVIEWS
INSERT INTO public.reviews (id, contract_id, reviewer_id, reviewee_id, rating, comment, is_public)
VALUES
  (
    'aaaaaaaa-1111-1111-1111-111111111111',
    '99999999-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-333333333333',
    5.0,
    'Komunikasi sangat cepat, kode rapi terdokumentasi, dan integrasi WhatsApp API selesai sebelum deadline. Sangat direkomendasikan!',
    true
  )
ON CONFLICT (contract_id, reviewer_id) DO UPDATE SET
  rating = EXCLUDED.rating,
  comment = EXCLUDED.comment;

-- ============================================================================
-- SEED COMPLETE! All demo users, profiles, projects, and milestones are ready.
-- ============================================================================
