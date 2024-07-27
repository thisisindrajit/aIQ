"use client";

import { FC, Fragment, useEffect } from "react";
import CSnippet from "../common/CSnippet";
import { Prisma } from "@prisma/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { lowercaseKeys } from "@/utilities/commonUtilities";
import { useAuth } from "@clerk/nextjs";

type TSavedSnippets = Prisma.snippetsGetPayload<{
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
      orderBy: {
        xata_createdat: "desc",
      };
    };
  };
  where: {
    snippet_saves: {
      some: {
        saved_by: string;
      };
    };
  };
  skip?: number;
  take: number;
  cursor?: {
    xata_id: string;
  };
}>;

const CSavedSnippetsHolder: FC<{
  getSavedSnippets: (lastSnippetId: string) => Promise<TSavedSnippets[]>;
}> = ({ getSavedSnippets }) => {
  const { userId } = useAuth();
  const { ref, inView } = useInView();

  const { status, data, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["user-saved-snippets", userId],
      queryFn: async ({ pageParam }): Promise<TSavedSnippets[]> =>
        await getSavedSnippets(pageParam),
      initialPageParam: "0",
      getNextPageParam: (lastPage) =>
        lastPage?.length === 0 ? null : lastPage[lastPage.length - 1].xata_id,
      refetchInterval:
        Number(process.env.REFETCH_INTERVAL_IN_SECONDS ?? 15) * 1000,
      refetchIntervalInBackground: true,
      refetchOnMount: "always",
    });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  return (
    <Fragment>
      {status === "pending" ? (
        <div className="w-full text-center my-2">Loading saved snippets ✨</div>
      ) : status === "error" ? (
        <div className="w-full text-destructive text-center my-2">
          Some error occurred while fetching saved snippets!
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {data.pages[0].length === 0 ? (
            <div className="w-full text-center my-2">No saved snippets 😭</div>
          ) : (
            <Fragment>
              {data.pages.map((page, index) => (
                <Fragment key={index}>
                  {page.map((snippet) => {
                    const snippet5w1hData = lowercaseKeys(
                      JSON.parse(
                        JSON.stringify(
                          snippet.snippet_type_and_data_mapping.filter(
                            (x) =>
                              x.list_snippet_types?.snippet_type.toLowerCase() ===
                              "5w1h"
                          )[0]?.data ?? {}
                        )
                      )
                    );

                    const references = lowercaseKeys(
                      JSON.parse(
                        JSON.stringify(
                          snippet.snippet_type_and_data_mapping.filter(
                            (x) =>
                              x.list_snippet_types?.snippet_type.toLowerCase() ===
                              "5w1h"
                          )[0]?.references ?? {}
                        )
                      )
                    );

                    return (
                      <CSnippet
                        key={snippet.xata_id}
                        snippetId={snippet.xata_id}
                        showLinkIcon={true}
                        generatedByAi={snippet.generated_by_ai || false}
                        title={snippet.snippet_title}
                        requestorName={snippet.requestor_name}
                        requestedOn={snippet.xata_createdat}
                        savedOn={snippet.snippet_saves[0].xata_createdat}
                        whatOrWho={
                          snippet5w1hData["whatorwho"]?.length > 0 ||
                          snippet5w1hData["what"]?.length > 0 ||
                          snippet5w1hData["who"]?.length > 0
                            ? snippet5w1hData["whatorwho"] ??
                              snippet5w1hData["what"] ??
                              snippet5w1hData["who"]
                            : []
                        }
                        why={
                          snippet5w1hData["why"]?.length > 0
                            ? snippet5w1hData["why"]
                            : []
                        }
                        when={
                          snippet5w1hData["when"]?.length > 0
                            ? snippet5w1hData["when"]
                            : []
                        }
                        where={
                          snippet5w1hData["where"]?.length > 0
                            ? snippet5w1hData["where"]
                            : []
                        }
                        how={
                          snippet5w1hData["how"]?.length > 0
                            ? snippet5w1hData["how"]
                            : []
                        }
                        amazingFacts={
                          snippet5w1hData["amazingfacts"]?.length > 0
                            ? snippet5w1hData["amazingfacts"]
                            : []
                        }
                        references={
                          references.references?.length > 0
                            ? references.references
                            : []
                        }
                        isLikedByUser={snippet.snippet_likes.length > 0}
                        isSavedByUser={snippet.snippet_saves.length > 0}
                        note={
                          snippet.snippet_notes.length > 0
                            ? snippet.snippet_notes[0].note
                            : ""
                        }
                      />
                    );
                  })}
                </Fragment>
              ))}
              <div ref={ref} className="w-full text-center my-2">
                {isFetchingNextPage ? (
                  `Loading more snippets ✨`
                ) : hasNextPage ? (
                  <div
                    className="underline cursor-pointer"
                    onClick={() => fetchNextPage()}
                  >
                    Load more snippets
                  </div>
                ) : (
                  status === "success" && "All saved snippets viewed! 🎉"
                )}
              </div>
            </Fragment>
          )}
        </div>
      )}
    </Fragment>
  );
};

export default CSavedSnippetsHolder;
