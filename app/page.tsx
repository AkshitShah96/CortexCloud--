"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CortexLogo } from "@/components/cortex-logo";
import { useTheme } from "next-themes";
import {
  Brain,
  BarChart3,
  Upload,
  Sparkles,
  ArrowRight,
  Moon,
  Sun,
  CheckCircle,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Easy Data Upload",
    description:
      "Drag and drop your CSV files for instant processing. We support large datasets with automatic validation.",
  },
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description:
      "Advanced machine learning models detect patterns, trends, and anomalies in your data automatically.",
  },
  {
    icon: BarChart3,
    title: "Visual Insights",
    description:
      "Beautiful, interactive charts and visualizations that make complex data easy to understand.",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description:
      "Ask questions about your data in natural language and get instant, intelligent answers.",
  },
];

const benefits = [
  "No coding required",
  "Real-time processing",
  "Enterprise-grade security",
  "Export ready reports",
];

export default function HomePage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <CortexLogo className="w-8 h-8" />
              <span className="text-xl font-bold text-foreground">
                CortexCloud
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              AI-Powered Analytics Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Transform Your Data Into{" "}
              <span className="text-primary">Actionable Insights</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              CortexCloud uses advanced AI to analyze your data, detect patterns,
              and generate predictions. No data science expertise required.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="gap-2 text-base px-8">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8 bg-transparent">
                  View Demo
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-card border border-border rounded-xl shadow-2xl shadow-primary/5 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <div className="w-3 h-3 rounded-full bg-destructive/70" />
                <div className="w-3 h-3 rounded-full bg-warning/70" />
                <div className="w-3 h-3 rounded-full bg-success/70" />
                <span className="ml-4 text-xs text-muted-foreground">
                  CortexCloud Dashboard
                </span>
              </div>
              <div className="p-6 bg-gradient-to-br from-card to-muted/20">
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { label: "Total Datasets", value: "24", change: "+12%" },
                    { label: "AI Analyses", value: "156", change: "+8%" },
                    { label: "Insights", value: "1,847", change: "+24%" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-background/50 rounded-lg p-4 border border-border"
                    >
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <div className="flex items-end gap-2 mt-1">
                        <span className="text-2xl font-bold text-foreground">
                          {stat.value}
                        </span>
                        <span className="text-xs text-success">{stat.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 h-40 bg-background/50 rounded-lg border border-border flex items-center justify-center">
                  <div className="flex items-end gap-2 h-24">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="w-6 rounded-t bg-gradient-to-t from-primary/50 to-primary transition-all duration-300"
                          style={{ height: `${h}%` }}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Everything You Need for Data Intelligence
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you extract maximum value from
              your data without the complexity.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group bg-card border border-border rounded-xl p-6 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Enterprise-Grade Security & Reliability
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Your data security is our top priority. CortexCloud is built on
                cloud-native infrastructure with industry-leading security
                standards.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  {
                    icon: Shield,
                    title: "End-to-End Encryption",
                    desc: "All data encrypted at rest and in transit",
                  },
                  {
                    icon: Globe,
                    title: "Global Infrastructure",
                    desc: "Deployed across multiple regions for reliability",
                  },
                  {
                    icon: Zap,
                    title: "Real-Time Processing",
                    desc: "Instant analysis with scalable compute",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {item.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-background border border-border rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "99.9%", label: "Uptime SLA" },
                  { value: "<100ms", label: "Avg Response" },
                  { value: "SOC 2", label: "Certified" },
                  { value: "GDPR", label: "Compliant" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-card border border-border rounded-xl p-4 text-center"
                  >
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Ready to Transform Your Data?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of businesses using CortexCloud to make data-driven
            decisions.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2 text-base px-8">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base px-8 bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CortexLogo className="w-6 h-6" />
              <span className="font-semibold text-foreground">CortexCloud</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2026 CortexCloud. AI-Powered Intelligence Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
