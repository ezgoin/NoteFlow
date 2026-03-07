import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const tags = await prisma.tag.findMany({
      where: { userId },
      include: {
        _count: { select: { notes: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("GET /api/tags error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const body = await request.json();
    const { name, color } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Tag name is required" },
        { status: 400 },
      );
    }

    // Check for duplicate tag name for this user
    const existing = await prisma.tag.findFirst({
      where: { userId, name: name.trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A tag with this name already exists" },
        { status: 409 },
      );
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        color: color ?? "#6366f1",
        userId,
      },
      include: {
        _count: { select: { notes: true } },
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("POST /api/tags error:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 },
    );
  }
}
