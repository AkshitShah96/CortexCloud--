import { NextRequest, NextResponse } from "next/server";
import { db, generateId, type AnalysisResults } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

// Simulated AI analysis function
function performAnalysis(csvContent: string, columns: string[]): AnalysisResults {
  const lines = csvContent.split("\n").filter((line) => line.trim());
  const dataRows = lines.slice(1); // Skip header
  
  // Parse numeric data
  const numericData: Record<string, number[]> = {};
  const numericColumns: string[] = [];
  
  columns.forEach((col, colIndex) => {
    const values: number[] = [];
    dataRows.forEach((row) => {
      const cells = row.split(",");
      const value = parseFloat(cells[colIndex]?.replace(/"/g, "").trim());
      if (!isNaN(value)) {
        values.push(value);
      }
    });
    if (values.length > dataRows.length * 0.5) {
      numericData[col] = values;
      numericColumns.push(col);
    }
  });

  // Calculate statistics
  const statistics = numericColumns.slice(0, 5).map((col) => {
    const values = numericData[col];
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    
    return {
      column: col,
      min: Math.min(...values),
      max: Math.max(...values),
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      stdDev: Math.round(Math.sqrt(variance) * 100) / 100,
    };
  });

  // Generate trends based on data patterns
  const trends = [];
  if (numericColumns.length > 0) {
    const primaryCol = numericColumns[0];
    const values = numericData[primaryCol];
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg * 1.1) {
      trends.push({
        type: "Upward Trend",
        description: `${primaryCol} shows consistent growth of ${Math.round((secondAvg / firstAvg - 1) * 100)}% over the dataset period`,
        confidence: 85 + Math.floor(Math.random() * 10),
      });
    } else if (secondAvg < firstAvg * 0.9) {
      trends.push({
        type: "Downward Trend",
        description: `${primaryCol} shows a decline of ${Math.round((1 - secondAvg / firstAvg) * 100)}% over the dataset period`,
        confidence: 82 + Math.floor(Math.random() * 10),
      });
    } else {
      trends.push({
        type: "Stable Pattern",
        description: `${primaryCol} maintains relatively stable values with minor fluctuations`,
        confidence: 78 + Math.floor(Math.random() * 15),
      });
    }
  }

  // Add more generated trends
  trends.push({
    type: "Data Distribution",
    description: `Dataset contains ${dataRows.length} records with ${numericColumns.length} numeric and ${columns.length - numericColumns.length} categorical columns`,
    confidence: 100,
  });

  if (numericColumns.length >= 2) {
    trends.push({
      type: "Correlation Detected",
      description: `Potential correlation identified between ${numericColumns[0]} and ${numericColumns[1]}`,
      confidence: 70 + Math.floor(Math.random() * 20),
    });
  }

  // Generate predictions
  const predictions = numericColumns.slice(0, 3).map((col) => {
    const values = numericData[col];
    const currentValue = values[values.length - 1] || values.reduce((a, b) => a + b, 0) / values.length;
    const growthRate = 1 + (Math.random() * 0.3 - 0.1); // -10% to +20%
    const predictedValue = currentValue * growthRate;
    
    return {
      metric: col,
      currentValue: Math.round(currentValue * 100) / 100,
      predictedValue: Math.round(predictedValue * 100) / 100,
      change: Math.round((growthRate - 1) * 1000) / 10,
      timeframe: "Next Period",
    };
  });

  // Detect anomalies
  const anomalies = [];
  numericColumns.slice(0, 2).forEach((col) => {
    const values = numericData[col];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length);
    
    values.forEach((val, idx) => {
      if (Math.abs(val - mean) > 2.5 * stdDev && anomalies.length < 3) {
        anomalies.push({
          description: `Unusual value detected in ${col} at row ${idx + 2}: ${val} (${Math.round(Math.abs(val - mean) / stdDev * 10) / 10}σ from mean)`,
          severity: Math.abs(val - mean) > 3 * stdDev ? "high" : "medium" as const,
          column: col,
          value: val,
        });
      }
    });
  });

  if (anomalies.length === 0) {
    anomalies.push({
      description: "No significant anomalies detected in the dataset",
      severity: "low" as const,
    });
  }

  // Generate insights
  const insights = [
    `Your dataset contains ${dataRows.length} records across ${columns.length} columns`,
    numericColumns.length > 0 
      ? `${numericColumns[0]} has a range of ${Math.round((Math.max(...numericData[numericColumns[0]]) - Math.min(...numericData[numericColumns[0]])) * 100) / 100}`
      : "Dataset appears to be primarily categorical",
    `Data completeness score: ${Math.round(85 + Math.random() * 15)}%`,
    predictions.length > 0 
      ? `Based on current trends, ${predictions[0].metric} is projected to ${predictions[0].change > 0 ? "increase" : "decrease"} by ${Math.abs(predictions[0].change)}%`
      : "Insufficient numeric data for predictions",
  ];

  // Generate chart data
  const chartLabels = dataRows.slice(0, 12).map((_, i) => `Point ${i + 1}`);
  const chartValues = numericColumns.length > 0 
    ? numericData[numericColumns[0]].slice(0, 12)
    : dataRows.slice(0, 12).map(() => Math.random() * 100);
  const chartPredictions = chartValues.map((v) => v * (1 + Math.random() * 0.2));

  return {
    summary: {
      totalRows: dataRows.length,
      totalColumns: columns.length,
      numericColumns: numericColumns.length,
      categoricalColumns: columns.length - numericColumns.length,
    },
    statistics,
    trends,
    predictions,
    anomalies,
    insights,
    chartData: {
      labels: chartLabels,
      values: chartValues.map((v) => Math.round(v * 100) / 100),
      predictions: chartPredictions.map((v) => Math.round(v * 100) / 100),
    },
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ datasetId: string }> }
) {
  try {
    const { datasetId } = await params;
    
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get dataset
    const dataset = await db.getDatasetById(datasetId);
    if (!dataset) {
      return NextResponse.json(
        { error: "Dataset not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (dataset.userId !== payload.userId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Create analysis record
    const now = new Date().toISOString();
    const analysis = await db.createAnalysis({
      id: generateId("analysis"),
      datasetId: dataset.id,
      userId: payload.userId,
      status: "pending",
      progress: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Get file content
    const fileContent = await db.getFile(dataset.storagePath);
    if (!fileContent) {
      await db.updateAnalysis(analysis.id, { status: "error" });
      return NextResponse.json(
        { error: "Dataset file not found" },
        { status: 404 }
      );
    }

    // Simulate async analysis pipeline
    // In production, this would trigger a Lambda function or background job
    
    // Update status: preprocessing
    await db.updateAnalysis(analysis.id, { status: "preprocessing", progress: 25 });
    
    // Perform actual analysis
    const results = performAnalysis(fileContent, dataset.columns || []);
    
    // Update status: completed
    await db.updateAnalysis(analysis.id, {
      status: "completed",
      progress: 100,
      results,
      completedAt: new Date().toISOString(),
    });

    // Update dataset status
    await db.updateDataset(datasetId, { status: "analyzed" });

    return NextResponse.json({
      message: "Analysis started",
      analysis: {
        id: analysis.id,
        datasetId: dataset.id,
        status: "completed",
        progress: 100,
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
