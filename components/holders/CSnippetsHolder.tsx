"use client";

import { FC, Fragment, useEffect } from "react";
import CSnippet from "../common/CSnippet";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { lowercaseKeys } from "@/utilities/commonUtilities";
import { useAuth } from "@clerk/nextjs";
import { TSnippet } from "@/types/TSnippet";

const CSnippetsHolder: FC<{
  getSnippets: (lastSnippetId: string) => Promise<TSnippet[]>;
}> = ({ getSnippets }) => {
  const { userId } = useAuth();
  const { ref, inView } = useInView();
  const queryClient = useQueryClient();

  const queryFnHandler: (pageParam: string) => Promise<TSnippet[]> = async (
    pageParam
  ) => {
    const res = await getSnippets(pageParam);

    if (res?.length > 0) {
      res.map((snippet) => {
        queryClient.setQueryData(["snippet", snippet.xata_id, userId], snippet);
      });
    }

    return res;
  };

  const { status, data, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["trending-snippets", userId],
      queryFn: async ({ pageParam }): Promise<TSnippet[]> =>
        await queryFnHandler(pageParam),
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
        <div className="w-full text-center my-2">
          Loading trending snippets ✨
        </div>
      ) : status === "error" ? (
        <div className="w-full text-destructive text-center my-2">
          Some error occurred while fetching trending snippets!
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {data.pages[0].length === 0 ? (
            <div className="w-full text-center my-2">
              No snippets to show 😭
            </div>
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
                  status === "success" && "All snippets viewed! 🎉"
                )}
              </div>
            </Fragment>
          )}
        </div>
      )}
    </Fragment>
  );
};

export default CSnippetsHolder;
