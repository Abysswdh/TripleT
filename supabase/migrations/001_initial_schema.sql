-- ============================================================================
-- Doable! — Initial Database Schema Migration
-- ============================================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste & Run
-- This creates all 22 tables, triggers, RLS policies, indexes, and storage.
-- ============================================================================

-- 0. Enable UUID extension (should already be enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- UTILITY: Auto-update `updated_at` trigger function
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- DOMAIN 1: USERS
-- ============================================================================

-- 1. users (core identity — synced from Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY,  -- matches auth.users.id
  email          VARCHAR(255) NOT NULL UNIQUE,
  full_name      VARCHAR(255),
  avatar_url     TEXT,
  bio            TEXT,
  role           VARCHAR(50) NOT NULL DEFAULT 'customer',
  phone          VARCHAR(30),
  location       VARCHAR(255),
  timezone       VARCHAR(100),
  is_active      BOOLEAN NOT NULL DEFAULT true,
  is_verified    BOOLEAN NOT NULL DEFAULT false,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user row when Supabase Auth user signs up
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer'),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on Supabase Auth
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();


-- 2. freelancer_profiles
CREATE TABLE IF NOT EXISTS freelancer_profiles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  headline          VARCHAR(500),
  hourly_rate       INTEGER,
  experience_level  VARCHAR(50),
  availability      VARCHAR(30) DEFAULT 'available',
  badge_level       VARCHAR(50),
  category          VARCHAR(100),
  skills            TEXT[] DEFAULT '{}',
  verified_skills   TEXT[] DEFAULT '{}',
  completed_projects INTEGER DEFAULT 0,
  rating            NUMERIC(3,2) DEFAULT 0.00,
  reviews_count     INTEGER DEFAULT 0,
  response_time     VARCHAR(20),
  total_earnings    BIGINT DEFAULT 0,
  organization      VARCHAR(255),
  github_url        TEXT,
  linkedin_url      TEXT,
  portfolio_url     TEXT,
  starting_price    VARCHAR(100),
  cover_image       TEXT,
  about_me          TEXT[] DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER freelancer_profiles_updated_at
  BEFORE UPDATE ON freelancer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 3. client_profiles
CREATE TABLE IF NOT EXISTS client_profiles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name     VARCHAR(255),
  company_website  TEXT,
  company_size     VARCHAR(100),
  client_type      VARCHAR(50),
  industry         VARCHAR(100),
  billing_address  TEXT,
  tax_id           VARCHAR(100),
  is_verified      BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER client_profiles_updated_at
  BEFORE UPDATE ON client_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 4. identity_verifications
CREATE TABLE IF NOT EXISTS identity_verifications (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  document_type      VARCHAR(30) NOT NULL,  -- 'ktp', 'passport'
  document_number    VARCHAR(100),
  document_image_url TEXT,
  selfie_image_url   TEXT,
  status             VARCHAR(30) DEFAULT 'pending',  -- 'pending','approved','rejected'
  rejection_reason   TEXT,
  verified_at        TIMESTAMPTZ,
  reviewed_by        UUID REFERENCES users(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER identity_verifications_updated_at
  BEFORE UPDATE ON identity_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- DOMAIN 2: PROJECTS
-- ============================================================================

-- 5. projects
CREATE TABLE IF NOT EXISTS projects (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  freelancer_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  title            VARCHAR(255) NOT NULL,
  description      TEXT NOT NULL,
  category         VARCHAR(100),
  required_skills  TEXT[] DEFAULT '{}',
  difficulty       VARCHAR(30),        -- 'Starter','Standard','Enterprise'
  experience_level VARCHAR(50),
  budget_type      VARCHAR(20) NOT NULL DEFAULT 'fixed',
  budget_min       INTEGER,
  budget_max       INTEGER,
  budget_display   VARCHAR(100),
  timeline_days    INTEGER,
  status           VARCHAR(30) NOT NULL DEFAULT 'draft',
  is_dummy         BOOLEAN NOT NULL DEFAULT false,
  proposals_count  INTEGER DEFAULT 0,
  objectives       TEXT[] DEFAULT '{}',
  benchmark_score  VARCHAR(100),
  benchmark_note   TEXT,
  escrow_secured   BOOLEAN DEFAULT false,
  posted_at        TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 6. milestones
CREATE TABLE IF NOT EXISTS milestones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase           VARCHAR(50),
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  percentage      INTEGER,
  amount          BIGINT,
  amount_display  VARCHAR(100),
  deliverables    TEXT[] DEFAULT '{}',
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 7. project_tasks (auto-generated Gantt chart items)
CREATE TABLE IF NOT EXISTS project_tasks (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id        UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id      UUID REFERENCES milestones(id) ON DELETE SET NULL,
  name              VARCHAR(255) NOT NULL,
  description       TEXT,
  status            VARCHAR(30) DEFAULT 'planned',
  start_date        DATE,
  end_date          DATE,
  sort_order        INTEGER DEFAULT 0,
  is_auto_generated BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER project_tasks_updated_at
  BEFORE UPDATE ON project_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- DOMAIN 3: MARKETPLACE
-- ============================================================================

-- 8. proposals
CREATE TABLE IF NOT EXISTS proposals (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  freelancer_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bid_amount     BIGINT NOT NULL,
  bid_display    VARCHAR(100),
  delivery_days  INTEGER NOT NULL,
  cover_letter   TEXT NOT NULL,
  skills         TEXT[] DEFAULT '{}',
  status         VARCHAR(30) DEFAULT 'pending',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(project_id, freelancer_id)
);

CREATE TRIGGER proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 9. talent_invitations
CREATE TABLE IF NOT EXISTS talent_invitations (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  client_id      UUID NOT NULL REFERENCES users(id),
  freelancer_id  UUID NOT NULL REFERENCES users(id),
  message        TEXT,
  status         VARCHAR(30) DEFAULT 'pending',
  responded_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(project_id, freelancer_id)
);


-- ============================================================================
-- DOMAIN 4: WORK MANAGEMENT
-- ============================================================================

-- 10. contracts
CREATE TABLE IF NOT EXISTS contracts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID NOT NULL REFERENCES projects(id),
  proposal_id     UUID UNIQUE REFERENCES proposals(id),
  client_id       UUID NOT NULL REFERENCES users(id),
  freelancer_id   UUID NOT NULL REFERENCES users(id),
  total_amount    BIGINT NOT NULL,
  amount_display  VARCHAR(100),
  status          VARCHAR(30) DEFAULT 'active',
  progress        INTEGER DEFAULT 0,
  deadline        TIMESTAMPTZ,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 11. contract_milestones
CREATE TABLE IF NOT EXISTS contract_milestones (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id   UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  milestone_id  UUID REFERENCES milestones(id),
  title         VARCHAR(255) NOT NULL,
  amount        BIGINT NOT NULL,
  percentage    INTEGER,
  status        VARCHAR(30) DEFAULT 'locked',
  due_date      TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 12. escrow_transactions
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id           UUID NOT NULL REFERENCES contracts(id),
  contract_milestone_id UUID REFERENCES contract_milestones(id),
  type                  VARCHAR(30) NOT NULL,  -- 'hold','release','refund'
  amount                BIGINT NOT NULL,
  status                VARCHAR(30) DEFAULT 'pending',
  notes                 TEXT,
  processed_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================================
-- DOMAIN 5: COMMUNICATION
-- ============================================================================

-- 13. conversations
CREATE TABLE IF NOT EXISTS conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id     UUID REFERENCES contracts(id) ON DELETE SET NULL,
  project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
  title           VARCHAR(255),
  type            VARCHAR(30) DEFAULT 'project',  -- 'project','direct','support'
  is_archived     BOOLEAN DEFAULT false,
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 14. messages
CREATE TABLE IF NOT EXISTS messages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id        UUID NOT NULL REFERENCES users(id),
  content          TEXT NOT NULL,
  type             VARCHAR(30) DEFAULT 'text',  -- 'text','file','system','milestone_update'
  file_url         TEXT,
  file_name        VARCHAR(255),
  file_size        BIGINT,
  is_read          BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 15. conversation_participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role             VARCHAR(20) DEFAULT 'member',
  last_read_at     TIMESTAMPTZ,
  joined_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(conversation_id, user_id)
);


-- 16. project_files
CREATE TABLE IF NOT EXISTS project_files (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by  UUID NOT NULL REFERENCES users(id),
  file_name    VARCHAR(255) NOT NULL,
  file_url     TEXT NOT NULL,
  file_size    BIGINT,
  file_type    VARCHAR(100),
  category     VARCHAR(50),  -- 'deliverable','brief','reference','revision','other'
  milestone_id UUID REFERENCES milestones(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================================
-- DOMAIN 6: FEEDBACK & DISCOVERY
-- ============================================================================

-- 17. reviews
CREATE TABLE IF NOT EXISTS reviews (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id  UUID NOT NULL REFERENCES contracts(id),
  reviewer_id  UUID NOT NULL REFERENCES users(id),
  reviewee_id  UUID NOT NULL REFERENCES users(id),
  rating       NUMERIC(2,1) NOT NULL,
  comment      TEXT,
  is_public    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(contract_id, reviewer_id)
);


-- 18. portfolio_projects
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contract_id   UUID REFERENCES contracts(id),
  title         VARCHAR(255) NOT NULL,
  category      VARCHAR(100),
  description   TEXT,
  image_url     TEXT,
  tags          TEXT[] DEFAULT '{}',
  is_featured   BOOLEAN DEFAULT false,
  is_from_dummy BOOLEAN DEFAULT false,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 19. saved_talents
CREATE TABLE IF NOT EXISTS saved_talents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(client_id, freelancer_id)
);


-- 20. bookmarked_projects
CREATE TABLE IF NOT EXISTS bookmarked_projects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(freelancer_id, project_id)
);


-- ============================================================================
-- DOMAIN 7: SETTINGS
-- ============================================================================

-- 21. notifications
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            VARCHAR(50) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  body            TEXT,
  reference_type  VARCHAR(50),
  reference_id    UUID,
  is_read         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 22. user_notification_settings
CREATE TABLE IF NOT EXISTS user_notification_settings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_proposals   BOOLEAN DEFAULT true,
  email_milestones  BOOLEAN DEFAULT true,
  email_messages    BOOLEAN DEFAULT true,
  email_marketing   BOOLEAN DEFAULT false,
  in_app_milestones BOOLEAN DEFAULT true,
  in_app_chat       BOOLEAN DEFAULT true,
  sound_effects     BOOLEAN DEFAULT true,
  language          VARCHAR(10) DEFAULT 'id',
  currency          VARCHAR(10) DEFAULT 'IDR',
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER user_notification_settings_updated_at
  BEFORE UPDATE ON user_notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- INDEXES (Performance)
-- ============================================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Freelancer Profiles
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_category ON freelancer_profiles(category);
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_availability ON freelancer_profiles(availability);
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_rating ON freelancer_profiles(rating DESC);

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_freelancer_id ON projects(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_is_dummy ON projects(is_dummy);
CREATE INDEX IF NOT EXISTS idx_projects_posted_at ON projects(posted_at DESC NULLS LAST);

-- Milestones
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);

-- Project Tasks
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);

-- Proposals
CREATE INDEX IF NOT EXISTS idx_proposals_project_id ON proposals(project_id);
CREATE INDEX IF NOT EXISTS idx_proposals_freelancer_id ON proposals(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);

-- Contracts
CREATE INDEX IF NOT EXISTS idx_contracts_project_id ON contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_freelancer_id ON contracts(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);

-- Portfolio Projects
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_user_id ON portfolio_projects(user_id);


-- ============================================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_talents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarked_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;

-- ---- users ----
CREATE POLICY "Users can view all users"
  ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE TO authenticated USING (auth.uid() = id);

-- ---- freelancer_profiles ----
CREATE POLICY "Anyone can view freelancer profiles"
  ON freelancer_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Freelancers can manage own profile"
  ON freelancer_profiles FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ---- client_profiles ----
CREATE POLICY "Anyone can view client profiles"
  ON client_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Clients can manage own profile"
  ON client_profiles FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ---- identity_verifications ----
CREATE POLICY "Users can view own verification"
  ON identity_verifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own verification"
  ON identity_verifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ---- projects ----
CREATE POLICY "Anyone can view open projects"
  ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owners can create projects"
  ON projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own projects"
  ON projects FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own projects"
  ON projects FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- ---- milestones ----
CREATE POLICY "Milestones viewable by project participants"
  ON milestones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Project owners can manage milestones"
  ON milestones FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = milestones.project_id AND projects.owner_id = auth.uid()));

-- ---- project_tasks ----
CREATE POLICY "Tasks viewable by project participants"
  ON project_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Project owners can manage tasks"
  ON project_tasks FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_tasks.project_id AND projects.owner_id = auth.uid()));

-- ---- proposals ----
CREATE POLICY "Project owners can view proposals"
  ON proposals FOR SELECT TO authenticated
  USING (
    auth.uid() = freelancer_id
    OR EXISTS (SELECT 1 FROM projects WHERE projects.id = proposals.project_id AND projects.owner_id = auth.uid())
  );
CREATE POLICY "Freelancers can create proposals"
  ON proposals FOR INSERT TO authenticated WITH CHECK (auth.uid() = freelancer_id);
CREATE POLICY "Freelancers can update own proposals"
  ON proposals FOR UPDATE TO authenticated USING (auth.uid() = freelancer_id);

-- ---- talent_invitations ----
CREATE POLICY "Invitation participants can view"
  ON talent_invitations FOR SELECT TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = freelancer_id);
