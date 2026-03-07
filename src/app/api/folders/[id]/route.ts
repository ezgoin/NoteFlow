import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const { id } = await context.params;

    // Verify folder belongs to user
    const existingFolder = await prisma.folder.findFirst({
      where: { id, userId },
    });
    if (!existingFolder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { name, parentFolderId, sortOrder } = body;

    // Prevent setting self as parent
    if (parentFolderId === id) {
      return NextResponse.json(
        { error: "A folder cannot be its own parent" },
        { status: 400 },
      );
    }

    // Verify parent folder belongs to user if provided
    if (parentFolderId !== undefined && parentFolderId !== null) {
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

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (parentFolderId !== undefined) updateData.parentFolderId = parentFolderId;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const folder = await prisma.folder.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { notes: true } },
        subFolders: true,
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error("PATCH /api/folders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update folder" },
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

    // Verify folder belongs to user
    const existingFolder = await prisma.folder.findFirst({
      where: { id, userId },
    });
    if (!existingFolder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 },
      );
    }

    // Set notes in this folder to have no folder (cascade to null)
    await prisma.note.updateMany({
      where: { folderId: id },
      data: { folderId: null },
    });

    // Move sub-folders to the parent of the deleted folder
    await prisma.folder.updateMany({
      where: { parentFolderId: id },
      data: { parentFolderId: existingFolder.parentFolderId },
    });

    await prisma.folder.delete({ where: { id } });

    return NextResponse.json({ message: "Folder deleted" });
  } catch (error) {
    console.error("DELETE /api/folders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 },
    );
  }
}
