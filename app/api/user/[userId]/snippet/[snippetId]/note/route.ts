export const dynamic = "force-dynamic"; // defaults to auto

import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string; snippetId: string } }
) {
  const { userId, snippetId } = params;
  const { note } = await req.json();

  if (!userId || !snippetId) {
    return NextResponse.json(
      { message: "Invalid parameters" },
      { status: 400 }
    );
  }

  try {
    // Save the note
    const newNote = await prisma.snippet_notes.upsert({
      where: {
        noted_by_snippet_id: {
          noted_by: userId,
          snippet_id: snippetId,
        },
      },
      update: {
        note: note,
      },
      create: {
        noted_by: userId,
        snippet_id: snippetId,
        note: note,
      },
    });

    return NextResponse.json(
      { message: "Snippet note saved", data: newNote },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving note:", error);

    return NextResponse.json({ message: "Error saving note" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
