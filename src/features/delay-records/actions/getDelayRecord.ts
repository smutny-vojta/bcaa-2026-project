"use server";

import { z } from "zod";
import type { DelayRecord } from "@/features/delay-records/types";
import { delayRecordIdSchema } from "@/features/delay-records/schema";
import { getDelayRecordsCollection } from "@/lib/db/collections";
import { serializeDelayRecord } from "@/lib/db/serialize";
import { nowUtcIso } from "@/shared/utils/time";
import { ErrorCode, ErrorMessageKey, throwAppError } from "@/shared/errors";
import { actionClient } from "@/lib/safe-action";
import { ObjectId } from "mongodb";

export const getDelayRecord = actionClient
  .inputSchema(delayRecordIdSchema)
  .action(async ({ parsedInput }): Promise<DelayRecord> => {
    const collection = await getDelayRecordsCollection();
    const record = await collection.findOne({ _id: new ObjectId(parsedInput) });

    if (!record) {
      throwAppError(
        ErrorMessageKey.DELAY_RECORD_NOT_FOUND,
        ErrorCode.NOT_FOUND,
      );
    }

    if (record.state === "PLANNED") {
      const now = nowUtcIso();
      if (record.scheduled <= now) {
        const updatedAt = now;
        record.state = "ONGOING";
        record.updatedAt = updatedAt;
        await collection.updateOne(
          { _id: new ObjectId(parsedInput) },
          { $set: { state: "ONGOING", updatedAt } },
        );
      }
    }

    return serializeDelayRecord(record);
  });
