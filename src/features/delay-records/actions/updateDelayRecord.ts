"use server";

import { z } from "zod";
import type {
  DelayRecord,
  UpdateDelayRecordInput,
} from "@/features/delay-records/types";
import {
  delayRecordIdSchema,
  updateDelayRecordInputSchema,
} from "@/features/delay-records/schema";
import { getDelayRecordsCollection } from "@/lib/db/collections";
import { serializeDelayRecord } from "@/lib/db/serialize";
import { nowUtcIso } from "@/shared/utils/time";
import { ErrorCode, ErrorMessageKey, throwAppError } from "@/shared/errors";
import { actionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";

const updateDelayRecordActionInputSchema = z.object({
  id: delayRecordIdSchema,
  data: updateDelayRecordInputSchema,
});

export const updateDelayRecord = actionClient
  .inputSchema(updateDelayRecordActionInputSchema)
  .action(async ({ parsedInput: { id, data } }): Promise<DelayRecord> => {
    const collection = await getDelayRecordsCollection();
    const record = await collection.findOne({ _id: new ObjectId(id) });

    if (!record) {
      throwAppError(
        ErrorMessageKey.DELAY_RECORD_NOT_FOUND,
        ErrorCode.NOT_FOUND,
      );
    }

    const isLocked =
      record.state === "COMPLETED" || record.state === "CANCELLED";

    if (data.state !== undefined) {
      if (isLocked) {
        throwAppError(ErrorMessageKey.STATE_LOCKED, ErrorCode.INVALID_STATE);
      }

      const nextState = data.state;
      const currentState = record.state;
      const allowed =
        (currentState === "PLANNED" &&
          (nextState === "PLANNED" || nextState === "ONGOING")) ||
        (currentState === "ONGOING" &&
          (nextState === "PLANNED" ||
            nextState === "ONGOING" ||
            nextState === "COMPLETED" ||
            nextState === "CANCELLED"));

      if (!allowed) {
        throwAppError(
          ErrorMessageKey.INVALID_STATE_TRANSITION,
          ErrorCode.INVALID_STATE,
          {
            currentState,
            nextState,
          },
        );
      }

      record.state = nextState;
    }

    if (data.boardingStop || data.exitStop) {
      if (!(record.state === "PLANNED" || record.state === "ONGOING")) {
        throwAppError(
          ErrorMessageKey.BOARDING_EXIT_CHANGE_NOT_ALLOWED,
          ErrorCode.INVALID_STATE,
        );
      }

      if (data.boardingStop) {
        record.boardingStop = data.boardingStop;
      }

      if (data.exitStop) {
        record.exitStop = data.exitStop;
      }
    }

    if (data.checkpoints && data.checkpoints.length > 0) {
      if (isLocked) {
        throwAppError(ErrorMessageKey.STATE_LOCKED, ErrorCode.INVALID_STATE);
      }

      const checkpointMap = new Map(
        record.checkpoints.map((checkpoint) => [checkpoint.stop, checkpoint]),
      );

      data.checkpoints.forEach((update) => {
        const checkpoint = checkpointMap.get(update.stop);
        if (!checkpoint) {
          throwAppError(
            ErrorMessageKey.CHECKPOINT_NOT_FOUND,
            ErrorCode.NOT_FOUND,
            {
              stop: update.stop,
            },
          );
        }

        if (update.arrival?.actual !== undefined) {
          checkpoint.arrival.actual = update.arrival.actual;
        }

        if (update.departure?.actual !== undefined) {
          checkpoint.departure.actual = update.departure.actual;
        }

        if (update.reason !== undefined) {
          checkpoint.reason = update.reason;
        }

        if (update.note !== undefined) {
          checkpoint.note = update.note ?? undefined;
        }
      });
    }

    const boarding = record.checkpoints.find(
      (stop) => stop.stop === record.boardingStop,
    );
    const exit = record.checkpoints.find(
      (stop) => stop.stop === record.exitStop,
    );

    if (!boarding) {
      throwAppError(ErrorMessageKey.BOARDING_STOP_MISSING, ErrorCode.CONFLICT);
    }

    if (!exit) {
      throwAppError(ErrorMessageKey.EXIT_STOP_MISSING, ErrorCode.CONFLICT);
    }

    if (boarding.index >= exit.index) {
      throwAppError(
        ErrorMessageKey.BOARDING_BEFORE_EXIT,
        ErrorCode.INVALID_STATE,
      );
    }

    if (record.state === "COMPLETED") {
      const planned = exit.departure.planned;
      const actual = exit.arrival.actual;
      if (!actual) {
        throwAppError(
          ErrorMessageKey.ARRIVAL_ACTUAL_REQUIRED,
          ErrorCode.CONFLICT,
        );
      }

      const plannedTime = new Date(planned).valueOf();
      const actualTime = new Date(actual).valueOf();
      const diffMs = actualTime - plannedTime;
      if (diffMs < 0) {
        throwAppError(ErrorMessageKey.FINAL_DELAY_NEGATIVE, ErrorCode.CONFLICT);
      }
      record.finalDelay = Math.round(diffMs / 60000);
    } else {
      record.finalDelay = null;
    }

    record.updatedAt = nowUtcIso();
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: record });
    revalidatePath("/delay-records");
    revalidatePath(`/delay-records/${id}`);
    return serializeDelayRecord(record);
  });
