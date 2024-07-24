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
      refetchInterval: 30000,
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
          {data.pages.map((page, index) => (
            <Fragment key={index}>
              {page.map((snippet) => {
                const snippet5w1hData = lowercaseKeys(
                  JSON.parse(
                    JSON.stringify(
                      snippet.snippet_type_and_data_mapping.filter(
                        (x: any) => x.type === "rec_cqafk3325jvdoj83gfcg" // TODO: Change this from hardcoded user id to real snippet type by getting the value directly from DB (include the table in the prisma query)
                      )[0]?.data ?? {}
                    )
                  )
                );

                const references = lowercaseKeys(
                  JSON.parse(
                    JSON.stringify(
                      snippet.snippet_type_and_data_mapping.filter(
                        (x: any) => x.type === "rec_cqafk3325jvdoj83gfcg" // TODO: Change this from hardcoded user id to real snippet type by getting the value directly from DB (include the table in the prisma query)
                      )[0]?.references ?? {}
                    )
                  )
                )

                return (
                  <CSnippet
                    key={snippet.xata_id}
                    generatedByAi={snippet.generated_by_ai || false}
                    title={snippet.snippet_title}
                    requestorName={snippet.requestor_name}
                    requestedOn={snippet.xata_createdat}
                    whatOrWho={
                      snippet5w1hData["whatorwho"]?.length > 0 || snippet5w1hData["what"]?.length > 0 || snippet5w1hData["who"]?.length > 0
                        ? snippet5w1hData["whatorwho"] ?? snippet5w1hData["what"] ?? snippet5w1hData["who"]
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
                    references={references.references?.length > 0 ? references.references : []}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>
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
