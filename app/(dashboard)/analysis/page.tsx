"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Play,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Loader2,
  FileText,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import Loading from "./loading"; // Import the loading component

interface Dataset {
  id: string;
  filename: string;
  size: number;
  rowCount?: number;
  columnCount?: number;
  status: "uploaded" | "processing" | "analyzed" | "error";
  createdAt: string;
}

interface AnalysisResults {
  summary: {
    totalRows: number;
    totalColumns: number;
    numericColumns: number;
    categoricalColumns: number;
  };
  statistics: {
    column: string;
    min: number;
    max: number;
    mean: number;
    median: number;
    stdDev: number;
  }[];
  trends: {
    type: string;
    description: string;
    confidence: number;
  }[];
  predictions: {
    metric: string;
    currentValue: number;
    predictedValue: number;
    change: number;
    timeframe: string;
  }[];
  anomalies: {
    description: string;
    severity: "low" | "medium" | "high";
    column?: string;
    value?: number;
  }[];
  insights: string[];
  chartData: {
    labels: string[];
    values: number[];
    predictions: number[];
  };
}

interface Analysis {
  id: string;
  datasetId: string;
  datasetName: string;
  status: "pending" | "preprocessing" | "analyzing" | "generating" | "completed" | "error";
  progress: number;
  results?: AnalysisResults;
  createdAt: string;
  completedAt?: string;
}

