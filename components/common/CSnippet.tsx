"use client";

import { FC, useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { Card, CardContent } from "../ui/card";
import Markdown from "react-markdown";
import { convertToPrettyDateFormatInLocalTimezone } from "@/utilities/commonUtilities";
import CReferenceHolder from "../holders/CReferenceHolder";
import { Bookmark, CircleArrowRight, Heart, Share } from "lucide-react";
import NotesDialogHolder from "../holders/NotesDialogHolder";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import Link from "next/link";

interface ICSnippetProps {
  snippetId: string;
  showLinkIcon?: boolean;
  generatedByAi?: boolean;
  title: string;
  requestorName: string | null;
  requestedOn: Date | null;
  savedOn?: Date | null;
  whatOrWho: string[];
  when: string[];
  where: string[];
  why: string[];
  how: string[];
  amazingFacts: string[];
  references: { link: string; title: string; description: string }[];
  showLikeSaveAndNotes?: boolean;
  isLikedByUser?: boolean;
  isSavedByUser?: boolean;
  note?: string;
}

const CSnippet: FC<ICSnippetProps> = ({
  snippetId,
  showLinkIcon = false,
  generatedByAi = false,
  title,
  requestorName,
  requestedOn,
  savedOn,
  whatOrWho,
  when,
  where,
  why,
  how,
  amazingFacts,
  references,
  showLikeSaveAndNotes = true,
  isLikedByUser = false,
  isSavedByUser = false,
  note = "",
}) => {
  const categoryArray = [whatOrWho, when, where, why, how];

  const { userId } = useAuth();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(5);
  const [liked, setLiked] = useState(isLikedByUser);
  const [isLiking, setIsLiking] = useState(false);
  const [saved, setSaved] = useState(isSavedByUser);
  const [isSaving, setIsSaving] = useState(false);

  const getCurrentSlideText = (current: number) => {
    switch (current) {
      case 0:
        return "🧑 What/Who";
      case 1:
        return "🕒 When";
      case 2:
        return "📍 Where";
      case 3:
        return "🤔 Why";
      case 4:
        return "🛠️ How";
      default:
        return `Slide ${current} of ${count}`;
    }
  };

  const handleLike = async () => {
    setIsLiking(true);

    const likeApi = await fetch(
      `/api/user/${userId}/snippet/${snippetId}/like/${liked ? "0" : "1"}`,
      {
        method: "GET",
      }
    );

    if (likeApi.ok) {
      toast.success(`Snippet ${liked ? "disliked" : "liked"} successfully! ❤️`);
      setLiked(!liked);
    } else {
      toast.error("Failed to like snippet 😢");
    }

    setIsLiking(false);
  };

  const handleSave = async () => {
    setIsSaving(true);

    const saveApi = await fetch(
      `/api/user/${userId}/snippet/${snippetId}/save/${liked ? "0" : "1"}`,
      {
        method: "GET",
      }
    );

    if (saveApi.ok) {
      toast.success(`Snippet ${saved ? "unsaved" : "saved"} successfully! ❤️`);
      setSaved(!saved);
    } else {
      toast.error("Failed to save snippet 😢");
    }

    setIsSaving(false);
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard
      .writeText(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/snippet/${snippetId}`
      )
      .then(() => {
        toast.success("Link copied to clipboard! 📋");
      })
      .catch(() => {
        toast.error("Failed to copy link to clipboard 😢");
      });
  };

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="border border-neutral-300 shadow-lg text-accent-foreground min-h-[24rem] h-fit rounded-lg flex flex-col p-3 sm:p-4 gap-6 lg:gap-8">
      {/* Title, type and request details */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 items-center justify-center w-fit">
          <div className="text-lg/relaxed sm:text-xl/relaxed font-medium underline decoration-dotted underline-offset-8">
            {title}
          </div>
          {showLinkIcon && (
            <Link href={`/user/snippet/${snippetId}`}>
              <CircleArrowRight className="h-5 w-5 stroke-primary" />
            </Link>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {savedOn && (
            <div className="text-xs/loose sm:text-sm/loose text-secondary">
              Saved{" "}
              <span className="font-semibold uppercase">
                {convertToPrettyDateFormatInLocalTimezone(savedOn)}
              </span>
            </div>
          )}
          {requestorName && requestedOn && (
            <div className="text-xs/loose sm:text-sm/loose text-neutral-500">
              Requested{" "}
              <span className="font-semibold uppercase">
                {convertToPrettyDateFormatInLocalTimezone(requestedOn)}
              </span>{" "}
              by <span className="font-semibold italic">{requestorName}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center justify-center w-fit font-medium">
          <div className="text-xs bg-accent text-accent-foreground py-1 px-2 w-fit rounded-lg">
            5W1H {generatedByAi && `(AI generated)`}
          </div>
          {references?.length > 0 && (
            <CReferenceHolder references={references} />
          )}
        </div>
      </div>
      {/* 5W1H carousel */}
      <div className="w-full md:w-4/5 m-auto flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="bg-background text-foreground border border-foreground p-2 rounded-md w-fit text-sm sm:text-base">
            {getCurrentSlideText(current)}
          </div>
          {showLikeSaveAndNotes && (
            <NotesDialogHolder
              snippetId={snippetId}
              snippetTitle={title}
              note={note}
            />
          )}
        </div>
        <Carousel setApi={setApi} opts={{ loop: true }}>
          <CarouselContent>
            {categoryArray.map((content, index) => (
              <CarouselItem key={index}>
                <Card className="flex flex-col w-full p-3 select-none">
                  <CardContent className="px-4">
                    <ul className="flex flex-col gap-4 list-disc list-outside">
                      {content?.length > 0 ? (
                        content.map((sentence, index) => {
                          return (
                            <li
                              key={index}
                              className="leading-loose text-justify"
                            >
                              <Markdown>{sentence}</Markdown>
                            </li>
                          );
                        })
                      ) : (
                        <li>No data available 😭</li>
                      )}
                    </ul>
                  </CardContent>
                  <span className="text-sm px-2 py-1 bg-neutral-50 border border-neutral-300 rounded-lg w-fit self-end">
                    👆🏻 Swipe for knowing{" "}
                    {getCurrentSlideText((current + 1) % count)}
                  </span>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
      {/* Amazing facts */}
      {amazingFacts?.length > 0 && (
        <div className="bg-accent/35 p-3 rounded-lg flex flex-col gap-4">
          <span className="bg-background text-foreground border border-foreground p-2 rounded-md w-fit">
            {`🤯 Amazing facts`}
          </span>
          <ul className="flex flex-col gap-4 px-4 list-disc list-outside">
            {amazingFacts.map((fact, index) => (
              <li key={index} className="leading-loose text-justify">
                <Markdown>{fact}</Markdown>
              </li>
            ))}
          </ul>
        </div>
      )}
      {showLikeSaveAndNotes && (
        <div className="flex items-center w-fit gap-2 h-10 select-none">
          <div
            className="bg-red-50 flex items-center justify-center gap-1.5 text-sm w-fit text-red-600 p-2.5 sm:px-4 sm:py-3 h-full rounded-md cursor-pointer border border-red-600"
            onClick={isLiking ? () => {} : handleLike}
          >
            {liked ? (
              <Heart className="h-4 w-4 fill-red-600" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
            {isLiking
              ? liked
                ? "Disliking..."
                : "Liking..."
              : liked
              ? "Liked"
              : "Like"}
          </div>
          <div
            className="bg-orange-50 flex items-center justify-center gap-1.5 text-sm w-fit text-orange-600 p-2.5 sm:px-4 sm:py-3 h-full rounded-md cursor-pointer border border-orange-600"
            onClick={isSaving ? () => {} : handleSave}
          >
            {saved ? (
              <Bookmark className="h-4 w-4 fill-orange-600" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            {isSaving
              ? saved
                ? "Unsaving..."
                : "Saving..."
              : saved
              ? "Saved"
              : "Save"}
          </div>
          <div
            className="bg-emerald-50 text-sm w-fit text-emerald-600 rounded-md cursor-pointer border border-emerald-600 p-2.5 sm:p-3 h-full aspect-square flex items-center justify-center"
            onClick={copyLinkToClipboard}
          >
            <Share className="h-4 w-4" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CSnippet;
