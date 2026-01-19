"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Trash2,
  Brain,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Dataset {
  id: string;
  filename: string;
  size: number;
  rowCount?: number;
  columnCount?: number;
  columns?: string[];
  status: "uploaded" | "processing" | "analyzed" | "error";
  createdAt: string;
}

export default function UploadPage() {
  const { token } = useAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

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
      }
    } catch (error) {
      console.error("Failed to fetch datasets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!token) return;
      
      const tempId = "temp_" + Math.random().toString(36).substr(2, 9);

      // Validate file type
      const validTypes = [".csv", ".json"];
      const isValidType = validTypes.some(ext => file.name.toLowerCase().endsWith(ext));
      if (!isValidType) {
        setUploadErrors((prev) => ({
          ...prev,
          [tempId]: "Only CSV and JSON files are supported",
        }));
        return;
      }

      // Show progress
      setUploadProgress((prev) => ({ ...prev, [tempId]: 0 }));

      // Simulate progress while uploading
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const current = prev[tempId] || 0;
          if (current >= 90) {
            return prev;
          }
          return { ...prev, [tempId]: current + Math.random() * 15 };
        });
      }, 200);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/datasets/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        clearInterval(progressInterval);

        if (response.ok) {
          setUploadProgress((prev) => ({ ...prev, [tempId]: 100 }));
          // Refresh dataset list
          await fetchDatasets();
          // Clear progress after a short delay
          setTimeout(() => {
            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[tempId];
              return newProgress;
            });
          }, 500);
        } else {
          const data = await response.json();
          setUploadErrors((prev) => ({
            ...prev,
            [tempId]: data.error || "Upload failed",
          }));
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[tempId];
            return newProgress;
          });
        }
      } catch (error) {
        clearInterval(progressInterval);
        setUploadErrors((prev) => ({
          ...prev,
          [tempId]: "Network error. Please try again.",
        }));
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[tempId];
          return newProgress;
        });
      }
    },
    [token, fetchDatasets]
  );

  const deleteDataset = useCallback(
    async (datasetId: string) => {
      if (!token) return;
      try {
        const response = await fetch(`/api/datasets/${datasetId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          setDatasets((prev) => prev.filter((d) => d.id !== datasetId));
        }
      } catch (error) {
        console.error("Failed to delete dataset:", error);
      }
    },
    [token]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      droppedFiles.forEach(uploadFile);
    },
    [uploadFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      selectedFiles.forEach(uploadFile);
      e.target.value = "";
    },
    [uploadFile]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Upload Data
          </h1>
          <p className="text-muted-foreground mt-1">
            Import your CSV or JSON files for AI-powered analysis
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDatasets} className="gap-2 bg-transparent">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-300",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
      >
        <CardContent className="p-8">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center py-8"
          >
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300",
                isDragging ? "bg-primary/20 scale-110" : "bg-primary/10"
              )}
            >
              <Upload
                className={cn(
                  "w-8 h-8 transition-colors",
                  isDragging ? "text-primary" : "text-primary/70"
                )}
              />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isDragging ? "Drop files here" : "Drag and drop your files"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse from your computer
            </p>
            <input
              type="file"
              accept=".csv,.json"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button asChild className="cursor-pointer">
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Select Files
                </span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-4">
              Supported formats: CSV, JSON (max 50MB)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {Object.entries(uploadProgress).map(([id, progress]) => (
        <Card key={id} className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {progress >= 100 ? "Upload complete!" : "Uploading..."}
                </p>
                <Progress value={Math.min(progress, 100)} className="h-2 mt-2" />
              </div>
              <span className="text-sm text-muted-foreground">
                {Math.round(Math.min(progress, 100))}%
              </span>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Upload Errors */}
      {Object.entries(uploadErrors).map(([id, error]) => (
        <Card key={id} className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={() =>
                  setUploadErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[id];
                    return newErrors;
                  })
                }
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Uploaded Files */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Uploaded Datasets ({datasets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading datasets...</p>
            </div>
          ) : datasets.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No datasets uploaded yet. Start by uploading a CSV or JSON file above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {datasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {dataset.filename}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{formatFileSize(dataset.size)}</span>
                      {dataset.rowCount !== undefined && <span>{dataset.rowCount} rows</span>}
                      {dataset.columnCount !== undefined && <span>{dataset.columnCount} columns</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {dataset.status === "analyzed" ? (
                      <span className="flex items-center gap-1 text-xs bg-success/10 text-success px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Analyzed
                      </span>
                    ) : dataset.status === "processing" ? (
                      <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        <Brain className="w-3 h-3 animate-pulse" />
                        Processing
                      </span>
                    ) : (
                      <Link href={`/analysis?dataset=${dataset.id}`}>
                        <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                          <Brain className="w-3 h-3" />
                          Analyze
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteDataset(dataset.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
