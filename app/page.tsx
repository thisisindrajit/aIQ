"use server";

import TopBar from "@/components/TopBar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import CSnippet from "@/components/common/CSnippet";

const Home = async () => {
  const { userId }: { userId: string | null } = auth();
  const aIQDetails = {
    id: "1",
    title: "aIQ",
    whatOrWho: [
      "aIQ (AI + IQ) is an **AI-powered ed-tech social media platform** that generates and presents bite-sized, comprehensive content on user-requested topics.",
      "It features AI-generated educational snippets based on the 5W1H framework along with a **social media-style infinite scroll** functionality.",
      "The platform is designed for anyone who is intellectually curious.",
    ],
    when: [
      "aIQ is used when **quick, reliable information is needed on a topic**, making it ideal for study sessions, research, or moments of curiosity.",
      "It serves as a supplementary tool for formal education and can **replace idle time typically spent on social media.**",
      "The first prototype is being **developed as part of the Hashnode AiForTomorrow hackathon**, with future development planned to expand its features and capabilities.",
    ],
    where: [
      "aIQ is designed for use in **educational institutions, professional development settings, and personal learning environments.**",
      "The platform's versatility allows it to be integrated into diverse learning contexts, from **classrooms to corporate training programs.**",
    ],
    why: [
      "aIQ **bridges the gap between engaging social media content and in-depth educational material**, making learning more accessible and enjoyable.",
      "It provides **quick, comprehensive information on various topics, encouraging continuous learning** through an addictive interface.",
    ],
    how: [
      "aIQ utilizes **advanced AI, Retrieval-Augmented Generation (RAG), and LLMs** for understanding user queries and generating relevant content.",
      "Users interact with the platform by **inputting topics of interest and swiping through AI-generated snippets.**",
    ],
    amazingFacts: [],
    showLikeSaveAndNotes: false,
  };

  if (userId) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/user/dashboard`);
  }

  return (
    <div className="flex flex-col items-center justify-between gap-12 min-h-screen p-4 lg:p-6">
      <TopBar />
      {/* Landing page grid */}
      <div className="flex flex-col lg:flex-row w-full gap-2 lg:gap-4">
        {/* First grid */}
        <div className="flex flex-col gap-2 lg:gap-4 w-full">
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
        <div className="w-full lg:w-[50%] 2xl:w-full">
          <CSnippet
            snippetId={aIQDetails.id}
            title={aIQDetails.title}
            requestedOn={null}
            requestorName={null}
            whatOrWho={aIQDetails.whatOrWho}
            why={aIQDetails.why}
            when={aIQDetails.when}
            where={aIQDetails.where}
            how={aIQDetails.how}
            amazingFacts={aIQDetails.amazingFacts}
            references={[]}
            showLikeSaveAndNotes={aIQDetails.showLikeSaveAndNotes}
          />
        </div>
      </div>
      {/* Footer */}
      <div className="text-sm sm:text-base">
        Created by{" "}
        <a
          className="text-primary underline underline-offset-2 font-medium"
          href="https://thisisindrajit.github.io/portfolio"
          target="_blank"
          rel="noopener noreferrer"
        >
          Indrajit
        </a>{" "}
        for the{" "}
        <a
          className="text-primary underline underline-offset-2 font-medium"
          href="https://hashnode.com/hackathons/ai-for-tomorrow"
          target="_blank"
          rel="noopener noreferrer"
        >
          Hashnode hackathon
        </a>
      </div>
    </div>
  );
};

export default Home;
