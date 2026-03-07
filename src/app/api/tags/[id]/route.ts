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

    // Verify tag belongs to user
    const existingTag = await prisma.tag.findFirst({
      where: { id, userId },
    });
    if (!existingTag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, color } = body;

    // Check for duplicate name if renaming
    if (name !== undefined && name.trim() !== existingTag.name) {
      const duplicate = await prisma.tag.findFirst({
        where: { userId, name: name.trim() },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "A tag with this name already exists" },
          { status: 409 },
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (color !== undefined) updateData.color = color;

    const tag = await prisma.tag.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { notes: true } },
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("PATCH /api/tags/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update tag" },
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

    // Verify tag belongs to user
    const existingTag = await prisma.tag.findFirst({
      where: { id, userId },
    });
    if (!existingTag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    await prisma.tag.delete({ where: { id } });

    return NextResponse.json({ message: "Tag deleted" });
  } catch (error) {
    console.error("DELETE /api/tags/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 },
    );
  }
}
