import { NextRequest, NextResponse } from "next/server";
import { db, generateId } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { signToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();
    const user = await db.createUser({
      id: generateId("user"),
      email: email.toLowerCase(),
      name,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    // Generate JWT token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      message: "Registration successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
