import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

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

    // Get user's datasets
    const datasets = await db.getDatasetsByUserId(payload.userId);

    return NextResponse.json({
      datasets: datasets.map((d) => ({
        id: d.id,
        filename: d.filename,
        size: d.size,
        rowCount: d.rowCount,
        columnCount: d.columnCount,
        columns: d.columns,
        status: d.status,
        createdAt: d.createdAt,
      })),
      total: datasets.length,
    });
  } catch (error) {
    console.error("List datasets error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
