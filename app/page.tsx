"use server";

import { Fragment } from "react";
import TopBar from "@/components/TopBar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import CSnippet from "@/components/CSnippet";

const Home = async () => {
  const { userId }: { userId: string | null } = auth();
  const aIQDetails = {
    title: "aIQ",
    whatOrWho: "AI + IQ",
    when: "2021",
    where: "India",
    why: "To enhance your knowledge",
    how: "One snippet at a time",
    hasAmazingFacts: false,
  };

  if (userId) {
    redirect("/user/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-between gap-12 min-h-screen p-4 lg:p-6">
      <TopBar />
      {/* Landing page grid */}
      <div className="flex flex-col lg:flex-row w-full gap-2 lg:gap-4">
        {/* First grid */}
        <div className="flex flex-col gap-2 lg:gap-4">
          {/* aIQ motto */}
          <div className="bg-primary/25 text-2xl/relaxed sm:text-3xl/relaxed xl:text-4xl/relaxed text-center p-6 sm:p-12 rounded-lg">
            Where{" "}
            <span className="bg-primary/50 text-primary-foreground font-medium">
              artificial intelligence
            </span>{" "}
            meets{" "}
            <span className="text-primary font-medium">
              intellectual curiosity.
            </span>
          </div>
          {/* aIQ definition */}
          <div className="flex flex-col gap-4 bg-secondary/25 p-6 sm:p-12 rounded-lg h-full justify-center">
            <span className="text-secondary text-2xl sm:text-3xl">aIQ</span>
            <span className="text-sm sm:text-base">AI + IQ</span>
            <Separator className="bg-secondary" />
            <div className="text-base/loose sm:text-lg/loose text-justify">
              aIQ (AI + IQ) is an{" "}
              <span className="font-medium italic">
                AI powered ed-tech social media platform
              </span>{" "}
              that aims to enhance your knowledge, one{" "}
              <span className="text-secondary underline underline-offset-2 font-medium">
                snippet
              </span>{" "}
              at a time.
            </div>
          </div>
        </div>
        {/* Second grid (only snippet) */}
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
      {/* Footer */}
      <div>
        Created with ❤️ by{" "}
        <a
          className="text-primary underline underline-offset-2 font-medium"
          href="https://thisisindrajit.github.io/portfolio"
          target="_blank"
          rel="noopener noreferrer"
        >
          Indrajit
        </a>
      </div>
    </div>
  );
};

export default Home;
