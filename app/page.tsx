"use server";

import { Fragment } from "react";
import TopBar from "@/components/TopBar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Home = async () => {
  const { userId }: { userId: string | null } = auth();

  if (userId) {
    redirect("/user/dashboard");
  }

  return (
    <Fragment>
      <TopBar />
    </Fragment>
  );
};

export default Home;