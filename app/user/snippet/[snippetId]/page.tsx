import CSnippet from "@/components/common/CSnippet";
import { Button } from "@/components/ui/button";
import { prisma } from "@/prisma/client";
import { lowercaseKeys } from "@/utilities/commonUtilities";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FC } from "react";

const Snippet: FC<{
  params: { snippetId: string };
}> = async ({ params }) => {
  const user = await currentUser();
  const { snippetId } = params;

  if (!snippetId || !user) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/user/dashboard`);
  }

  const snippet = await prisma.snippets.findUnique({
    include: {
      snippet_type_and_data_mapping: {
        include: {
          list_snippet_types: true
        }
      },
      snippet_likes: {
        where: {
          liked_by: {
            equals: user.id,
          },
        },
      },
      snippet_notes: {
        where: {
          noted_by: {
            equals: user.id,
          },
        },
      },
      snippet_saves: {
        where: {
          saved_by: {
            equals: user.id,
          },
        },
      },
    },
    where: {
      xata_id: snippetId,
    },
  });

  if (!snippet) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/user/dashboard`);
  }

  const snippet5w1hData = lowercaseKeys(
    JSON.parse(
      JSON.stringify(
        snippet.snippet_type_and_data_mapping.filter(
          (x) => x.list_snippet_types?.snippet_type.toLowerCase() === "5w1h"
        )[0].data ?? {}
      )
    )
  );

  const references = lowercaseKeys(
    JSON.parse(
      JSON.stringify(
        snippet.snippet_type_and_data_mapping.filter(
          (x) => x.list_snippet_types?.snippet_type.toLowerCase() === "5w1h"
        )[0]?.references ?? {}
      )
    )
  );

  return (
    <div className="flex flex-col gap-4 w-full 2xl:w-[90%] mx-auto">
      <Link href={`/user/dashboard`}>
        <Button
          variant="outline"
          className="flex gap-2 items-center justify-center"
        >
          <ArrowLeft className="h-4 w-4" />
          Go to trending snippets
        </Button>
      </Link>
      <CSnippet
        key={snippet.xata_id}
        snippetId={snippet.xata_id}
        generatedByAi={snippet.generated_by_ai || false}
        title={snippet.snippet_title}
        requestorName={snippet.requestor_name}
        requestedOn={snippet.xata_createdat}
        whatOrWho={
          snippet5w1hData["whatorwho"]?.length > 0
            ? snippet5w1hData["whatorwho"]
            : []
        }
        why={snippet5w1hData["why"]?.length > 0 ? snippet5w1hData["why"] : []}
        when={
          snippet5w1hData["when"]?.length > 0 ? snippet5w1hData["when"] : []
        }
        where={
          snippet5w1hData["where"]?.length > 0 ? snippet5w1hData["where"] : []
        }
        how={snippet5w1hData["how"]?.length > 0 ? snippet5w1hData["how"] : []}
        amazingFacts={
          snippet5w1hData["amazingfacts"]?.length > 0
            ? snippet5w1hData["amazingfacts"]
            : []
        }
        references={
          references.references?.length > 0 ? references.references : []
        }
        isLikedByUser={snippet.snippet_likes.length > 0}
        isSavedByUser={snippet.snippet_saves.length > 0}
        note={
          snippet.snippet_notes.length > 0 ? snippet.snippet_notes[0].note : ""
        }
      />
    </div>
  );
};

export default Snippet;
