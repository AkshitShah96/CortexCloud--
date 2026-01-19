import { NextRequest, NextResponse } from "next/server";
import { db, generateId } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

// Rule-based response generator
// Architecture allows easy integration with OpenAI, Gemini, or AWS Bedrock
function generateResponse(
  message: string,
  context: {
    datasets: Array<{ filename: string; rowCount?: number; columnCount?: number }>;
    analyses: Array<{ results?: { trends?: Array<{ description: string }>; insights?: string[] } }>;
  }
): string {
  const lowerMessage = message.toLowerCase();
  
  // Dataset-related questions
  if (lowerMessage.includes("dataset") || lowerMessage.includes("file") || lowerMessage.includes("upload")) {
    if (context.datasets.length === 0) {
      return "You haven't uploaded any datasets yet. Head over to the Upload page to add your first CSV or JSON file for analysis.";
    }
    const datasetList = context.datasets
      .slice(0, 3)
      .map((d) => `• ${d.filename} (${d.rowCount || 0} rows, ${d.columnCount || 0} columns)`)
      .join("\n");
    return `You have ${context.datasets.length} dataset(s) uploaded:\n\n${datasetList}\n\nWould you like me to analyze any specific dataset or explain its contents?`;
  }

  // Trend-related questions
  if (lowerMessage.includes("trend") || lowerMessage.includes("pattern") || lowerMessage.includes("growth")) {
    const allTrends = context.analyses
      .flatMap((a) => a.results?.trends || [])
      .slice(0, 3);
    
    if (allTrends.length === 0) {
      return "I don't see any analyzed data with trend information yet. Run an analysis on your uploaded datasets to discover patterns and trends.";
    }
    
    const trendList = allTrends.map((t) => `• ${t.description}`).join("\n");
    return `Based on your analyzed data, here are the key trends I've identified:\n\n${trendList}\n\nWould you like me to dive deeper into any of these patterns?`;
  }

  // Insight-related questions
  if (lowerMessage.includes("insight") || lowerMessage.includes("finding") || lowerMessage.includes("discover")) {
    const allInsights = context.analyses
      .flatMap((a) => a.results?.insights || [])
      .slice(0, 4);
    
    if (allInsights.length === 0) {
      return "No insights have been generated yet. Upload a dataset and run an analysis to get AI-powered insights about your data.";
    }
    
    const insightList = allInsights.map((i) => `• ${i}`).join("\n");
    return `Here are the key insights from your data:\n\n${insightList}\n\nIs there a specific aspect you'd like to explore further?`;
  }

  // Prediction-related questions
  if (lowerMessage.includes("predict") || lowerMessage.includes("forecast") || lowerMessage.includes("future")) {
    return "Our AI analysis includes predictive modeling based on your historical data. Check the Analysis page to see forecasts and predictions for your key metrics. The predictions use time-series analysis and pattern recognition to estimate future values.";
  }

  // Anomaly-related questions
  if (lowerMessage.includes("anomal") || lowerMessage.includes("outlier") || lowerMessage.includes("unusual")) {
    return "Anomaly detection is part of our analysis pipeline. We identify data points that deviate significantly from expected patterns using statistical methods. Check your analysis results for any flagged anomalies - they're marked by severity level (low, medium, high).";
  }

  // Help / getting started
  if (lowerMessage.includes("help") || lowerMessage.includes("start") || lowerMessage.includes("how")) {
    return `Here's how to get the most out of CortexCloud:

1. **Upload Data** - Go to the Upload page and drag-drop your CSV or JSON files
2. **Run Analysis** - Click "Run AI Analysis" to process your data through our ML pipeline
3. **Explore Insights** - View trends, predictions, and anomalies in the Insights page
4. **Ask Questions** - Chat with me anytime about your data!

What would you like to do first?`;
  }

  // Analysis questions
  if (lowerMessage.includes("analy") || lowerMessage.includes("process") || lowerMessage.includes("run")) {
    return "Our analysis pipeline processes your data through several stages:\n\n1. **Preprocessing** - Data cleaning and normalization\n2. **Pattern Detection** - Statistical analysis and trend identification\n3. **Prediction Models** - Time-series forecasting\n4. **Insight Generation** - Human-readable summaries\n\nEach analysis typically takes a few seconds. Would you like to run an analysis on one of your datasets?";
  }

  // Greeting
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.match(/^hey/)) {
    return `Hello! I'm the CortexCloud AI Assistant. I can help you:\n\n• Understand your uploaded datasets\n• Explain analysis results and trends\n• Provide insights about your data\n• Guide you through the platform\n\nWhat would you like to know?`;
  }

  // Default response
  return `I understand you're asking about "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}". 

As your CortexCloud AI Assistant, I can help with:
• Questions about your uploaded datasets
• Explaining analysis results and trends
• Interpreting predictions and anomalies
• General platform guidance

Could you be more specific about what you'd like to know? For example, try asking "What trends do you see in my data?" or "How do I run an analysis?"`;
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { message, context: requestContext } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get user's data context
    const datasets = await db.getDatasetsByUserId(payload.userId);
    const analyses = await db.getAnalysesByUserId(payload.userId);

    // Save user message
    await db.addChatMessage({
      id: generateId("msg"),
      userId: payload.userId,
      role: "user",
      content: message,
      context: requestContext,
      createdAt: new Date().toISOString(),
    });

    // Generate response
    // In production, this would call OpenAI, Gemini, or AWS Bedrock
    const responseText = generateResponse(message, {
      datasets: datasets.map((d) => ({
        filename: d.filename,
        rowCount: d.rowCount,
        columnCount: d.columnCount,
      })),
      analyses: analyses.filter((a) => a.status === "completed").map((a) => ({
        results: a.results,
      })),
    });

    // Save assistant response
    const assistantMessage = await db.addChatMessage({
      id: generateId("msg"),
      userId: payload.userId,
      role: "assistant",
      content: responseText,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      message: assistantMessage,
      response: responseText,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
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

    // Get chat history
    const messages = await db.getChatHistory(payload.userId);

    return NextResponse.json({
      messages,
    });
  } catch (error) {
    console.error("Get chat history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
