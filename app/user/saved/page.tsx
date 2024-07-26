import CSearchBar from "@/components/CSearchBar";
import SideBar from "@/components/Sidebar";
import Tabs from "@/components/Tabs";
import TopBar from "@/components/TopBar";
import { Separator } from "@/components/ui/separator";
import { inngest } from "@/inngest";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Saved = async () => {
  const user = await currentUser();

  if (!user) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/user/dashboard`);
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
      <Tabs active={2} />
      <div className="flex gap-4 w-full 2xl:w-[90%] mx-auto">
        {/* Sidebar (will be shown in larger screens) */}
        <SideBar active={2} />
        {/* Main content */}
        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="text-xl/loose sm:text-2xl/loose text-primary">
              <span className="font-medium italic">{`${user.firstName}'s`}</span>{" "}
              saved snippets 💾
            </div>
            <Separator className="block xl:hidden" />
          </div>
          Saved snippets go here...
        </div>
      </div>
    </div>
  );
};

export default Saved;
