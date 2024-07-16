"use client";

import { FC, Fragment, useEffect } from "react";
import CSnippet from "./CSnippet";
import { Prisma } from "@prisma/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { lowercaseKeys } from "@/utilities/commonUtilities";

type TSnippets = Prisma.snippetsGetPayload<{
  include: {
    snippet_type_and_data_mapping: true;
  };
  skip?: number;
  take: number;
  cursor?: {
    xata_id: string;
  };
  orderBy: {
    xata_createdat: "desc";
  };
}>;

const CSnippetsHolder: FC<{
  getSnippets: (lastSnippetId: string) => Promise<TSnippets[]>;
}> = ({ getSnippets }) => {
  const { ref, inView } = useInView();

  const { status, data, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["trending-snippets"],
      queryFn: async ({ pageParam }): Promise<TSnippets[]> =>
        await getSnippets(pageParam),
      initialPageParam: "0",
      getNextPageParam: (lastPage) =>
        lastPage?.length === 0 ? null : lastPage[lastPage.length - 1].xata_id,
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
        <Fragment>
          {data.pages.map((page, index) => (
            <Fragment key={index}>
              {page.map((snippet) => {
                const snippetData = lowercaseKeys(
                  JSON.parse(
                    JSON.stringify(
                      snippet.snippet_type_and_data_mapping.filter(
                        (x: any) => x.type === "rec_cqafk3325jvdoj83gfcg" // TODO: Change this from hardcoded user id to real snippet type by getting the value directly from DB (include the table in the prisma query)
                      )[0].data
                    )
                  )
                );

                return (
                  <CSnippet
                    key={snippet.xata_id}
                    title={snippet.snippet_title}
                    whatOrWho={snippetData["what/who"] ?? "No data 😭"}
                    why={snippetData["why"] ?? "No data 😭"}
                    when={snippetData["when"] ?? "No data 😭"}
                    where={snippetData["where"] ?? "No data 😭"}
                    how={snippetData["how"] ?? "No data 😭"}
                    hasAmazingFacts={snippetData["amazing facts"]?.length > 0}
                    amazingFacts={snippetData["amazing facts"] ?? []}
                  />
                );
              })}
            </Fragment>
          ))}
        </Fragment>
      )}
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
  );
};

export default CSnippetsHolder;
