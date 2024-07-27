import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CSnippetsHolder from "@/components/holders/CSnippetsHolder";
import { prisma } from "@/prisma/client";

const Dashboard = async () => {
  const user = await currentUser();

  if (!user) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}`);
  }

  const getSnippets = async (lastSnippetId: string) => {
    "use server";

    if (lastSnippetId === "0") {
      return await prisma.snippets.findMany({
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
          snippet_saves: {
            where: {
              saved_by: {
                equals: user.id,
              },
            },
          },
        },
        take: Number(process.env.NEXT_PUBLIC_NO_OF_RECORDS_TO_TAKE ?? 10),
        orderBy: { xata_createdat: "desc" },
      });
    }

    return await prisma.snippets.findMany({
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
        snippet_saves: {
          where: {
            saved_by: {
              equals: user.id,
            },
          },
        },
      },
      take: Number(process.env.NEXT_PUBLIC_NO_OF_RECORDS_TO_TAKE ?? 10),
      skip: 1,
      cursor: { xata_id: lastSnippetId },
      orderBy: { xata_createdat: "desc" },
    });
  };

  return <CSnippetsHolder getSnippets={getSnippets} />;
};

export default Dashboard;
