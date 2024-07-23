"use client";

import { FC, useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Card, CardContent } from "./ui/card";
import Markdown from "react-markdown";
import { convertToPrettyDateFormatInLocalTimezone } from "@/utilities/commonUtilities";

interface ICSnippetProps {
  generatedByAi?: boolean;
  title: string;
  requestorName: string | null;
  requestedOn: Date | null;
  whatOrWho: string[];
  when: string[];
  where: string[];
  why: string[];
  how: string[];
  hasAmazingFacts: boolean;
  amazingFacts?: string[];
}

const CSnippet: FC<ICSnippetProps> = ({
  generatedByAi = false,
  title,
  requestorName,
  requestedOn,
  whatOrWho,
  when,
  where,
  why,
  how,
  hasAmazingFacts,
  amazingFacts,
}) => {
  const categoryArray = [whatOrWho, when, where, why, how];
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(5);

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
    <div className="border border-accent text-accent-foreground min-h-[24rem] h-fit rounded-lg flex flex-col p-3 sm:p-4 gap-6 lg:gap-8">
      {/* Title, type and request details */}
      <div className="flex flex-col gap-3">
        <div className="text-lg/relaxed sm:text-xl/relaxed font-medium underline decoration-dotted underline-offset-8">
          {title}
        </div>
        {requestorName && requestedOn && (
          <div className="text-xs/loose sm:text-sm/loose text-neutral-500">
            Requested{" "}
            <span className="font-semibold uppercase">
              {convertToPrettyDateFormatInLocalTimezone(requestedOn)}
            </span>{" "}
            by <span className="font-semibold italic">{requestorName}</span>
          </div>
        )}
        <div className="text-xs font-medium bg-accent text-accent-foreground py-1 px-2 w-fit rounded-lg">
          5W1H {generatedByAi && `(AI generated)`}
        </div>
      </div>
      {/* 5W1H carousel */}
      <div className="w-full md:w-4/5 m-auto flex flex-col gap-3">
        <div className="bg-background text-foreground border border-foreground p-2 rounded-md w-fit text-sm sm:text-base">
          {getCurrentSlideText(current)}
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
      {hasAmazingFacts && amazingFacts && amazingFacts.length > 0 && (
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
    </div>
  );
};

export default CSnippet;
