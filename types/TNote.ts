import { Prisma } from "@prisma/client";

export type TNote = Prisma.snippet_notesGetPayload<{
  include: {
    snippets: true;
  };
  where: {
    noted_by: string;
  };
  orderBy: {
    xata_updatedat: "desc";
  };
  skip?: number;
  take: number;
  cursor?: {
    xata_id: string;
  };
}>;
