import CSavedSnippetsHolder from "@/components/holders/CSavedSnippetsHolder";
import { prisma } from "@/prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Saved = async () => {
  const user = await currentUser();

  if (!user) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/user/dashboard`);
  }

  const getSavedSnippets = async (lastSnippetId: string) => {
    "use server";

    if (lastSnippetId === "0") {
      return await prisma.snippet_saves.findMany({
        include: {
          snippets: {
            include: {
              snippet_type_and_data_mapping: {
                include: {
                  list_snippet_types: true,
                },
              },
              snippet_likes: {
                where: {
                  liked_by: {
                    equals: user.id,
                  },
                },
              },
              snippet_notes: {
                where: {
                  noted_by: {
                    equals: user.id,
                  },
                },
              },
            },
          },
        },
        where: {
          saved_by: user.id,
        },
        take: Number(process.env.NEXT_PUBLIC_NO_OF_RECORDS_TO_TAKE ?? 10),
        orderBy: {
          xata_id: "desc",
        },
      });
    }

    return await prisma.snippet_saves.findMany({
      include: {
        snippets: {
          include: {
            snippet_type_and_data_mapping: {
              include: {
                list_snippet_types: true,
              },
            },
            snippet_likes: {
              where: {
                liked_by: {
                  equals: user.id,
                },
              },
            },
            snippet_notes: {
              where: {
                noted_by: {
                  equals: user.id,
                },
              },
            },
          },
        },
      },
      where: {
        saved_by: user.id,
      },
      take: Number(process.env.NEXT_PUBLIC_NO_OF_RECORDS_TO_TAKE ?? 10),
      skip: 1,
      cursor: { xata_id: lastSnippetId },
      orderBy: {
        xata_id: "desc",
      },
    });
  };

  return <CSavedSnippetsHolder getSavedSnippets={getSavedSnippets} />;
};

export default Saved;
