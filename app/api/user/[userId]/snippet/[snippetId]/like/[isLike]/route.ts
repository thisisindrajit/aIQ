export const dynamic = "force-dynamic"; // defaults to auto

import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string; snippetId: string; isLike: string } }
) {
  const { userId, snippetId, isLike } = params;

  if (!userId || !snippetId || !isLike || (isLike !== "1" && isLike !== "0")) {
    return NextResponse.json(
      { message: "Invalid parameters" },
      { status: 400 }
    );
  }

  const isLikeValue = isLike === "1";

  try {
    if (isLikeValue) {
      // Like the snippet
      const newLike = await prisma.snippet_likes.upsert({
        where: {
          liked_by_snippet_id: {
            liked_by: userId,
            snippet_id: snippetId,
          },
        },
        update: {},
        create: {
          liked_by: userId,
          snippet_id: snippetId,
        },
      });

      return NextResponse.json(
        { message: "Snippet liked", data: newLike },
        { status: 200 }
      );
    } else {
      // Unlike the snippet
      const deletedLike = await prisma.snippet_likes.deleteMany({
        where: {
          liked_by: userId,
          snippet_id: snippetId,
        },
      });

      return NextResponse.json(
        { message: "Snippet unliked", data: deletedLike },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error processing like/unlike:", error);

    return NextResponse.json(
      { message: "Error processing like/unlike" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
