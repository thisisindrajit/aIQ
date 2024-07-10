import TopBar from "@/components/TopBar";
import { Fragment } from "react";
import { inngest } from "@/inngest";
import CSearchBar from "@/components/CSearchBar";
// import { prisma } from "@/prisma/client";

const Dashboard = () => {
  const inngestContentGenerationFunctionCaller = async (searchQuery: string) => {
    "use server";
  
    await inngest.send({
      name: "app/generate.snippet",
      data: {
        searchQuery: searchQuery,
      },
    });
  };

  // const message = await prisma.messages.findFirst({
  //   orderBy: { xata_createdat: "desc" },
  // });

  return (
    <Fragment>
      <TopBar />
      <CSearchBar
        inngestContentGenerationFunctionCaller={
          inngestContentGenerationFunctionCaller
        }
      />
    </Fragment>
  );
};

export default Dashboard;
