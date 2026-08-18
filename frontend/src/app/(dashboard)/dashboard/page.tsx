"use client";

import { useAuth } from "@/hooks/use-auth";
import {
  FolderOpen,
  Users,
  TrendingUp,
  Clock,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      label: "Active Projects",
      value: "0",
      change: "—",
      icon: FolderOpen,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Proposals Received",
      value: "0",
      change: "—",
      icon: Users,
      color: "text-tertiary",
      bg: "bg-tertiary/10",
    },
    {
      label: "Total Spent",
      value: "Rp 0",
      change: "—",
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Avg. Response Time",
      value: "—",
      change: "—",
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Welcome back
          {user?.user_metadata?.full_name
            ? `, ${user.user_metadata.full_name}`
            : ""}
          ! 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what&apos;s happening with your projects.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/20 hover:shadow-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="text-xs text-muted-foreground">{stat.change}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/dashboard/projects"
              className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-all hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Post a New Project</p>
                  <p className="text-xs text-muted-foreground">
                    Find talent for your next project
                  </p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/dashboard/talent"
              className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-all hover:border-tertiary/30 hover:bg-tertiary/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-tertiary/10">
                  <Users className="h-4 w-4 text-tertiary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Browse Talent</p>
                  <p className="text-xs text-muted-foreground">
                    Explore verified freelancers
                  </p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border/50">
            <p className="text-sm text-muted-foreground">
              No recent activity yet. Post your first project to get started!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
