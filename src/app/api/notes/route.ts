import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const { searchParams } = request.nextUrl;
    const folderId = searchParams.get("folderId");
    const tagId = searchParams.get("tagId");
    const search = searchParams.get("search");
    const trashed = searchParams.get("trashed");
    const sortBy = searchParams.get("sortBy") || "updatedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const validSortFields = ["updatedAt", "createdAt", "title"];
    const validSortOrders = ["asc", "desc"];
    const resolvedSortBy = validSortFields.includes(sortBy)
      ? sortBy
      : "updatedAt";
    const resolvedSortOrder = validSortOrders.includes(sortOrder)
      ? sortOrder
      : "desc";

    const where: Record<string, unknown> = {
      userId,
      ...(trashed !== null ? { isTrashed: trashed === "true" } : {}),
    };

    if (folderId) {
      where.folderId = folderId;
    }

    if (tagId) {
      where.tags = { some: { tagId } };
    }

    if (search) {
      where.title = { contains: search };
    }

    const notes = await prisma.note.findMany({
      where,
      include: {
        tags: {
          include: { tag: true },
        },
      },
      orderBy: [
        { isPinned: "desc" },
        { [resolvedSortBy]: resolvedSortOrder as "asc" | "desc" },
      ],
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("GET /api/notes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
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
    const { title, body: noteBody, folderId, tagIds } = body;

    // Verify folder belongs to user if provided
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId },
      });
      if (!folder) {
        return NextResponse.json(
          { error: "Folder not found" },
          { status: 404 },
        );
      }
    }

    // Verify all tags belong to user if provided
    if (tagIds && tagIds.length > 0) {
      const tags = await prisma.tag.findMany({
        where: { id: { in: tagIds }, userId },
      });
      if (tags.length !== tagIds.length) {
        return NextResponse.json(
          { error: "One or more tags not found" },
          { status: 404 },
        );
      }
    }

    const note = await prisma.note.create({
      data: {
        title: title ?? "Untitled",
        body: noteBody ?? "",
        userId,
        folderId: folderId ?? null,
        tags:
          tagIds && tagIds.length > 0
            ? {
                create: tagIds.map((tagId: string) => ({ tagId })),
              }
            : undefined,
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("POST /api/notes error:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 },
    );
  }
}
