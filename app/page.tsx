"use server";

import { Fragment } from "react";
import TopBar from "@/components/TopBar";

// import { prisma } from "@/prisma/client";
// import { inngest } from "@/inngest";

// export async function create(message: string) {
//   const createdMessage = await prisma.messages.create({
//     data: { text: message, author: "User" },
//   });

//   await inngest.send({
//     name: "app/message.sent",
//     data: {
//       messageId: createdMessage.xata_id,
//     },
//   });
// }

const Home = async () => {
  // const message = await prisma.messages.findFirst({
  //   orderBy: { xata_createdat: "desc" },
  // });

  return (
    <Fragment>
      <TopBar />
    </Fragment>
  );
}

export default Home;