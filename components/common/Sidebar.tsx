import { Bookmark, NotepadText, TrendingUp } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

const SideBar: FC<{ active: number }> = ({ active }) => {
  return (
    <div className="hidden xl:flex flex-col min-w-[16rem] sticky p-3 h-80 top-20 rounded-lg gap-1.5 my-3.5 border border-primary">
      <Link href="/user/dashboard"
        className={`${
          active === 1
            ? "bg-primary text-primary-foreground"
            : "bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground"
        } flex gap-2 items-center justify-center p-4 w-full rounded-md cursor-pointer transition-all`}
      >
        <span>Trending snippets</span>
        <TrendingUp className="h-4 w-4" />
      </Link>
      <Link href="/user/saved"
        className={`${
          active === 2
            ? "bg-primary text-primary-foreground"
            : "bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground"
        } flex gap-2 items-center justify-center p-4 w-full rounded-md cursor-pointer transition-all`}
      >
        <Bookmark className="h-4 w-4" />
        <span>Saved snippets</span>
      </Link>
      <Link href="/user/notes"
        className={`${
          active === 3
            ? "bg-primary text-primary-foreground"
            : "bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground"
        } flex gap-2 items-center justify-center p-4 w-full rounded-md cursor-pointer transition-all`}
      >
        <NotepadText className="h-4 w-4" />
        <span>My notes</span>
      </Link>
    </div>
  );
};

export default SideBar;
