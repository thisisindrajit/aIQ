import { FC } from "react";
import CNoteTextAndSaveButton from "./CNoteTextAndSaveButton";
import Link from "next/link";
import { CircleArrowRight } from "lucide-react";
import { convertToPrettyDateFormatInLocalTimezone } from "@/utilities/commonUtilities";

const Note: FC<{
  note: string;
  snippetId: string;
  lastNotedOn: Date;
  title: string;
}> = ({ note, lastNotedOn, snippetId, title }) => {
  return (
    <div className="border border-neutral-300 shadow-lg rounded-lg flex flex-col p-3 sm:p-4 gap-4 min-h-[24rem]">
      {/* Title, type and request details */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 items-center justify-center w-fit">
          <div className="text-lg/relaxed sm:text-xl/relaxed font-medium underline decoration-dotted underline-offset-8">
            {title}
          </div>
          <Link href={`/user/snippet/${snippetId}`}>
            <CircleArrowRight className="h-5 w-5 stroke-primary" />
          </Link>
        </div>
        <div className="flex flex-col gap-1">
          {lastNotedOn && (
            <div className="text-xs/loose sm:text-sm/loose text-secondary">
              Last noted{" "}
              <span className="font-semibold uppercase">
                {convertToPrettyDateFormatInLocalTimezone(lastNotedOn)}
              </span>
            </div>
          )}
        </div>
      </div>
      <CNoteTextAndSaveButton note={note} snippetId={snippetId} />
    </div>
  );
};

export default Note;