CREATE POLICY "Clients can create invitations"
  ON talent_invitations FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);

-- ---- contracts ----
CREATE POLICY "Contract participants can view"
  ON contracts FOR SELECT TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = freelancer_id);
CREATE POLICY "Contract participants can update"
  ON contracts FOR UPDATE TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = freelancer_id);

-- ---- contract_milestones ----
CREATE POLICY "Contract milestone participants can view"
  ON contract_milestones FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM contracts WHERE contracts.id = contract_milestones.contract_id AND (contracts.client_id = auth.uid() OR contracts.freelancer_id = auth.uid())));

-- ---- escrow_transactions ----
CREATE POLICY "Escrow participants can view"
  ON escrow_transactions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM contracts WHERE contracts.id = escrow_transactions.contract_id AND (contracts.client_id = auth.uid() OR contracts.freelancer_id = auth.uid())));

-- ---- conversations ----
CREATE POLICY "Conversation participants can view"
  ON conversations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_participants.conversation_id = conversations.id AND conversation_participants.user_id = auth.uid()));

-- ---- messages ----
CREATE POLICY "Conversation members can view messages"
  ON messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_participants.conversation_id = messages.conversation_id AND conversation_participants.user_id = auth.uid()));
CREATE POLICY "Conversation members can send messages"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_participants.conversation_id = messages.conversation_id AND conversation_participants.user_id = auth.uid()));

