import TopBar from "@/components/TopBar";
import { inngest } from "@/inngest";
import CSearchBar from "@/components/CSearchBar";
import { TrendingUp } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CSnippet from "@/components/CSnippet";
// import { prisma } from "@/prisma/client";

const Dashboard = async () => {
  const aIQDetails = {
    title: "aIQ",
    whatOrWho: "AI + IQ",
    when: "2021",
    where: "India",
    why: "To enhance your knowledge",
    how: "One snippet at a time",
    hasAmazingFacts: false,
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

  // const message = await prisma.messages.findFirst({
  //   orderBy: { xata_createdat: "desc" },
  // });

  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-12 min-h-screen p-4 lg:p-6">
      <TopBar />
      <CSearchBar
        inngestContentGenerationFunctionCaller={
          inngestContentGenerationFunctionCaller
        }
      />
      <div className="flex gap-4 w-full lg:w-4/5 mx-auto">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col bg-primary/10 w-96 sticky p-3 h-80 top-8 rounded-lg gap-1.5 border border-primary my-3.5">
          <div className="bg-primary/75 text-primary-foreground flex gap-2 items-center justify-center p-4 w-full rounded-md cursor-pointer transition-all">
            <span>Trending</span>
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        {/* Main content */}
        <div className="w-full flex flex-col gap-3">
          <div className="text-xl/loose sm:text-2xl/loose text-primary">
            Welcome <span className="font-medium italic">{user.firstName}</span>
            {` :)`}
          </div>
          <CSnippet
            title={aIQDetails.title}
            whatOrWho={aIQDetails.whatOrWho}
            why={aIQDetails.why}
            when={aIQDetails.when}
            where={aIQDetails.where}
            how={aIQDetails.how}
            hasAmazingFacts={true}
            amazingFacts={["Amazing fact 1", "Amazing fact 2"]}
          />
          <CSnippet
            title={aIQDetails.title}
            whatOrWho={aIQDetails.whatOrWho}
            why={aIQDetails.why}
            when={aIQDetails.when}
            where={aIQDetails.where}
            how={aIQDetails.how}
            hasAmazingFacts={aIQDetails.hasAmazingFacts}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
