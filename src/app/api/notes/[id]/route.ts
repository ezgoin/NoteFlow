import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const { id } = await context.params;

    const note = await prisma.note.findFirst({
      where: { id, userId },
      include: {
        tags: {
          include: { tag: true },
        },
        tasks: true,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("GET /api/notes/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const { id } = await context.params;

    // Verify note belongs to user
    const existingNote = await prisma.note.findFirst({
      where: { id, userId },
    });
    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, body: noteBody, folderId, isPinned, isTrashed, tagIds } = body;

    // Verify folder belongs to user if provided
    if (folderId !== undefined && folderId !== null) {
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
    if (tagIds !== undefined) {
      if (tagIds.length > 0) {
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

      // Disconnect all existing tags and connect new ones
      await prisma.noteTag.deleteMany({ where: { noteId: id } });

      if (tagIds.length > 0) {
        await prisma.noteTag.createMany({
          data: tagIds.map((tagId: string) => ({ noteId: id, tagId })),
        });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (noteBody !== undefined) updateData.body = noteBody;
    if (folderId !== undefined) updateData.folderId = folderId;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (isTrashed !== undefined) {
      updateData.isTrashed = isTrashed;
      updateData.trashedAt = isTrashed ? new Date() : null;
    }

    const note = await prisma.note.update({
      where: { id },
      data: updateData,
      include: {
        tags: {
          include: { tag: true },
        },
        tasks: true,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("PATCH /api/notes/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const { id } = await context.params;

    // Verify note belongs to user
    const existingNote = await prisma.note.findFirst({
      where: { id, userId },
    });
    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await prisma.note.delete({ where: { id } });

    return NextResponse.json({ message: "Note deleted" });
  } catch (error) {
    console.error("DELETE /api/notes/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 },
    );
  }
}
