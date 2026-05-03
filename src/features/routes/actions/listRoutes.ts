"use server";

import type { ListRoutesFilter, Route } from "@/features/routes/types";
import { listRoutesFilterSchema } from "@/features/routes/schema";
import { getRoutesCollection } from "@/lib/db/collections";
import { parseOrThrow } from "@/shared/errors";

export async function listRoutes(filter?: ListRoutesFilter): Promise<Route[]> {
  const parsed = parseOrThrow(listRoutesFilterSchema, filter ?? {});
  const collection = await getRoutesCollection();
  const query: Record<string, unknown> = {};

  if (parsed.archivedAt === true) {
    query.archivedAt = { $ne: null };
  } else if (parsed.archivedAt === false) {
    query.archivedAt = null;
  }

  if (parsed.type) {
    query.type = parsed.type;
  }

  if (parsed.carrier) {
    query.carrier = parsed.carrier;
  }

  return collection.find(query).toArray();
}
