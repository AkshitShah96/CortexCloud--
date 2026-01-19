"use client";

import { useDataStore } from "@/lib/data-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Brain, AlertTriangle, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function RecentActivity() {
  const { files, analyses } = useDataStore();

  // Create activity items from files and analyses
  const activities = [
    ...files.map((file) => ({
      id: file.id,
      type: "upload" as const,
      title: `Uploaded ${file.name}`,
      timestamp: file.uploadedAt,
      status: file.status,
    })),
    ...analyses.map((analysis) => ({
      id: analysis.id,
      type: "analysis" as const,
      title: `Analysis completed for ${analysis.fileName}`,
      timestamp: analysis.createdAt,
      insights: analysis.insights.length,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const getIcon = (type: string, status?: string) => {
    if (type === "upload") {
      if (status === "analyzed") return <CheckCircle className="w-4 h-4 text-success" />;
      if (status === "processing") return <Brain className="w-4 h-4 text-primary animate-pulse" />;
      return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
    return <Brain className="w-4 h-4 text-primary" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity. Start by uploading a dataset!
            </p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="mt-0.5">{getIcon(activity.type, activity.status)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {activity.type === "analysis" && "insights" in activity && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {activity.insights} insights
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
