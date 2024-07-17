"use client";

import { FC, useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Bell } from "lucide-react";
import { Prisma } from "@prisma/client";
import { convertToPrettyDateFormatInLocalTimezone } from "@/utilities/commonUtilities";
import { Separator } from "./ui/separator";
import Link from "next/link";
import { toast } from "sonner";

type TUserNotification = Prisma.user_notificationsGetPayload<{
  include: {
    list_notification_types: true;
  };
  where: {
    notification_receiver: string;
  };
  take: number;
  orderBy: {
    xata_createdat: "desc";
  };
}>;

const CNotificationBar: FC<{
  getNotificationsForUser: () => Promise<TUserNotification[]>;
}> = ({ getNotificationsForUser }) => {
  const DELAY_IN_SECONDS = 30;
  const [notifications, setNotifications] = useState<TUserNotification[]>([]);
  const [notificationBadgeCount, setNotificationBadgeCount] =
    useState<number>(0);
  const previousNotificationTimestampRef = useRef<Date>(new Date());

  useEffect(() => {
    const getLatestNotifications = async () => {
      const latestNotifications = await getNotificationsForUser();
      const latestNotificationTimestamp =
        latestNotifications[0]?.xata_createdat || new Date();
      const newNotifications = latestNotifications.filter(
        (n) => n.xata_createdat > previousNotificationTimestampRef.current
      );

      if (newNotifications.length > 0) {
        toast.info(
          `You have ${
            newNotifications.length === 1
              ? `${newNotifications.length} new notification`
              : `${newNotifications.length} new notifications`
          }!`,
          {
            duration: 7500,
          }
        );
      }

      setNotifications(latestNotifications);
      setNotificationBadgeCount(
        (prevCount) => prevCount + newNotifications.length
      );
      previousNotificationTimestampRef.current = latestNotificationTimestamp;
    };

    getLatestNotifications(); // Run immediately on mount

    const fetchNotificationsTimer = setInterval(() => {
      getLatestNotifications();
    }, DELAY_IN_SECONDS * 1000);

    return () => {
      clearInterval(fetchNotificationsTimer);
    };
  }, [getNotificationsForUser]);

  return (
    <Sheet onOpenChange={() => setNotificationBadgeCount(0)}>
      <SheetTrigger asChild>
        {notificationBadgeCount > 0 ? (
          <div className="relative inline-block">
            <div className="absolute rounded-[50%] h-4 w-4 flex flex-col items-center justify-center bg-secondary text-secondary-foreground text-[10px] p-2.5 right-[-10px] top-[-10px]">
              {notificationBadgeCount > 9 ? "9+" : notificationBadgeCount}
            </div>
            <Bell className="h-7 w-7 cursor-pointer rounded-lg bg-secondary/10 p-1.5 text-secondary border border-secondary" />
          </div>
        ) : (
          <Bell className="h-7 w-7 cursor-pointer rounded-lg bg-secondary/10 p-1.5 text-secondary border border-secondary" />
        )}
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[95%] sm:w-[24rem] px-2 sm:px-4 max-h-screen overflow-auto"
      >
        <SheetHeader>
          <SheetTitle>Latest notifications</SheetTitle>
          {previousNotificationTimestampRef.current && (
            <div className="text-xs font-medium text-primary">
              Last notification received -{" "}
              {convertToPrettyDateFormatInLocalTimezone(
                previousNotificationTimestampRef.current
              )}
            </div>
          )}
          <Separator className="bg-foreground" />
          <SheetDescription asChild>
            <div className="flex flex-col gap-2">
              {notifications.length === 0 ? (
                <div className="text-center w-full my-2">No notifications!</div>
              ) : (
                notifications.map((notification) => {
                  if (
                    notification.list_notification_types?.notification_type ===
                    "error"
                  ) {
                    const searchQuery = notification.notification.split("|")[0];
                    const doesSearchQueryContainNoInformation =
                      notification.notification
                        .toLowerCase()
                        .includes("no information");

                    return (
                      <div
                        key={notification.xata_id}
                        className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-md flex flex-col gap-4 leading-loose text-justify"
                      >
                        {doesSearchQueryContainNoInformation ? (
                          <span>
                            Some error occurred 😭 while generating snippet -{" "}
                            <span className="font-semibold italic">
                              {searchQuery}
                            </span>
                            .
                          </span>
                        ) : (
                          <span>
                            Some error occurred 😭 while generating snippet for
                            search query{" "}
                            <span className="font-semibold italic">
                              {searchQuery}
                            </span>
                            . Please try again with the same query or a similar
                            query.
                          </span>
                        )}
                        <div className="bg-background text-xs font-medium p-2 text-foreground w-fit rounded-md border border-destructive">
                          {convertToPrettyDateFormatInLocalTimezone(
                            notification.xata_createdat
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    const searchQuery = notification.notification.split("|")[0];
                    const snippetLink = notification.notification.split("|")[1];

                    return (
                      <div
                        key={notification.xata_id}
                        className="bg-secondary/10 border border-secondary text-secondary p-3 rounded-md flex flex-col gap-4 leading-loose text-justify"
                      >
                        <span>
                          Snippet has been successfully generated 🥳 for search
                          query{" "}
                          <span className="font-semibold italic">
                            {searchQuery}
                          </span>
                          . You can view it by clicking{" "}
                          <Link
                            href={snippetLink}
                            target="_blank"
                            className="font-semibold underline"
                          >
                            here
                          </Link>
                          .
                        </span>
                        <div className="bg-background text-xs font-medium p-2 text-foreground w-fit rounded-md border border-secondary">
                          {convertToPrettyDateFormatInLocalTimezone(
                            notification.xata_createdat
                          )}
                        </div>
                      </div>
                    );
                  }
                })
              )}
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default CNotificationBar;
