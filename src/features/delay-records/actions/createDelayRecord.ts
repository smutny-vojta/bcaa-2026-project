"use server";

import type {
  CreateDelayRecordInput,
  DelayRecord,
} from "@/features/delay-records/types";
import {
  getDelayRecordsCollection,
  getRoutesCollection,
} from "@/lib/db/collections";
import { nowUtcIso } from "@/lib/time/utc";
import { generateId } from "@/shared/utils/ids";
import { createDelayRecordInputSchema } from "@/features/delay-records/schema";
import {
  ErrorCode,
  ErrorMessageKey,
  parseOrThrow,
  throwAppError,
} from "@/shared/errors";

export async function createDelayRecord(
  data: CreateDelayRecordInput,
): Promise<DelayRecord> {
  const parsed = parseOrThrow(createDelayRecordInputSchema, data);

  const routesCollection = await getRoutesCollection();
  const route = await routesCollection.findOne({ id: parsed.routeId });

  if (!route) {
    throwAppError(ErrorMessageKey.ROUTE_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  if (!route.stops.length) {
    throwAppError(ErrorMessageKey.ROUTE_NO_STOPS, ErrorCode.CONFLICT);
  }

  const scheduled = route.stops[0].plannedDeparture;
  const now = nowUtcIso();

  const checkpoints = route.stops.map((stop, index) => ({
    index,
    stop: stop.stop,
    arrival: {
      planned: stop.plannedArrival,
      actual: null,
    },
    departure: {
      planned: stop.plannedDeparture,
      actual: null,
    },
    reason: null,
    note: undefined,
  }));

  const boarding = checkpoints.find((stop) => stop.stop === data.boardingStop);
  const exit = checkpoints.find((stop) => stop.stop === data.exitStop);

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

  const record: DelayRecord = {
    id: generateId(),
    routeId: parsed.routeId,
    tripCode: parsed.tripCode,
    scheduled,
    state: parsed.state,
    boardingStop: parsed.boardingStop,
    exitStop: parsed.exitStop,
    checkpoints,
    finalDelay: null,
    createdAt: now,
    updatedAt: now,
  };

  const collection = await getDelayRecordsCollection();
  await collection.insertOne(record);
  return record;
}
