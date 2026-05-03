"use server";

import { getDelayRecordsCollection } from "@/lib/db/collections";
import { delayRecordIdSchema } from "@/features/delay-records/schema";
import {
  ErrorCode,
  ErrorMessageKey,
  parseOrThrow,
  throwAppError,
} from "@/shared/errors";

export async function deleteDelayRecord(id: string): Promise<void> {
  const parsedId = parseOrThrow(delayRecordIdSchema, id);
  const collection = await getDelayRecordsCollection();
  const result = await collection.deleteOne({ id: parsedId });

  if (result.deletedCount === 0) {
    throwAppError(ErrorMessageKey.DELAY_RECORD_NOT_FOUND, ErrorCode.NOT_FOUND);
  }
}
