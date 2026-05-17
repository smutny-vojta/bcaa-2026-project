"use server";

import { z } from "zod";
import { getDelayRecordsCollection } from "@/lib/db/collections";
import { delayRecordIdSchema } from "@/features/delay-records/schema";
import { ErrorCode, ErrorMessageKey, throwAppError } from "@/shared/errors";
import { actionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";

export const deleteDelayRecord = actionClient
  .inputSchema(delayRecordIdSchema)
  .action(async ({ parsedInput }): Promise<void> => {
    const collection = await getDelayRecordsCollection();
    const result = await collection.deleteOne({
      _id: new ObjectId(parsedInput),
    });

    if (result.deletedCount === 0) {
      throwAppError(
        ErrorMessageKey.DELAY_RECORD_NOT_FOUND,
        ErrorCode.NOT_FOUND,
      );
    }

    revalidatePath("/delay-records");
  });
