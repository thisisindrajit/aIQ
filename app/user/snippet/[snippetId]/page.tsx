import CSnippet from "@/components/CSnippet";
import TopBar from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { prisma } from "@/prisma/client";
import { lowercaseKeys } from "@/utilities/commonUtilities";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FC } from "react";

const Snippet: FC<{
  params: { snippetId: string };
}> = async ({ params }) => {
  const { snippetId } = params;

  if (!snippetId) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/user/dashboard`);
  }

  const snippetData = await prisma.snippets.findUnique({
    include: { snippet_type_and_data_mapping: true },
    where: {
      xata_id: snippetId,
    },
  });

  if (!snippetData) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/user/dashboard`);
  }

  const snippet = lowercaseKeys(
    JSON.parse(
      JSON.stringify(
        snippetData.snippet_type_and_data_mapping.filter(
          (x: any) => x.type === "rec_cqafk3325jvdoj83gfcg" // TODO: Change this from hardcoded user id to real snippet type by getting the value directly from DB (include the table in the prisma query)
        )[0].data
      )
    )
  );

  return (
    <div className="flex flex-col gap-12 min-h-screen p-4 lg:p-6">
      <TopBar />
      <div className="flex flex-col gap-4 w-full 2xl:w-[90%] mx-auto">
        <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/user/dashboard`}>
          <Button variant="outline" className="flex gap-2 items-center justify-center">
            <ArrowLeft className="h-4 w-4" />
            Go to trending snippets
          </Button>
        </Link>
        <CSnippet
          key={snippetData.xata_id}
          title={snippetData.snippet_title}
          whatOrWho={snippet["what/who"] ?? "No data 😭"}
          why={snippet["why"] ?? "No data 😭"}
          when={snippet["when"] ?? "No data 😭"}
          where={snippet["where"] ?? "No data 😭"}
          how={snippet["how"] ?? "No data 😭"}
          hasAmazingFacts={snippet["amazing facts"]?.length > 0}
          amazingFacts={snippet["amazing facts"] ?? []}
        />
      </div>
    </div>
  );
};

export default Snippet;
