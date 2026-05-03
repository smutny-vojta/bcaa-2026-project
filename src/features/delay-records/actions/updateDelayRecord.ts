"use server";

import type {
  DelayRecord,
  UpdateDelayRecordInput,
} from "@/features/delay-records/types";
import {
  delayRecordIdSchema,
  updateDelayRecordInputSchema,
} from "@/features/delay-records/schema";
import { getDelayRecordsCollection } from "@/lib/db/collections";
import { nowUtcIso } from "@/lib/time/utc";
import {
  ErrorCode,
  ErrorMessageKey,
  parseOrThrow,
  throwAppError,
} from "@/shared/errors";

export async function updateDelayRecord(
  id: string,
  data: UpdateDelayRecordInput,
): Promise<DelayRecord> {
  const parsedId = parseOrThrow(delayRecordIdSchema, id);
  const parsed = parseOrThrow(updateDelayRecordInputSchema, data);
  const collection = await getDelayRecordsCollection();
  const record = await collection.findOne({ id: parsedId });

  if (!record) {
    throwAppError(ErrorMessageKey.DELAY_RECORD_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  const isLocked = record.state === "COMPLETED" || record.state === "CANCELLED";

  if (parsed.state !== undefined) {
    if (isLocked) {
      throwAppError(ErrorMessageKey.STATE_LOCKED, ErrorCode.INVALID_STATE);
    }

    const nextState = parsed.state;
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

  if (parsed.boardingStop || parsed.exitStop) {
    if (!(record.state === "PLANNED" || record.state === "ONGOING")) {
      throwAppError(
        ErrorMessageKey.BOARDING_EXIT_CHANGE_NOT_ALLOWED,
        ErrorCode.INVALID_STATE,
      );
    }

    if (parsed.boardingStop) {
      record.boardingStop = parsed.boardingStop;
    }

    if (parsed.exitStop) {
      record.exitStop = parsed.exitStop;
    }
  }

  if (parsed.checkpoints && parsed.checkpoints.length > 0) {
    if (isLocked) {
      throwAppError(ErrorMessageKey.STATE_LOCKED, ErrorCode.INVALID_STATE);
    }

    const checkpointMap = new Map(
      record.checkpoints.map((checkpoint) => [checkpoint.stop, checkpoint]),
    );

    parsed.checkpoints.forEach((update) => {
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
  const exit = record.checkpoints.find((stop) => stop.stop === record.exitStop);

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
  await collection.updateOne({ id: parsedId }, { $set: record });
  return record;
}
