export const dynamic = "force-dynamic"; // defaults to auto

import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string; snippetId: string; isSave: string } }
) {
  const { userId, snippetId, isSave } = params;

  if (!userId || !snippetId || !isSave || (isSave !== "1" && isSave !== "0")) {
    return NextResponse.json(
      { message: "Invalid parameters" },
      { status: 400 }
    );
  }

  const isSaveValue = isSave === "1";

  try {
    if (isSaveValue) {
      // Save the snippet
      const newSave = await prisma.snippet_saves.upsert({
        where: {
          saved_by_snippet_id: {
            saved_by: userId,
            snippet_id: snippetId,
          },
        },
        update: {},
        create: {
          saved_by: userId,
          snippet_id: snippetId,
        },
      });

      return NextResponse.json(
        { message: "Snippet saved", data: newSave },
        { status: 200 }
      );
    } else {
      // Unsave the snippet
      const deletedSave = await prisma.snippet_saves.deleteMany({
        where: {
          saved_by: userId,
          snippet_id: snippetId,
        },
      });

      return NextResponse.json(
        { message: "Snippet unsaved", data: deletedSave },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error processing save/unsave:", error);

    return NextResponse.json(
      { message: "Error processing save/unsave" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
