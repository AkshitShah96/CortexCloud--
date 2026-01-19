import { NextRequest, NextResponse } from "next/server";
import { db, generateId } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

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

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["text/csv", "application/json", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".csv") && !file.name.endsWith(".json")) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: CSV, JSON, Excel" },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();
    
    // Parse CSV to get metadata
    let rowCount = 0;
    let columnCount = 0;
    let columns: string[] = [];

    if (file.name.endsWith(".csv") || file.type === "text/csv") {
      const lines = content.split("\n").filter(line => line.trim());
      rowCount = Math.max(0, lines.length - 1); // Exclude header
      if (lines.length > 0) {
        columns = lines[0].split(",").map(col => col.trim().replace(/"/g, ""));
        columnCount = columns.length;
      }
    } else if (file.name.endsWith(".json") || file.type === "application/json") {
      try {
        const jsonData = JSON.parse(content);
        if (Array.isArray(jsonData)) {
          rowCount = jsonData.length;
          if (jsonData.length > 0) {
            columns = Object.keys(jsonData[0]);
            columnCount = columns.length;
          }
        }
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON format" },
          { status: 400 }
        );
      }
    }

    // Generate storage path (S3 key format)
    const datasetId = generateId("dataset");
    const storagePath = `uploads/${payload.userId}/${datasetId}/${file.name}`;

    // Store file content (in production, upload to S3)
    await db.storeFile(storagePath, content);

    // Create dataset record
    const now = new Date().toISOString();
    const dataset = await db.createDataset({
      id: datasetId,
      userId: payload.userId,
      filename: file.name,
      originalName: file.name,
      mimeType: file.type || "text/csv",
      size: file.size,
      storagePath,
      status: "uploaded",
      rowCount,
      columnCount,
      columns,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      message: "File uploaded successfully",
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
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
