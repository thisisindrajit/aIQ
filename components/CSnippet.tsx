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
    <div className="bg-accent/10 border border-accent text-accent-foreground min-h-[24rem] h-fit rounded-lg flex flex-col p-3 sm:p-4 gap-6">
      {/* Title */}
      <div className="text-lg/relaxed sm:text-xl/relaxed font-medium">
        {title}
      </div>
      {/* 5W1H carousel */}
      <div className="w-full md:w-4/5 m-auto flex flex-col gap-3">
        <div className="bg-background text-foreground border border-foreground p-2 rounded-md w-fit text-sm sm:text-base">
          {getCurrentSlideText(current)}
        </div>
        <Carousel setApi={setApi}>
          <CarouselContent>
            {categoryArray.map((content, index) => (
              <CarouselItem key={index}>
                <Card>
                  <CardContent className="flex w-full h-[24rem] p-6">
                    <span>{content}</span>
                  </CardContent>
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
        <div className="bg-accent/35 p-4 rounded-md flex flex-col gap-4">
          <span className="bg-background text-foreground border border-foreground p-2 rounded-md w-fit">
            {`🤯 Amazing facts`}
          </span>
          <ul className="flex flex-col gap-3 list-disc list-inside leading-relaxed">
            {amazingFacts.map((fact, index) => (
              <li key={index}>{fact}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CSnippet;
