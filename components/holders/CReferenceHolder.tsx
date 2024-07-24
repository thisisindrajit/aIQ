"use client";

import { FC } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ClipboardList, ExternalLink } from "lucide-react";
import Link from "next/link";

const CReferenceHolder: FC<{
  references: { link: string; title: string; description: string }[];
}> = ({ references }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="text-sm text-secondary flex gap-1 items-center justify-center underline underline-offset-4 cursor-pointer select-none">
          <ClipboardList className="h-4 w-4" />
          References
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[20rem] overflow-auto z-20 border-secondary mt-1 shadow-lg flex flex-col gap-3 p-3">
        {references.map((reference, index) => (
          <Link
            key={index}
            href={reference.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-secondary/5 border border-secondary flex flex-col gap-2 rounded-md p-3"
          >
            <div className="font-medium text-base flex gap-2 items-center">
              <span className="truncate text-secondary">{reference.title}</span>
              <ExternalLink className="h-4 min-w-[1rem]" />
            </div>
            <div className="text-sm/loose text-justify">{reference.description}</div>
          </Link>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default CReferenceHolder;
