import Link from "next/link";
import { FC } from "react";

const Tabs: FC<{ active: number }> = ({ active }) => {
  return (
    <div className="grid grid-cols-3 xl:hidden gap-1 rounded-lg border border-primary/50 text-sm p-1 w-full md:w-3/5 m-auto">
      <Link href="/user/dashboard" className={`${active === 1 ? "bg-primary text-primary-foreground" : "text-foreground"} py-2 px-4 rounded-md text-center transition-all`}>
        Trending
      </Link>
      <Link href="/user/saved" className={`${active === 2 ? "bg-primary text-primary-foreground" : "text-foreground"} py-2 px-4 rounded-md text-center transition-all`}>
        Saved
      </Link>
      <Link href="/user/notes" className={`${active === 3 ? "bg-primary text-primary-foreground" : "text-foreground"} py-2 px-4 rounded-md text-center transition-all`}>
        Notes
      </Link>
    </div>
  );
};

export default Tabs;
