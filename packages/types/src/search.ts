import { z } from "zod";

export const SearchResponseSchema = z.object({
  results: z.array(
    z.object({
      type: z.enum(["request", "client", "invoice"]),
      id: z.string(),
      title: z.string(),
      subtitle: z.string(),
      url: z.string(),
    }),
  ),
});

export type SearchResult = z.infer<typeof SearchResponseSchema>["results"][number];
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
