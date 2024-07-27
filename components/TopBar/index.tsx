import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FC } from "react";
import CNotificationHolder from "../holders/CNotificationHolder";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/prisma/client";
import CTopBarHolder from "./CTopBarHolder";
import Link from "next/link";
import { Award, Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CPwaInstallButton from "../common/CPwaInstallButton";

const TopBar: FC = async () => {
  const user = await currentUser();

  const getNotificationsForUser = async () => {
    "use server";

    return await prisma.user_notifications.findMany({
      take: 10,
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
      <Link
        href={user ? `/user/dashboard` : `/`}
        className="flex items-center justify-center space-x-3 h-8"
      >
        <Image src="/logo.svg" alt="aIQ Logo" width={28} height={28} />
        <Separator orientation="vertical" className="h-6 bg-black" />
        <div className="font-light underline-offset-2 text-base sm:text-lg">
          <span className="underline">a</span>
          <span className="font-medium">
            <span className="underline">I</span>Q
          </span>
        </div>
      </Link>
      {/* User menu button (if signed in) or SignIn button (if signed out) */}
      <SignedIn>
        <div className="flex items-center justify-center gap-3">
          <CPwaInstallButton>
            <div className="bg-primary/10 border border-primary p-1.5 rounded-md text-primary cursor-pointer"><Download className="h-4 w-4" /></div>
          </CPwaInstallButton>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex gap-1 items-center justify-center text-sm text-amber-500 bg-amber-50 py-1 px-2 rounded-md border border-amber-500 cursor-pointer">
                  <Award className="h-4 w-4" />0 XP
                </div>
              </TooltipTrigger>
              <TooltipContent>Rewards coming soon!</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <CNotificationHolder
            getNotificationsForUser={getNotificationsForUser}
          />
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
