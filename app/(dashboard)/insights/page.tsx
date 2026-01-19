"use client";

import { useState } from "react";
import { useDataStore } from "@/lib/data-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  LineChart,
  TrendingUp,
  Download,
  Brain,
  Table,
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import Link from "next/link";

export default function InsightsPage() {
  const { analyses } = useDataStore();
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>(
    analyses[0]?.id || ""
  );

  const selectedAnalysis = analyses.find((a) => a.id === selectedAnalysisId);

  // Transform chart data for Recharts
  const chartData = selectedAnalysis
    ? selectedAnalysis.chartData.labels.map((label, i) => ({
        name: label,
        actual: selectedAnalysis.chartData.values[i],
        predicted: selectedAnalysis.chartData.predictions[i],
      }))
    : [];

  // Create comparison data for bar chart
  const comparisonData = selectedAnalysis
    ? selectedAnalysis.predictions.map((p) => ({
        name: p.metric,
        current: p.currentValue,
        predicted: p.predictedValue,
      }))
    : [];

  if (analyses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Insights & Visualization
          </h1>
          <p className="text-muted-foreground mt-1">
            Visual analytics and data exploration
          </p>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <BarChart3 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Analyses Available
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Run an AI analysis on your data to generate visualizations and
              insights.
            </p>
            <Link href="/analysis">
              <Button>
                <Brain className="w-4 h-4 mr-2" />
                Run Analysis
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Insights & Visualization
          </h1>
          <p className="text-muted-foreground mt-1">
            Visual analytics and data exploration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedAnalysisId}
            onValueChange={setSelectedAnalysisId}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select analysis" />
            </SelectTrigger>
            <SelectContent>
              {analyses.map((analysis) => (
                <SelectItem key={analysis.id} value={analysis.id}>
                  {analysis.fileName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {selectedAnalysis && (
        <>
          {/* Main Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <LineChart className="w-5 h-5 text-primary" />
                Trend Analysis with Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14F1D9" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14F1D9" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0EA5A4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0EA5A4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="name"
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#E5E7EB",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="actual"
                      stroke="#14F1D9"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorActual)"
                      name="Actual Values"
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      stroke="#0EA5A4"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fillOpacity={1}
                      fill="url(#colorPredicted)"
                      name="Predicted Values"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                This chart shows historical data trends along with AI-generated
                predictions. The dashed line represents forecasted values based on
                machine learning models.
              </p>
            </CardContent>
          </Card>

          {/* Comparison Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                Current vs Predicted Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#9CA3AF"
                      fontSize={12}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#E5E7EB",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="current"
                      fill="#0EA5A4"
                      name="Current"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="predicted"
                      fill="#14F1D9"
                      name="Predicted"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Comparison between current metric values and AI predictions.
                Predictions are based on historical patterns and trend analysis.
              </p>
            </CardContent>
          </Card>

          {/* Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Table className="w-5 h-5 text-success" />
                Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Metric
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        Current Value
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        Predicted Value
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        Change
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Timeframe
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAnalysis.predictions.map((pred, i) => (
                      <tr
                        key={i}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-foreground">
                          {pred.metric}
                        </td>
                        <td className="py-3 px-4 text-right text-foreground">
                          {pred.currentValue.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-primary font-medium">
                          {pred.predictedValue.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 ${
                              pred.change >= 0 ? "text-success" : "text-destructive"
                            }`}
                          >
                            <TrendingUp
                              className={`w-3 h-3 ${
                                pred.change < 0 ? "rotate-180" : ""
                              }`}
                            />
                            {pred.change}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {pred.timeframe}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Trend Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {selectedAnalysis.trends.map((trend, i) => (
              <Card
                key={i}
                className="group hover:border-primary/20 transition-colors"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                      {trend.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {trend.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{trend.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
