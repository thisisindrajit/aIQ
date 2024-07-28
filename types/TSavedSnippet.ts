import { Prisma } from "@prisma/client";

export type TSavedSnippet = Prisma.snippet_savesGetPayload<{
  include: {
    snippets: {
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
      };
    };
  };
  where: {
    saved_by: string;
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
