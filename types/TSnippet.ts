import { Prisma } from "@prisma/client";

export type TSnippet = Prisma.snippetsGetPayload<{
  include: {
    snippet_type_and_data_mapping: {
      include: {
        list_snippet_types: true;
      };
    };
    snippet_likes: {
      where: {
        liked_by: {
          equals: string;
        };
      };
    };
    snippet_notes: {
      where: {
        noted_by: {
          equals: string;
        };
      };
    };
    snippet_saves: {
      where: {
        saved_by: {
          equals: string;
        };
      };
    };
  };
  skip?: number;
  take: number;
  cursor?: {
    xata_id: string;
  };
  orderBy: {
    xata_id: "desc";
  };
}>;
