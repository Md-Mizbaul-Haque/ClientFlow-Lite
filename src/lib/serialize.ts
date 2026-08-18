import type { Document } from "mongoose";

export function toPlain<T>(doc: Document | null | undefined): T | null {
  if (!doc) return null;
  const obj = doc.toObject({ versionKey: false });
  return {
    ...obj,
    id: String(obj._id),
    _id: undefined,
  } as unknown as T;
}

export function toPlainArray<T>(docs: Document[] | readonly Document[]): T[] {
  return docs.map((d) => toPlain<T>(d)).filter((d): d is T => d !== null);
}

export function serialize<T>(value: T) {
  return JSON.parse(JSON.stringify(value)) as T;
}