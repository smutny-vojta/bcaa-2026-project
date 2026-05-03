"use server";

import type {
  DelayRecord,
  ListDelayRecordsFilter,
} from "@/features/delay-records/types";
import { listDelayRecordsFilterSchema } from "@/features/delay-records/schema";
import { getDelayRecordsCollection } from "@/lib/db/collections";
import { nowUtcIso } from "@/lib/time/utc";
import { parseOrThrow } from "@/shared/errors";

export async function listDelayRecords(
  filter?: ListDelayRecordsFilter,
): Promise<DelayRecord[]> {
  const parsed = parseOrThrow(listDelayRecordsFilterSchema, filter ?? {});
  const collection = await getDelayRecordsCollection();
  const query: Record<string, unknown> = {};

  if (parsed.routeId) {
    query.routeId = parsed.routeId;
  }

  if (parsed.tripCode) {
    query.tripCode = parsed.tripCode;
  }

  if (parsed.state) {
    query.state = parsed.state;
  }

  if (parsed.scheduledFrom || parsed.scheduledTo) {
    query.scheduled = {};
    if (parsed.scheduledFrom) {
      (query.scheduled as Record<string, string>).$gte = parsed.scheduledFrom;
    }
    if (parsed.scheduledTo) {
      (query.scheduled as Record<string, string>).$lte = parsed.scheduledTo;
    }
  }

  if (
    parsed.finalDelayMin !== undefined ||
    parsed.finalDelayMax !== undefined
  ) {
    query.finalDelay = {};
    if (parsed.finalDelayMin !== undefined) {
      (query.finalDelay as Record<string, number>).$gte = parsed.finalDelayMin;
    }
    if (parsed.finalDelayMax !== undefined) {
      (query.finalDelay as Record<string, number>).$lte = parsed.finalDelayMax;
    }
  }

  const now = nowUtcIso();
  await collection.updateMany(
    { state: "PLANNED", scheduled: { $lte: now } },
    { $set: { state: "ONGOING", updatedAt: now } },
  );

  return collection.find(query).toArray();
}
