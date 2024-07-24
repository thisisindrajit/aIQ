"use client";

import { FC, ReactNode, useEffect } from "react";

const CTopBarHolder: FC<{ children: ReactNode }> = ({ children }) => {
  const handleScroll = () => {
    const currentScrollPos = window.scrollY;
    const topBarElement = document.getElementById("top-bar");

    // This condition is to add the "top-bar-on-scroll" class to the top bar if the current scroll position is not at the top
    if (currentScrollPos > 0) {
      topBarElement?.classList.add("top-bar-on-scroll");
    } else {
      topBarElement?.classList.remove("top-bar-on-scroll");
    }
  };

  useEffect(() => {
    const initialScrollPos = window.scrollY;
    const topBarElement = document.getElementById("top-bar");

    // This condition is to add the "top-bar-on-scroll" class to the top bar if the initial scroll position is not at the top
    if (initialScrollPos > 0) {
      topBarElement?.classList.add("top-bar-on-scroll");
    }

    window.addEventListener("scroll", handleScroll);

    // IMPORTANT: These classes are added at the end of useEffect to make sure that in case of slow loading, the top bar styling is not broken before the full JS is loaded
    topBarElement?.classList.add("sticky", "top-2");

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      id="top-bar"
      className="flex items-center justify-between transition-all duration-100 w-full z-50"
    >
      {children}
    </div>
  );
};

export default CTopBarHolder;
