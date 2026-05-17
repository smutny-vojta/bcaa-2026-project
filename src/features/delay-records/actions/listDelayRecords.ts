"use server";

import { z } from "zod";
import type {
  DelayRecord,
  ListDelayRecordsFilter,
} from "@/features/delay-records/types";
import { listDelayRecordsFilterSchema } from "@/features/delay-records/schema";
import { getDelayRecordsCollection } from "@/lib/db/collections";
import { serializeDelayRecords } from "@/lib/db/serialize";
import { nowUtcIso } from "@/shared/utils/time";
import { actionClient } from "@/lib/safe-action";

const listDelayRecordsActionInputSchema = z.object({
  filter: listDelayRecordsFilterSchema.optional(),
});

export const listDelayRecords = actionClient
  .inputSchema(listDelayRecordsActionInputSchema)
  .action(async ({ parsedInput: { filter } }): Promise<DelayRecord[]> => {
    const collection = await getDelayRecordsCollection();
    const query: Record<string, unknown> = {};

    if (filter?.routeId) {
      query.routeId = filter.routeId;
    }

    if (filter?.tripCode) {
      query.tripCode = filter.tripCode;
    }

    if (filter?.state) {
      query.state = filter.state;
    }

    if (filter?.scheduledFrom || filter?.scheduledTo) {
      query.scheduled = {};
      if (filter.scheduledFrom) {
        (query.scheduled as Record<string, string>).$gte = filter.scheduledFrom;
      }
      if (filter.scheduledTo) {
        (query.scheduled as Record<string, string>).$lte = filter.scheduledTo;
      }
    }

    if (
      filter?.finalDelayMin !== undefined ||
      filter?.finalDelayMax !== undefined
    ) {
      query.finalDelay = {};
      if (filter.finalDelayMin !== undefined) {
        (query.finalDelay as Record<string, number>).$gte =
          filter.finalDelayMin;
      }
      if (filter.finalDelayMax !== undefined) {
        (query.finalDelay as Record<string, number>).$lte =
          filter.finalDelayMax;
      }
    }

    const now = nowUtcIso();
    await collection.updateMany(
      { state: "PLANNED", scheduled: { $lte: now } },
      { $set: { state: "ONGOING", updatedAt: now } },
    );

    const records = await collection.find(query).toArray();
    return serializeDelayRecords(records);
  });
