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
import { separateSentences } from "@/utilities/commonUtilities";

interface ICSnippetProps {
  title: string;
  whatOrWho: string;
  when: string;
  where: string;
  why: string;
  how: string;
  hasAmazingFacts: boolean;
  amazingFacts?: string[];
}

const CSnippet: FC<ICSnippetProps> = ({
  title,
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
      case 1:
        return "🧑 What/Who";
      case 2:
        return "🕒 When";
      case 3:
        return "📍 Where";
      case 4:
        return "🤔 Why";
      case 5:
        return "🛠️ How";
      default:
        return `Slide ${current + 1} of ${count}`;
    }
  };

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="bg-accent/10 border border-accent text-accent-foreground min-h-[24rem] h-fit rounded-lg flex flex-col p-3 sm:p-4 gap-4 lg:gap-6">
      {/* Title */}
      <div className="text-lg/relaxed sm:text-xl/relaxed font-medium mb-4 underline decoration-dotted underline-offset-8">
        {title}
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
                    {!content.includes("No data") ? (
                      <ul className="flex flex-col gap-4 list-disc list-outside">
                        {separateSentences(content).map((sentence, index) => {
                          return (
                            <li
                              key={index}
                              className="leading-loose text-justify"
                            >
                              {sentence}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      content
                    )}
                  </CardContent>
                  <span className="text-sm px-2 py-1 bg-neutral-50 border border-neutral-300 rounded-lg w-fit self-end">
                    👆🏻 Swipe left or right to view more
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
                {fact}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CSnippet;
