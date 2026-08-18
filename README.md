# Doable!

> A freelance marketplace with gamified learning — where skills are verified through real courses, not self-reported resumes.

**Built with:** Next.js 14 · TypeScript · Tailwind CSS v3 · shadcn/ui · FastAPI · SQLAlchemy · Supabase · scikit-learn

---

## 📂 Project Structure

```
├── frontend/          → Next.js 14 (App Router) + TypeScript
├── backend/           → FastAPI (Python 3.12)
├── prisma/            → Prisma schema (for schema visualization)
├── .github/workflows/ → CI pipeline
├── docker-compose.yml → Local development
└── .env.example       → Environment template
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **Python** 3.12+
- **Docker** (optional, for local PostgreSQL)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd TripleT

# Frontend
cd frontend
npm install
cd ..

# Backend
cd backend
python -m venv venv
venv\Scripts\activate     # Windows
pip install -r requirements.txt
cd ..
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your Supabase keys (see Walkthrough for details)
```

### 3. Run Development Servers

**Frontend (Next.js):**
```bash
cd frontend
npm run dev
# → http://localhost:3000
```

**Backend (FastAPI):**
```bash
cd backend
uvicorn app.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs (Swagger UI)
```

**With Docker (backend + PostgreSQL):**
```bash
docker-compose up -d
```

### 4. Run Migrations

```bash
cd backend
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

---

## 🎨 Color Palette

| Name      | Hex       | Usage                     |
|-----------|-----------|---------------------------|
| Primary   | `#4A6CF7` | Buttons, links, accents   |
| Secondary | `#1E3A8A` | Headers, deep accents     |
| Tertiary  | `#6366F1` | Highlights, gradients     |
| Neutral   | `#64748B` | Text, borders, muted UI   |

---

## 📝 License

Private — All rights reserved.
