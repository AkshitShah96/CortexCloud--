"use client";

import { useAuth } from "@/lib/auth-context";
import { useDataStore } from "@/lib/data-store";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Database, Brain, Layers, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { files, analyses } = useDataStore();

  const analyzedFiles = files.filter((f) => f.status === "analyzed").length;
  const activeModels = 3; // Mock data

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-accent/5 to-background border border-border p-6 lg:p-8">
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Your AI-powered analytics dashboard is ready. Upload data, run
            analyses, and discover insights with the power of machine learning.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-accent/5 rounded-full blur-2xl translate-y-1/2" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Datasets"
          value={files.length}
          description="Uploaded files"
          icon={Database}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="AI Analyses"
          value={analyses.length}
          description="Completed analyses"
          icon={Brain}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Active Models"
          value={activeModels}
          description="Running models"
          icon={Layers}
          iconColor="text-accent"
        />
        <StatsCard
          title="Insights Generated"
          value={analyses.reduce((acc, a) => acc + a.insights.length, 0)}
          description="AI discoveries"
          icon={TrendingUp}
          trend={{ value: 24, isPositive: true }}
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  );
}
