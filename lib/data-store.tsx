"use client";

import React, { createContext, useContext, useState } from "react";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  status: "uploaded" | "processing" | "analyzed";
  rowCount?: number;
  columnCount?: number;
}

export interface AnalysisResult {
  id: string;
  fileId: string;
  fileName: string;
  createdAt: string;
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
    timestamp: string;
  }[];
  insights: string[];
  chartData: {
    labels: string[];
    values: number[];
    predictions: number[];
  };
}

interface DataStoreContextType {
  files: UploadedFile[];
  analyses: AnalysisResult[];
  addFile: (file: UploadedFile) => void;
  removeFile: (id: string) => void;
  updateFileStatus: (id: string, status: UploadedFile["status"]) => void;
  addAnalysis: (analysis: AnalysisResult) => void;
  getAnalysisForFile: (fileId: string) => AnalysisResult | undefined;
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(
  undefined
);

// Mock data for demo
const mockFiles: UploadedFile[] = [
  {
    id: "file_1",
    name: "sales_data_2024.csv",
    size: 245000,
    type: "text/csv",
    uploadedAt: "2024-01-15T10:30:00Z",
    status: "analyzed",
    rowCount: 1250,
    columnCount: 12,
  },
  {
    id: "file_2",
    name: "customer_metrics.csv",
    size: 128000,
    type: "text/csv",
    uploadedAt: "2024-01-14T14:20:00Z",
    status: "analyzed",
    rowCount: 850,
    columnCount: 8,
  },
  {
    id: "file_3",
    name: "inventory_report.csv",
    size: 89000,
    type: "text/csv",
    uploadedAt: "2024-01-13T09:15:00Z",
    status: "uploaded",
    rowCount: 420,
    columnCount: 6,
  },
];

const mockAnalyses: AnalysisResult[] = [
  {
    id: "analysis_1",
    fileId: "file_1",
    fileName: "sales_data_2024.csv",
    createdAt: "2024-01-15T10:35:00Z",
    trends: [
      {
        type: "Upward Growth",
        description:
          "Revenue shows consistent 12% month-over-month growth pattern",
        confidence: 94,
      },
      {
        type: "Seasonal Pattern",
        description:
          "Q4 sales consistently outperform other quarters by 35-40%",
        confidence: 89,
      },
      {
        type: "Customer Retention",
        description: "Repeat customer rate improved from 45% to 62%",
        confidence: 91,
      },
    ],
    predictions: [
      {
        metric: "Monthly Revenue",
        currentValue: 125000,
        predictedValue: 142000,
        change: 13.6,
        timeframe: "Next Month",
      },
      {
        metric: "New Customers",
        currentValue: 340,
        predictedValue: 385,
        change: 13.2,
        timeframe: "Next Month",
      },
      {
        metric: "Average Order Value",
        currentValue: 89,
        predictedValue: 94,
        change: 5.6,
        timeframe: "Next Quarter",
      },
    ],
    anomalies: [
      {
        description:
          "Unusual spike in returns for product category 'Electronics' on Jan 5th",
        severity: "medium",
        timestamp: "2024-01-05T00:00:00Z",
      },
      {
        description: "Traffic drop of 23% detected on Jan 12th",
        severity: "low",
        timestamp: "2024-01-12T00:00:00Z",
      },
    ],
    insights: [
      "Your top-performing product category generates 45% of total revenue",
      "Customer acquisition cost has decreased by 18% compared to last quarter",
      "Mobile purchases account for 67% of all transactions",
      "Peak sales hours are between 6 PM and 9 PM local time",
    ],
    chartData: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      values: [65, 72, 78, 85, 82, 90, 95, 102, 98, 110, 125, 142],
      predictions: [142, 155, 168, 175, 170, 185, 195, 210, 205, 225, 250, 280],
    },
  },
  {
    id: "analysis_2",
    fileId: "file_2",
    fileName: "customer_metrics.csv",
    createdAt: "2024-01-14T14:25:00Z",
    trends: [
      {
        type: "Engagement Growth",
        description: "User engagement increased by 28% over the past quarter",
        confidence: 87,
      },
      {
        type: "Churn Reduction",
        description: "Customer churn rate decreased from 8% to 5.2%",
        confidence: 92,
      },
    ],
    predictions: [
      {
        metric: "Active Users",
        currentValue: 8500,
        predictedValue: 9800,
        change: 15.3,
        timeframe: "Next Month",
      },
      {
        metric: "NPS Score",
        currentValue: 42,
        predictedValue: 48,
        change: 14.3,
        timeframe: "Next Quarter",
      },
    ],
    anomalies: [
      {
        description: "Support ticket volume increased 45% on Jan 10th",
        severity: "high",
        timestamp: "2024-01-10T00:00:00Z",
      },
    ],
    insights: [
      "Power users (top 10%) generate 60% of engagement metrics",
      "Email campaigns have 3x better conversion than social media",
      "Customer satisfaction peaks after 3rd interaction with support",
    ],
    chartData: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      values: [5200, 5500, 5800, 6200, 6500, 6900, 7200, 7600, 7900, 8200, 8500, 8900],
      predictions: [8900, 9300, 9800, 10200, 10700, 11200, 11800, 12300, 12900, 13500, 14100, 14800],
    },
  },
];

export function DataStoreProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<UploadedFile[]>(mockFiles);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>(mockAnalyses);

  const addFile = (file: UploadedFile) => {
    setFiles((prev) => [file, ...prev]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setAnalyses((prev) => prev.filter((a) => a.fileId !== id));
  };

  const updateFileStatus = (id: string, status: UploadedFile["status"]) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status } : f))
    );
  };

  const addAnalysis = (analysis: AnalysisResult) => {
    setAnalyses((prev) => [analysis, ...prev]);
  };

  const getAnalysisForFile = (fileId: string) => {
    return analyses.find((a) => a.fileId === fileId);
  };

  return (
    <DataStoreContext.Provider
      value={{
        files,
        analyses,
        addFile,
        removeFile,
        updateFileStatus,
        addAnalysis,
        getAnalysisForFile,
      }}
    >
      {children}
    </DataStoreContext.Provider>
  );
}

export function useDataStore() {
  const context = useContext(DataStoreContext);
  if (context === undefined) {
    throw new Error("useDataStore must be used within a DataStoreProvider");
  }
  return context;
}
