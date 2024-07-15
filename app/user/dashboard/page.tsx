import TopBar from "@/components/TopBar";
import { inngest } from "@/inngest";
import CSearchBar from "@/components/CSearchBar";
// import { prisma } from "@/prisma/client";

const Dashboard = () => {
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

  // const message = await prisma.messages.findFirst({
  //   orderBy: { xata_createdat: "desc" },
  // });

  return (
    <div className="flex flex-col gap-12 min-h-screen p-4 lg:p-6">
      <TopBar />
      <CSearchBar
        inngestContentGenerationFunctionCaller={
          inngestContentGenerationFunctionCaller
        }
      />
    </div>
  );
};

export default Dashboard;