export default function AnalysisPage() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const preselectedDataset = searchParams.get("dataset");
  
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("");
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("");

  // Fetch datasets from API
  const fetchDatasets = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/datasets/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDatasets(data.datasets);
        
        // Pre-select dataset if specified in URL
        if (preselectedDataset && data.datasets.some((d: Dataset) => d.id === preselectedDataset)) {
          setSelectedDatasetId(preselectedDataset);
        }
      }
    } catch (error) {
      console.error("Failed to fetch datasets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, preselectedDataset]);

  // Fetch analysis results for selected dataset
  const fetchAnalysisForDataset = useCallback(async (datasetId: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/datasets/${datasetId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.analyses && data.analyses.length > 0) {
          // Get the latest completed analysis
          const latestAnalysisId = data.analyses[0]?.id;
          if (latestAnalysisId) {
            const analysisResponse = await fetch(`/api/analysis/results/${latestAnalysisId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (analysisResponse.ok) {
              const analysisData = await analysisResponse.json();
              setCurrentAnalysis(analysisData.analysis);
            }
          }
        } else {
          setCurrentAnalysis(null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch analysis:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  useEffect(() => {
    if (selectedDatasetId) {
      fetchAnalysisForDataset(selectedDatasetId);
    } else {
      setCurrentAnalysis(null);
    }
  }, [selectedDatasetId, fetchAnalysisForDataset]);

  const runAnalysis = async () => {
    if (!selectedDatasetId || !token) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentAnalysis(null);

    // Simulate progress stages while API runs
    const stages = [
      { name: "Loading dataset...", progress: 10 },
      { name: "Preprocessing data...", progress: 25 },
      { name: "Detecting patterns...", progress: 45 },
      { name: "Running ML models...", progress: 65 },
      { name: "Generating predictions...", progress: 80 },
      { name: "Identifying anomalies...", progress: 90 },
    ];

    // Run stages in background
    let stageIndex = 0;
    const stageInterval = setInterval(() => {
      if (stageIndex < stages.length) {
        setAnalysisStage(stages[stageIndex].name);
        setAnalysisProgress(stages[stageIndex].progress);
        stageIndex++;
      }
    }, 600);

    try {
      const response = await fetch(`/api/analysis/run/${selectedDatasetId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      clearInterval(stageInterval);

      if (response.ok) {
        const data = await response.json();
        setAnalysisStage("Analysis complete!");
        setAnalysisProgress(100);
        
        // Fetch the full analysis results
        if (data.analysis?.id) {
          const resultsResponse = await fetch(`/api/analysis/results/${data.analysis.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (resultsResponse.ok) {
            const resultsData = await resultsResponse.json();
            setCurrentAnalysis(resultsData.analysis);
          }
        }
        
        // Refresh datasets to update status
        await fetchDatasets();
      } else {
        const errorData = await response.json();
        setAnalysisStage(`Error: ${errorData.error || "Analysis failed"}`);
      }
    } catch (error) {
      clearInterval(stageInterval);
      console.error("Analysis error:", error);
      setAnalysisStage("Error: Network error. Please try again.");
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisStage("");
      }, 1500);
    }
  };

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);

  return (
    <Suspense fallback={<Loading />}>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                AI Analysis
              </h1>
              <p className="text-muted-foreground mt-1">
                Run machine learning models on your data to discover insights
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchDatasets} className="gap-2 bg-transparent">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {/* Analysis Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Run New Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {datasets.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">
                    No datasets available. Upload a file first to run analysis.
                  </p>
                  <Link href="/upload">
                    <Button>Upload Data</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Select Dataset
                      </label>
                      <Select
                        value={selectedDatasetId}
                        onValueChange={setSelectedDatasetId}
                        disabled={isAnalyzing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a file to analyze" />
                        </SelectTrigger>
                        <SelectContent>
                          {datasets.map((dataset) => (
                            <SelectItem key={dataset.id} value={dataset.id}>
                              <span className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                {dataset.filename}
                                {dataset.status === "analyzed" && (
                                  <CheckCircle className="w-3 h-3 text-success" />
                                )}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedDataset && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {selectedDataset.rowCount} rows, {selectedDataset.columnCount} columns
                        </p>
                      )}
                    </div>
                    <div className="sm:self-end">
                      <Button
                        onClick={runAnalysis}
                        disabled={!selectedDatasetId || isAnalyzing}
                        className="w-full sm:w-auto"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Run AI Analysis
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Analysis Progress */}
                  {isAnalyzing && (
                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                      <div className="flex items-center gap-3 mb-3">
                        <Brain className="w-5 h-5 text-primary animate-pulse" />
                        <span className="text-sm font-medium text-foreground">
                          {analysisStage}
                        </span>
                      </div>
                      <Progress value={analysisProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        AI models are processing your data. This may take a moment...
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {currentAnalysis?.results && !isAnalyzing && (
            <div className="space-y-6">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground">Total Rows</p>
                      <p className="text-xl font-bold text-foreground">
                        {currentAnalysis.results.summary.totalRows.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground">Total Columns</p>
                      <p className="text-xl font-bold text-foreground">
                        {currentAnalysis.results.summary.totalColumns}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground">Numeric Columns</p>
                      <p className="text-xl font-bold text-foreground">
                        {currentAnalysis.results.summary.numericColumns}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground">Categorical</p>
                      <p className="text-xl font-bold text-foreground">
                        {currentAnalysis.results.summary.categoricalColumns}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Detected Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {currentAnalysis.results.trends.map((trend, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-lg bg-muted/30 border border-border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                            {trend.type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {trend.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{trend.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Predictions */}
              {currentAnalysis.results.predictions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Brain className="w-5 h-5 text-accent" />
                      AI Predictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {currentAnalysis.results.predictions.map((pred, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-lg bg-muted/30 border border-border"
                        >
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            {pred.metric}
                          </p>
                          <div className="flex items-end gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Current</p>
                              <p className="text-2xl font-bold text-foreground">
                                {pred.currentValue.toLocaleString()}
                              </p>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                              <div
                                className={cn(
                                  "flex items-center gap-1 text-sm font-medium",
                                  pred.change >= 0 ? "text-success" : "text-destructive"
                                )}
                              >
                                {pred.change >= 0 ? (
                                  <TrendingUp className="w-4 h-4" />
                                ) : (
                                  <TrendingDown className="w-4 h-4" />
                                )}
                                {pred.change}%
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                {pred.timeframe}
                              </p>
                              <p className="text-2xl font-bold text-primary">
                                {pred.predictedValue.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Anomalies */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    Anomaly Detection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentAnalysis.results.anomalies.map((anomaly, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg",
                          anomaly.severity === "high"
                            ? "bg-destructive/10 border border-destructive/20"
                            : anomaly.severity === "medium"
                              ? "bg-warning/10 border border-warning/20"
                              : "bg-muted/30 border border-border"
                        )}
                      >
                        <AlertTriangle
                          className={cn(
                            "w-4 h-4 mt-0.5",
                            anomaly.severity === "high"
                              ? "text-destructive"
                              : anomaly.severity === "medium"
                                ? "text-warning"
                                : "text-muted-foreground"
                          )}
                        />
                        <div className="flex-1">
                          <p className="text-sm text-foreground">
                            {anomaly.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 capitalize">
                            Severity: {anomaly.severity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Key Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-success" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentAnalysis.results.insights.map((insight, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20"
                      >
                        <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                        <p className="text-sm text-foreground">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* View Full Insights */}
              <div className="flex justify-center">
                <Link href="/insights">
                  <Button variant="outline" className="gap-2 bg-transparent">
                    View Full Visualizations
                    <TrendingUp className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* No Analysis Yet */}
          {!currentAnalysis && selectedDatasetId && !isAnalyzing && (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Click &quot;Run AI Analysis&quot; to start processing this dataset
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </Suspense>
  );
}
