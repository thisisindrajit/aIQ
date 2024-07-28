import TopBar from "@/components/TopBar";
import { inngest } from "@/inngest";
import CSearchBar from "@/components/common/CSearchBar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SideBar from "@/components/common/Sidebar";
import Tabs from "@/components/common/Tabs";
import { TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const DashboardLayout = async ({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) => {
  const user = await currentUser();

  if (!user) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}`);
  }

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
              {user.firstName && (
                <span className="font-medium italic">{user.firstName}</span>
              )}{" "}
              🤩
            </div>
            <Separator className="block xl:hidden" />
            <div className="flex xl:hidden text-lg xl:text-xl items-center justify-center gap-2 w-fit font-medium mt-2">
              <span>Trending snippets</span>
              <TrendingUp className="h-5 w-5 text-tertiary" />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
