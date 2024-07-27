"use client";

import { FC, Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

const CNoteTextAndSaveButton: FC<{ note: string; snippetId: string }> = ({
  note,
  snippetId,
}) => {
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
    <Fragment>
      <Textarea
        placeholder="Type your notes here..."
        value={currentNote}
        onChange={(e) => {
          setCurrentNote(e.target.value);
        }}
        className="h-full text-sm md:text-base resize-none leading-relaxed"
      />
      <Button
        disabled={isSavingNote}
        onClick={isSavingNote ? () => {} : handleSaveNote}
        className="w-full sm:w-fit self-end"
      >
        {isSavingNote ? "Saving note..." : "Save note"}
      </Button>
    </Fragment>
  );
};

export default CNoteTextAndSaveButton;
