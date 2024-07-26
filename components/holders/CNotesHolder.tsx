"use client";

import { NotepadText } from "lucide-react";
import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

const CNotesHolder: FC<{
  snippetId: string;
  snippetTitle: string;
  note: string;
}> = ({ snippetId, snippetTitle, note }) => {
  const { userId } = useAuth();
  const [prevNote, setPrevNote] = useState(note);
  const [currentNote, setCurrentNote] = useState(note);
  const [isSavingNote, setIsSavingNote] = useState(false);

  const handleSaveNote = async () => {
    const prevNoteTrimmed = prevNote.trim();
    const updatedNoteTrimmed = currentNote.trim();

    setIsSavingNote(true);

    if (prevNoteTrimmed === updatedNoteTrimmed) {
      toast.info("Note is same as before! 😅");
      setIsSavingNote(false);
      return;
    }


    const saveNoteApi = await fetch(
      `/api/user/${userId}/snippet/${snippetId}/note`,
      {
        method: "POST",
        body: JSON.stringify({
          note: updatedNoteTrimmed,
        }),
      }
    );

    if (saveNoteApi.ok) {
      toast.success(`Note saved successfully! ❤️`);
      setPrevNote(updatedNoteTrimmed);
    } else {
      toast.error("Failed to save note 😢");
    }

    setIsSavingNote(false);
  };

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
        <Textarea
          placeholder="Type your notes here..."
          value={currentNote}
          onChange={(e) => {
            setCurrentNote(e.target.value);
          }}
          className="h-full text-sm md:text-base resize-none"
        />
        <Button
          disabled={isSavingNote}
          onClick={isSavingNote ? () => {} : handleSaveNote}
        >
          {isSavingNote ? "Saving note..." : "Save note"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CNotesHolder;
