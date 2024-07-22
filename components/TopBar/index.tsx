import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FC } from "react";
import CNotificationBar from "../CNotificationBar";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/prisma/client";
import CTopBarHolder from "./CTopBarHolder";

const TopBar: FC = async () => {
  const user = await currentUser();

  const getNotificationsForUser = async () => {
    "use server";

    return await prisma.user_notifications.findMany({
      take: 15,
      include: {
        list_notification_types: true,
      },
      where: {
        notification_receiver: user?.id,
      },
      orderBy: {
        xata_createdat: "desc",
      },
    });
  };

  return (
    <CTopBarHolder>
      {/* Logo */}
      <div className="flex items-center justify-center space-x-3 h-8">
        <Image src="/logo.svg" alt="aIQ Logo" width={28} height={28} />
        <Separator orientation="vertical" className="h-6 bg-black" />
        <div className="font-light underline-offset-2 text-base sm:text-lg">
          <span className="underline">a</span>
          <span className="font-medium">
            <span className="underline">I</span>Q
          </span>
        </div>
      </div>
      {/* User menu button (if signed in) or SignIn button (if signed out) */}
      <SignedIn>
        <div className="flex items-center justify-center gap-4">
          <CNotificationBar getNotificationsForUser={getNotificationsForUser} />
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "size-7",
              },
            }}
          />
        </div>
      </SignedIn>
      <SignedOut>
        <SignInButton
          forceRedirectUrl="/user/dashboard"
          signUpForceRedirectUrl="/user/dashboard"
        >
          <Button size="sm" className="bg-primary rounded-xl text-sm">
            Login
          </Button>
        </SignInButton>
      </SignedOut>
    </CTopBarHolder>
  );
};

export default TopBar;
