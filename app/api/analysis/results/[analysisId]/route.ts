import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  try {
    const { analysisId } = await params;
    
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

    // Get analysis
    const analysis = await db.getAnalysisById(analysisId);
    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (analysis.userId !== payload.userId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Get dataset info
    const dataset = await db.getDatasetById(analysis.datasetId);

    return NextResponse.json({
      analysis: {
        id: analysis.id,
        datasetId: analysis.datasetId,
        datasetName: dataset?.filename || "Unknown",
        status: analysis.status,
        progress: analysis.progress,
        results: analysis.results,
        createdAt: analysis.createdAt,
        completedAt: analysis.completedAt,
      },
    });
  } catch (error) {
    console.error("Get analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
