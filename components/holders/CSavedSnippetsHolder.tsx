"use client";

import { FC, Fragment, useEffect } from "react";
import CSnippet from "../common/CSnippet";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { lowercaseKeys } from "@/utilities/commonUtilities";
import { useAuth } from "@clerk/nextjs";
import { TSavedSnippet } from "@/types/TSavedSnippet";

const CSavedSnippetsHolder: FC<{
  getSavedSnippets: (lastSnippetId: string) => Promise<TSavedSnippet[]>;
}> = ({ getSavedSnippets }) => {
  const { userId } = useAuth();
  const { ref, inView } = useInView();

  const { status, data, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["user-saved-snippets", userId],
      queryFn: async ({ pageParam }): Promise<TSavedSnippet[]> =>
        await getSavedSnippets(pageParam),
      initialPageParam: "0",
      getNextPageParam: (lastPage) =>
        lastPage?.length === 0 ? null : lastPage[lastPage.length - 1].xata_id,
      refetchInterval:
        Number(process.env.REFETCH_INTERVAL_IN_SECONDS ?? 15) * 1000,
      refetchIntervalInBackground: true,
      placeholderData: keepPreviousData,
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
                  {page.map((saved_snippet) => {
                    const snippet5w1hData = lowercaseKeys(
                      JSON.parse(
                        JSON.stringify(
                          saved_snippet.snippets?.snippet_type_and_data_mapping.filter(
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
                          saved_snippet.snippets?.snippet_type_and_data_mapping.filter(
                            (x) =>
                              x.list_snippet_types?.snippet_type.toLowerCase() ===
                              "5w1h"
                          )[0]?.references ?? {}
                        )
                      )
                    );

                    return (
                      <CSnippet
                        key={saved_snippet.snippets?.xata_id}
                        snippetId={saved_snippet.snippets?.xata_id || ''}
                        showLinkIcon={true}
                        generatedByAi={saved_snippet.snippets?.generated_by_ai || false}
                        title={saved_snippet.snippets?.snippet_title || ''}
                        requestorName={saved_snippet.snippets?.requestor_name || ''}
                        requestedOn={saved_snippet.snippets?.xata_createdat || new Date()}
                        savedOn={saved_snippet.xata_createdat}
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
                        isLikedByUser={saved_snippet.snippets?.snippet_likes ? saved_snippet.snippets?.snippet_likes?.length > 0 : false}
                        isSavedByUser={true}
                        note={
                          saved_snippet.snippets?.snippet_notes && saved_snippet.snippets?.snippet_notes?.length > 0
                            ? saved_snippet.snippets?.snippet_notes[0].note
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
