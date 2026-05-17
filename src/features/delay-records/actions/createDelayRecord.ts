"use server";

import type { DelayRecord } from "@/features/delay-records/types";
import {
  getDelayRecordsCollection,
  getRoutesCollection,
} from "@/lib/db/collections";
import { nowUtcIso } from "@/shared/utils/time";
import { generateId } from "@/shared/utils/ids";
import { createDelayRecordInputSchema } from "@/features/delay-records/schema";
import { ErrorCode, ErrorMessageKey, throwAppError } from "@/shared/errors";
import { actionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";

export const createDelayRecord = actionClient
  .inputSchema(createDelayRecordInputSchema)
  .action(
    async ({
      parsedInput: { routeId, tripCode, state, boardingStop, exitStop },
    }): Promise<void> => {
      const routesCollection = await getRoutesCollection();
      const route = await routesCollection.findOne({
        _id: new ObjectId(routeId),
      });

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

      const boarding = checkpoints.find((stop) => stop.stop === boardingStop);
      const exit = checkpoints.find((stop) => stop.stop === exitStop);

      if (!boarding) {
        throwAppError(
          ErrorMessageKey.BOARDING_STOP_MISSING,
          ErrorCode.CONFLICT,
        );
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
        routeId: routeId,
        tripCode: tripCode,
        scheduled,
        state: state,
        boardingStop: boardingStop,
        exitStop: exitStop,
        checkpoints,
        finalDelay: null,
        createdAt: now,
        updatedAt: now,
      };

      const collection = await getDelayRecordsCollection();
      await collection.insertOne(record);
      revalidatePath("/delay-records");
    },
  );
