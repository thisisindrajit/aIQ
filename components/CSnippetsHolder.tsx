"use client";

import { FC, Fragment, useEffect } from "react";
import CSnippet from "./CSnippet";
import { Prisma } from "@prisma/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

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
        <div className="w-full text-danger text-center my-2">
          Some error occurred while fetching trending snippets!
        </div>
      ) : (
        <Fragment>
          {data.pages.map((page, index) => (
            <Fragment key={index}>
              {page.map((snippet) => (
                <CSnippet
                  key={index}
                  title={snippet.snippet_title}
                  whatOrWho={
                    JSON.parse(
                      JSON.stringify(
                        snippet.snippet_type_and_data_mapping.filter(
                          (x: any) => x.type === "rec_cqafk3325jvdoj83gfcg"
                        )[0].data
                      )
                    )["what/who"] ?? "No data 😭"
                  }
                  why={
                    JSON.parse(
                      JSON.stringify(
                        snippet.snippet_type_and_data_mapping.filter(
                          (x) => x.type === "rec_cqafk3325jvdoj83gfcg"
                        )[0].data
                      )
                    )["why"] ?? "No data 😭"
                  }
                  when={
                    JSON.parse(
                      JSON.stringify(
                        snippet.snippet_type_and_data_mapping.filter(
                          (x) => x.type === "rec_cqafk3325jvdoj83gfcg"
                        )[0].data
                      )
                    )["when"] ?? "No data 😭"
                  }
                  where={
                    JSON.parse(
                      JSON.stringify(
                        snippet.snippet_type_and_data_mapping.filter(
                          (x) => x.type === "rec_cqafk3325jvdoj83gfcg"
                        )[0].data
                      )
                    )["where"] ?? "No data 😭"
                  }
                  how={
                    JSON.parse(
                      JSON.stringify(
                        snippet.snippet_type_and_data_mapping.filter(
                          (x) => x.type === "rec_cqafk3325jvdoj83gfcg"
                        )[0].data
                      )
                    )["how"] ?? "No data 😭"
                  }
                  hasAmazingFacts={
                    JSON.parse(
                      JSON.stringify(
                        snippet.snippet_type_and_data_mapping.filter(
                          (x) => x.type === "rec_cqafk3325jvdoj83gfcg"
                        )[0].data
                      )
                    )["amazing facts"]?.length > 0
                  }
                  amazingFacts={
                    JSON.parse(
                      JSON.stringify(
                        snippet.snippet_type_and_data_mapping.filter(
                          (x) => x.type === "rec_cqafk3325jvdoj83gfcg"
                        )[0].data
                      )
                    )["amazing facts"] ?? []
                  }
                />
              ))}
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
