import TopBar from "@/components/TopBar";
import { inngest } from "@/inngest";
import CSearchBar from "@/components/CSearchBar";
import { TrendingUp } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import CSnippetsHolder from "@/components/holders/CSnippetsHolder";
import { prisma } from "@/prisma/client";
import SideBar from "@/components/Sidebar";
import Tabs from "@/components/Tabs";

const Dashboard = async () => {
  const user = await currentUser();
  const numberOfSnippetsToTake = Number(
    process.env.NEXT_PUBLIC_NO_OF_SNIPPETS_TO_TAKE ?? 10
  );

  if (!user) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}`);
  }

  const getSnippets = async (lastSnippetId: string) => {
    "use server";

    if (lastSnippetId === "0") {
      return await prisma.snippets.findMany({
        include: {
          snippet_type_and_data_mapping: true,
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
        take: numberOfSnippetsToTake,
        orderBy: { xata_createdat: "desc" },
      });
    }

    return await prisma.snippets.findMany({
      include: {
        snippet_type_and_data_mapping: true,
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
      take: numberOfSnippetsToTake,
      skip: 1,
      cursor: { xata_id: lastSnippetId },
      orderBy: { xata_createdat: "desc" },
    });
  };

  const inngestContentGenerationFunctionCaller = async (
    searchQuery: string,
    userId?: string | null
  ) => {
    "use server";

    await inngest.send({
      name: "app/generate.snippet",
      data: {
        searchQuery: searchQuery,
        userId: userId,
      },
    });
  };

  return (
    <div className="flex flex-col gap-12 p-4 lg:p-6">
      <TopBar />
      <CSearchBar
        inngestContentGenerationFunctionCaller={
          inngestContentGenerationFunctionCaller
        }
      />
      {/* Tabs (will be shown in smaller screens) */}
      <Tabs active={1} />
      <div className="flex gap-4 w-full 2xl:w-[90%] mx-auto">
        {/* Sidebar (will be shown in larger screens) */}
        <SideBar active={1} />
        {/* Main content */}
        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="text-xl/loose sm:text-2xl/loose text-primary">
              Welcome{" "}
              <span className="font-medium italic">{user.firstName}</span> 🤩
            </div>
            <Separator className="block xl:hidden" />
            <div className="flex xl:hidden text-lg xl:text-xl items-center justify-center gap-2 w-fit font-medium mt-2">
              <span>Trending snippets</span>
              <TrendingUp className="h-5 w-5 text-tertiary" />
            </div>
          </div>
          <CSnippetsHolder getSnippets={getSnippets} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
