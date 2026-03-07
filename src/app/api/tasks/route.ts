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
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const noteId = searchParams.get("noteId");

    const where: Record<string, unknown> = { userId };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (noteId) where.noteId = noteId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        note: { select: { id: true, title: true } },
      },
      orderBy: [
        { dueDate: { sort: "asc", nulls: "last" } },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
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
    const { title, description, status, priority, dueDate, noteId } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 },
      );
    }

    // Verify note belongs to user if provided
    if (noteId) {
      const note = await prisma.note.findFirst({
        where: { id: noteId, userId },
      });
      if (!note) {
        return NextResponse.json(
          { error: "Note not found" },
          { status: 404 },
        );
      }
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description ?? null,
        status: status ?? "todo",
        priority: priority ?? "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
        userId,
        noteId: noteId ?? null,
      },
      include: {
        note: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}
