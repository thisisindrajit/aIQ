"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search } from "lucide-react";
import { FC, ChangeEvent, FormEvent, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

const CSearchBar: FC<{
  inngestContentGenerationFunctionCaller: (
    searchQuery: string,
    userId?: string | null
  ) => Promise<void>;
}> = ({ inngestContentGenerationFunctionCaller }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [width, setWidth] = useState(18);
  const { userId } = useAuth();

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setWidth(e.target.value.length > 18 ? e.target.value.length : 18);
  };

  const submitHandler = async (e: FormEvent) => {
    e.preventDefault();

    const formattedSearchQuery = searchQuery.trim();

    if (formattedSearchQuery === "")
      return alert("Please enter a search query!");

    setSearchQuery("");

    toast.success(
      <div className="text-sm/loose">
        Hurray 🥳, your request for search query{" "}
        <span className="font-semibold italic">{searchQuery}</span> has been
        queued! You will receive a notification when the AI generated snippet is
        available.
      </div>,
      {
        duration: 10000,
      }
    );

    try {
      await inngestContentGenerationFunctionCaller(
        formattedSearchQuery,
        userId
      );
    } catch (error) {
      toast.error(
        <div className="text-sm/loose">
          Error while generating snippet for search query{" "}
          <span className="font-semibold italic">{searchQuery}</span>! Please
          try again.
        </div>,
        {
          duration: 10000,
        }
      );
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2 text-xl md:text-2xl m-auto my-6">
      <span className="min-w-fit no-underline md:underline decoration-dotted underline-offset-[14px]">
        Today I want to know about
      </span>
      <form onSubmit={submitHandler} className="flex gap-2">
        <Input
          placeholder="type in any topic..."
          className="text-xl md:text-2xl text-center sm:text-left px-0 pb-2 md:pb-4 rounded-none outline-none border-x-0 border-t-0 border-b-2 border-gray-300 text-tertiary placeholder:italic focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus-visible:border-tertiary focus-visible:placeholder:opacity-0 sm:focus-visible:placeholder:opacity-100 duration-200 ease-in-out max-w-[72vw] sm:max-w-[42vw] md:max-w-[48vw]"
          style={{ width: width + "ch" }}
          maxLength={255}
          value={searchQuery}
          onChange={(e) => changeHandler(e)}
        />
        <Button
          size="icon"
          type="submit"
          className="rounded-full bg-tertiary text-tertiary-foreground hover:bg-tertiary/90"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default CSearchBar;
