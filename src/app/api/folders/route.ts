import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Recursive include for nested subfolders (up to 5 levels deep)
function buildSubFolderInclude(depth: number): Record<string, unknown> {
  if (depth <= 0) {
    return {
      _count: { select: { notes: true } },
    };
  }

  return {
    _count: { select: { notes: true } },
    subFolders: {
      include: buildSubFolderInclude(depth - 1),
      orderBy: { sortOrder: "asc" as const },
    },
  };
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const folders = await prisma.folder.findMany({
      where: { userId, parentFolderId: null },
      include: buildSubFolderInclude(5),
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error("GET /api/folders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
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
    const { name, parentFolderId } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 },
      );
    }

    // Verify parent folder belongs to user if provided
    if (parentFolderId) {
      const parentFolder = await prisma.folder.findFirst({
        where: { id: parentFolderId, userId },
      });
      if (!parentFolder) {
        return NextResponse.json(
          { error: "Parent folder not found" },
          { status: 404 },
        );
      }
    }

    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        userId,
        parentFolderId: parentFolderId ?? null,
      },
      include: {
        _count: { select: { notes: true } },
        subFolders: true,
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error("POST /api/folders error:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 },
    );
  }
}
