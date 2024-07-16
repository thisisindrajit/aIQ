"use client";

import { FC, useEffect, useState } from "react";
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
  const [lastNotificationTimestamp, setLastNotificationTimestamp] =
    useState<Date | null>(null);
  const [notificationBadgeCount, setNotificationBadgeCount] =
    useState<number>(0);

  useEffect(() => {
    const getNotificationsAndSetState = async () => {
      const latestNotifications = await getNotificationsForUser();
      const lastNotificationTimestamp = latestNotifications[0]?.xata_createdat;
      const latestNotificationBadgeCount = latestNotifications.filter(
        (n) => n.xata_createdat > lastNotificationTimestamp
      ).length;

      //   console.log(
      //     latestNotifications,
      //     lastNotificationTimestamp,
      //     latestNotificationBadgeCount
      //   );

      setNotificationBadgeCount(latestNotificationBadgeCount);
      setNotifications(latestNotifications);
      setLastNotificationTimestamp(lastNotificationTimestamp);
    };

    // TODO: In future, change this to a websocket connection
    let fetchNotificationTimer = setInterval(
      getNotificationsAndSetState,
      DELAY_IN_SECONDS * 1000
    );

    getNotificationsAndSetState();

    return () => {
      clearTimeout(fetchNotificationTimer);
    };
  }, [getNotificationsForUser]);

  return (
    <Sheet>
      <SheetTrigger>
        <Bell className="h-7 w-7 cursor-pointer rounded-lg bg-secondary/10 p-1.5 text-secondary border border-secondary" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[95%] sm:w-[24rem] px-2 sm:px-4 max-h-screen overflow-auto"
      >
        <SheetHeader>
          <SheetTitle>Latest notifications</SheetTitle>
          <SheetDescription asChild>
            <div className="flex flex-col gap-2">
              {notifications.length === 0 ? (
                <div className="text-center w-full">No notifications!</div>
              ) : (
                notifications.map((notification) =>
                  notification.list_notification_types?.notification_type ===
                  "error" ? (
                    <div
                      key={notification.xata_id}
                      className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-md"
                    >
                      {notification.notification}
                    </div>
                  ) : (
                    <div
                      key={notification.xata_id}
                      className="bg-secondary/10 border border-secondary text-secondary p-3 rounded-md"
                    >
                      {notification.notification}
                    </div>
                  )
                )
              )}
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default CNotificationBar;
