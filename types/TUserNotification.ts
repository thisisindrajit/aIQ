import { Prisma } from "@prisma/client";

export type TUserNotification = Prisma.user_notificationsGetPayload<{
  include: {
    list_notification_types: true;
  };
  where: {
    notification_receiver: string;
  };
  take: number;
  orderBy: {
    xata_id: "desc";
  };
}>;
