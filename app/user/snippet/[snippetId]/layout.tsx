import TopBar from "@/components/TopBar";

const SnippetLayout = async ({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-12 min-h-screen p-4 lg:p-6">
      <TopBar />
      {children}
    </div>
  );
};

export default SnippetLayout;
