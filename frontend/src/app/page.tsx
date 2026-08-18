import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Zap,
  Users,
  BarChart3,
  CheckCircle2,
  Star,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

export default function CustomerLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Doable<span className="text-primary">!</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              How It Works
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-600 hover:shadow-xl hover:shadow-primary/30"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-tertiary/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-secondary/3 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI-Powered Talent Matching</span>
            </div>

            <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              Find{" "}
              <span className="bg-gradient-to-r from-primary via-tertiary to-secondary bg-clip-text text-transparent">
                Verified Talent
              </span>{" "}
              That Delivers
            </h1>

            <p className="mb-10 text-lg leading-relaxed text-muted-foreground md:text-xl">
              Stop scrolling through unqualified freelancers. Doable! uses AI to match
              your projects with skill-verified talent — backed by real learning
              progress, not just self-reported resumes.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary-600 hover:shadow-2xl hover:shadow-primary/30"
              >
                Post a Project — Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-base font-semibold transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                See How It Works
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/60 to-tertiary/60"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  <strong className="text-foreground">500+</strong> clients trust Doable!
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1 text-sm text-muted-foreground">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-border/40 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Why Clients Choose <span className="text-primary">Doable!</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Not just another freelance marketplace — we verify skills through real
              learning, so you get talent that&apos;s truly qualified.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Verified Skills",
                description:
                  "Every freelancer earns badges through hands-on micro-courses. No fake resumes — only proven competencies.",
                color: "from-primary/10 to-primary/5",
                iconColor: "text-primary",
              },
              {
                icon: Zap,
                title: "AI Smart Matching",
                description:
                  "Our AI analyzes your project requirements and matches you with the most qualified freelancers automatically.",
                color: "from-tertiary/10 to-tertiary/5",
                iconColor: "text-tertiary",
              },
              {
                icon: Shield,
                title: "Scam Protection",
                description:
                  "Built-in AI scam detection flags suspicious proposals before they reach you. Your projects stay safe.",
                color: "from-emerald-500/10 to-emerald-500/5",
                iconColor: "text-emerald-500",
              },
              {
                icon: BarChart3,
                title: "Relevancy Scores",
                description:
                  "Every proposal comes with an AI-generated relevancy score showing how well the freelancer fits your needs.",
                color: "from-amber-500/10 to-amber-500/5",
                iconColor: "text-amber-500",
              },
              {
                icon: Users,
                title: "Growing Talent Pool",
                description:
                  "Access freelancers who are actively upskilling. Their learning streak shows dedication and growth mindset.",
                color: "from-secondary/10 to-secondary/5",
                iconColor: "text-secondary",
              },
              {
                icon: Target,
                title: "Budget Flexibility",
                description:
                  "Post fixed-price or hourly projects. Set your budget range and let qualified talent come to you.",
                color: "from-rose-500/10 to-rose-500/5",
                iconColor: "text-rose-500",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color}`}
                >
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-border/40 bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              From posting to completion — simple, fast, and reliable.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                step: "01",
                title: "Post Your Project",
                description: "Describe your needs, set your budget, and specify required skills.",
                icon: Target,
              },
              {
                step: "02",
                title: "AI Matches Talent",
                description: "Our AI finds and notifies the best-matched, skill-verified freelancers.",
                icon: Sparkles,
              },
              {
                step: "03",
                title: "Review Proposals",
                description: "Get proposals with relevancy scores. Compare verified skills and portfolios.",
                icon: BarChart3,
              },
              {
                step: "04",
                title: "Get It Done",
                description: "Collaborate, track progress, and release payment when satisfied.",
                icon: CheckCircle2,
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                {/* Connector line */}
                {i < 3 && (
                  <div className="absolute top-8 left-1/2 hidden h-0.5 w-full bg-gradient-to-r from-primary/30 to-transparent md:block" />
                )}

                <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">
                  <item.icon className="h-7 w-7 text-primary" />
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {item.step}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-border/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { value: "500+", label: "Active Projects", icon: TrendingUp },
              { value: "2,000+", label: "Verified Freelancers", icon: Users },
              { value: "98%", label: "Completion Rate", icon: CheckCircle2 },
              { value: "4.9★", label: "Client Satisfaction", icon: Star },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="mb-2 text-3xl font-extrabold text-primary md:text-4xl">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/40 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-600 to-secondary p-12 text-center text-white md:p-20">
            {/* Background pattern */}
            <div className="pointer-events-none absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
              <div className="absolute bottom-0 right-0 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="relative">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
                Ready to Find Your Perfect Freelancer?
              </h2>
              <p className="mb-8 text-lg text-white/80">
                Post your first project for free. No credit card required.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-primary shadow-xl transition-all hover:bg-white/90 hover:shadow-2xl"
              >
                Start Now — It&apos;s Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-lg font-bold">
                Doable<span className="text-primary">!</span>
              </span>
            </div>

            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="transition-colors hover:text-foreground">About</a>
              <a href="#" className="transition-colors hover:text-foreground">Privacy</a>
              <a href="#" className="transition-colors hover:text-foreground">Terms</a>
              <a href="#" className="transition-colors hover:text-foreground">Contact</a>
            </div>

            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Doable! All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
