"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Brain, BarChart3, MessageSquare, ArrowRight } from "lucide-react";

const actions = [
  {
    title: "Upload Dataset",
    description: "Import CSV files for analysis",
    href: "/upload",
    icon: Upload,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Run Analysis",
    description: "Start AI-powered analysis",
    href: "/analysis",
    icon: Brain,
    color: "bg-accent/10 text-accent",
  },
  {
    title: "View Insights",
    description: "Explore visualizations",
    href: "/insights",
    icon: BarChart3,
    color: "bg-success/10 text-success",
  },
  {
    title: "Ask AI Assistant",
    description: "Get instant answers",
    href: "/assistant",
    icon: MessageSquare,
    color: "bg-warning/10 text-warning",
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-primary/20 transition-all duration-200"
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {action.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {action.description}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
