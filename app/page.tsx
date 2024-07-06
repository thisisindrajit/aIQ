"use server";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";

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

export default async function Home() {
  // const message = await prisma.messages.findFirst({
  //   orderBy: { xata_createdat: "desc" },
  // });

  return (
    <Fragment>
      <div className="w-full flex items-center justify-between p-6">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 h-8">
          <Image src="/logo.svg" alt="aIQ Logo" width={28} height={28} />
          <Separator orientation="vertical" className="h-6 bg-black" />
          <div className="font-light underline-offset-2 text-lg">
            <span className="underline">a</span>
            <span className="font-medium">
              <span className="underline">I</span>Q
            </span>
          </div>
        </div>
        {/* Profile picture */}
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton>
            <Button size="sm" className="bg-primary rounded-xl text-sm">Login</Button>
          </SignInButton>
        </SignedOut>
      </div>
    </Fragment>
  );
}
