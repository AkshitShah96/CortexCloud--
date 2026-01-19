import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
    const dataset = await db.getDatasetById(id);
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

    // Get analyses for this dataset
    const analyses = await db.getAnalysesByDatasetId(id);

    return NextResponse.json({
      dataset: {
        id: dataset.id,
        filename: dataset.filename,
        size: dataset.size,
        rowCount: dataset.rowCount,
        columnCount: dataset.columnCount,
        columns: dataset.columns,
        status: dataset.status,
        createdAt: dataset.createdAt,
      },
      analyses: analyses.map((a) => ({
        id: a.id,
        status: a.status,
        progress: a.progress,
        createdAt: a.createdAt,
        completedAt: a.completedAt,
      })),
    });
  } catch (error) {
    console.error("Get dataset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
    const dataset = await db.getDatasetById(id);
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

    // Delete dataset and associated files/analyses
    await db.deleteDataset(id);

    return NextResponse.json({
      message: "Dataset deleted successfully",
    });
  } catch (error) {
    console.error("Delete dataset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
