type TGenerateSnippet = {
  data: {
    searchQuery: string;
    userId?: string | null;
  };
};

export type TEvents = {
  "app/generate.snippet": TGenerateSnippet;
};
