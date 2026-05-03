"use server";

import type { DelayRecord } from "@/features/delay-records/types";
import { delayRecordIdSchema } from "@/features/delay-records/schema";
import { getDelayRecordsCollection } from "@/lib/db/collections";
import { nowUtcIso } from "@/lib/time/utc";
import {
  ErrorCode,
  ErrorMessageKey,
  parseOrThrow,
  throwAppError,
} from "@/shared/errors";

export async function getDelayRecord(id: string): Promise<DelayRecord> {
  const parsedId = parseOrThrow(delayRecordIdSchema, id);
  const collection = await getDelayRecordsCollection();
  const record = await collection.findOne({ id: parsedId });

  if (!record) {
    throwAppError(
      ErrorMessageKey.DELAY_RECORD_NOT_FOUND,
      ErrorCode.VALIDATION_ERROR,
    );
  }

  if (record.state === "PLANNED") {
    const now = nowUtcIso();
    if (record.scheduled <= now) {
      const updatedAt = now;
      record.state = "ONGOING";
      record.updatedAt = updatedAt;
      await collection.updateOne(
        { id: parsedId },
        { $set: { state: "ONGOING", updatedAt } },
      );
    }
  }

  return record;
}
