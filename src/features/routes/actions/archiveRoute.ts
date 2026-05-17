"use server";

import { getRoutesCollection } from "@/lib/db/collections";
import { nowUtcIso } from "@/shared/utils/time";
import { routeIdSchema } from "@/features/routes/schema";
import { ErrorCode, ErrorMessageKey, throwAppError } from "@/shared/errors";
import { actionClient } from "@/lib/safe-action";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export const archiveRoute = actionClient
  .inputSchema(routeIdSchema)
  .action(async ({ parsedInput }): Promise<void> => {
    const collection = await getRoutesCollection();

    const now = nowUtcIso();
    const result = await collection.updateOne(
      { _id: new ObjectId(parsedInput) },
      { $set: { archivedAt: now, updatedAt: now } },
    );

    if (result.matchedCount === 0) {
      throwAppError(ErrorMessageKey.ROUTE_NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    revalidatePath("/routes");
  });
