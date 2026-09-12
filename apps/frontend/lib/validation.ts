import { z } from "zod";

export type FieldErrors = Record<string, string | undefined>;

// First message per field — stable, short, UI-ready.
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const flat = z.flattenError(error);
  const out: FieldErrors = {};
  for (const [key, messages] of Object.entries(flat.fieldErrors)) {
    const first = (messages as string[] | undefined)?.[0];
    if (first) out[key] = first;
  }
  return out;
}
