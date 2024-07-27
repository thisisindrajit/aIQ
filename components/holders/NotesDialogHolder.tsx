import { NotepadText } from "lucide-react";
import { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CNoteTextAndSaveButton from "../note/CNoteTextAndSaveButton";

const NotesDialogHolder: FC<{
  snippetId: string;
  snippetTitle: string;
  note: string;
}> = ({ snippetId, snippetTitle, note }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="border border-primary text-primary p-2 h-full aspect-square flex items-center justify-center rounded-md cursor-pointer">
          <NotepadText className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </DialogTrigger>
      <DialogContent
        className="h-[80%] sm:max-w-[75%] sm:max-h-[80%] overflow-auto flex flex-col justify-between gap-4 rounded-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Notes for {snippetTitle}</DialogTitle>
          <DialogDescription>
            Take notes for this snippet and refer them later. Make sure to save
            your notes 😁
          </DialogDescription>
        </DialogHeader>
        <CNoteTextAndSaveButton note={note} snippetId={snippetId} />
      </DialogContent>
    </Dialog>
  );
};

export default NotesDialogHolder;
