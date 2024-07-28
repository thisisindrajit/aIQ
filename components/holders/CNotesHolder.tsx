"use client";

import { FC, Fragment, useEffect } from "react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useAuth } from "@clerk/nextjs";
import Note from "../note/Note";
import { TNote } from "@/types/TNote";

const CNotesHolder: FC<{
  getNotes: (lastNoteId: string) => Promise<TNote[]>;
}> = ({ getNotes }) => {
  const { userId } = useAuth();
  const { ref, inView } = useInView();

  const { status, data, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["user-notes", userId],
      queryFn: async ({ pageParam }): Promise<TNote[]> =>
        await getNotes(pageParam),
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
        <div className="w-full text-center my-2">Loading notes ✨</div>
      ) : status === "error" ? (
        <div className="w-full text-destructive text-center my-2">
          Some error occurred while fetching notes!
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {data.pages[0].length === 0 ? (
            <div className="w-full text-center my-2">No notes 😭</div>
          ) : (
            <Fragment>
              {data.pages.map((page, index) => (
                <Fragment key={index}>
                  {page.map((note) => {
                    if (note.note.length > 0) {
                      return (
                        <Note
                          key={note.xata_id}
                          note={note.note}
                          snippetId={note.snippets?.xata_id!}
                          title={note.snippets?.snippet_title!}
                          lastNotedOn={note.xata_updatedat}
                        />
                      );
                    }
                  })}
                </Fragment>
              ))}
              <div ref={ref} className="w-full text-center my-2">
                {isFetchingNextPage ? (
                  `Loading more notes ✨`
                ) : hasNextPage ? (
                  <div
                    className="underline cursor-pointer"
                    onClick={() => fetchNextPage()}
                  >
                    Load more notes
                  </div>
                ) : (
                  status === "success" && "All notes viewed! 🎉"
                )}
              </div>
            </Fragment>
          )}
        </div>
      )}
    </Fragment>
  );
};

export default CNotesHolder;
