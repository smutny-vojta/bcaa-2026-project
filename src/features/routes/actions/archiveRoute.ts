"use server";

import { getRoutesCollection } from "@/lib/db/collections";
import { nowUtcIso } from "@/lib/time/utc";
import { routeIdSchema } from "@/features/routes/schema";
import {
  ErrorCode,
  ErrorMessageKey,
  parseOrThrow,
  throwAppError,
} from "@/shared/errors";

export async function archiveRoute(id: string): Promise<void> {
  const parsedId = parseOrThrow(routeIdSchema, id);
  const collection = await getRoutesCollection();

  const now = nowUtcIso();
  const result = await collection.updateOne(
    { id: parsedId },
    { $set: { archivedAt: now, updatedAt: now } },
  );

  if (result.matchedCount === 0) {
    throwAppError(ErrorMessageKey.ROUTE_NOT_FOUND, ErrorCode.NOT_FOUND);
  }
}
