import CNotesHolder from "@/components/holders/CNotesHolder";
import { prisma } from "@/prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Notes = async () => {
  const user = await currentUser();

  if (!user) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/user/dashboard`);
  }

  const getNotes = async (lastNoteId: string) => {
    "use server";

    if (lastNoteId === "0") {
      return await prisma.snippet_notes.findMany({
        include: {
          snippets: true,
        },
        where: {
          noted_by: user.id,
        },
        orderBy: {
          xata_createdat: "desc",
        },
        take: Number(process.env.NEXT_PUBLIC_NO_OF_RECORDS_TO_TAKE ?? 10),
      });
    }

    return await prisma.snippet_notes.findMany({
      include: {
        snippets: true,
      },
      where: {
        noted_by: user.id,
      },
      orderBy: {
        xata_createdat: "desc",
      },
      take: Number(process.env.NEXT_PUBLIC_NO_OF_RECORDS_TO_TAKE ?? 10),
      skip: 1,
      cursor: { xata_id: lastNoteId },
    });
  };

  return <CNotesHolder getNotes={getNotes} />;
};

export default Notes;