-- ---- conversation_participants ----
CREATE POLICY "Participants can view own conversations"
  ON conversation_participants FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ---- project_files ----
CREATE POLICY "Project files viewable by participants"
  ON project_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can upload files"
  ON project_files FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);

-- ---- reviews ----
CREATE POLICY "Reviews are publicly viewable"
  ON reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Contract participants can create reviews"
  ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);

-- ---- portfolio_projects ----
CREATE POLICY "Portfolio projects are publicly viewable"
  ON portfolio_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own portfolio"
  ON portfolio_projects FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ---- saved_talents ----
CREATE POLICY "Users can view own saved talents"
  ON saved_talents FOR SELECT TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Users can manage own saved talents"
  ON saved_talents FOR ALL TO authenticated USING (auth.uid() = client_id);

-- ---- bookmarked_projects ----
CREATE POLICY "Users can view own bookmarks"
  ON bookmarked_projects FOR SELECT TO authenticated USING (auth.uid() = freelancer_id);
CREATE POLICY "Users can manage own bookmarks"
  ON bookmarked_projects FOR ALL TO authenticated USING (auth.uid() = freelancer_id);

-- ---- notifications ----
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ---- user_notification_settings ----
CREATE POLICY "Users can view own settings"
  ON user_notification_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own settings"
  ON user_notification_settings FOR ALL TO authenticated USING (auth.uid() = user_id);


-- ============================================================================
-- SUPABASE STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('project-files', 'project-files', false, 52428800, ARRAY['image/jpeg','image/png','image/gif','image/webp','application/pdf','application/zip','text/plain','text/csv']),
  ('identity-docs', 'identity-docs', false, 10485760, ARRAY['image/jpeg','image/png','image/webp','application/pdf']),
  ('chat-attachments', 'chat-attachments', false, 26214400, ARRAY['image/jpeg','image/png','image/gif','image/webp','application/pdf','application/zip','text/plain'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: project-files
CREATE POLICY "Authenticated users can upload project files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-files');
CREATE POLICY "Authenticated users can view project files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'project-files');

-- Storage RLS: identity-docs (private — only own docs)
CREATE POLICY "Users can upload own identity docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'identity-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own identity docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'identity-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage RLS: chat-attachments
CREATE POLICY "Authenticated users can upload chat attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-attachments');
CREATE POLICY "Authenticated users can view chat attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'chat-attachments');


-- ============================================================================
-- PERMISSIONS & ROLES
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;


-- ============================================================================
-- DONE! All 22 tables, triggers, RLS policies, indexes, and storage created.
-- ============================================================================
