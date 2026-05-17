"use server";

import type { Route, UpdateRouteInput } from "@/features/routes/types";
import {
  routeIdSchema,
  updateRouteInputSchema,
} from "@/features/routes/schema";
import { getRoutesCollection } from "@/lib/db/collections";
import { serializeRoute } from "@/lib/db/serialize";
import { nowUtcIso } from "@/shared/utils/time";
import { ErrorCode, ErrorMessageKey, throwAppError } from "@/shared/errors";
import { actionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import z from "zod";
import { ObjectId } from "mongodb";

const updateRouteActionInputSchema = z.object({
  id: routeIdSchema,
  data: updateRouteInputSchema,
});

export const updateRoute = actionClient
  .inputSchema(updateRouteActionInputSchema)
  .action(
    async ({
      parsedInput: {
        id,
        data: { carrier, route, stops, type },
      },
    }): Promise<Route> => {
      const collection = await getRoutesCollection();
      const existing = await collection.findOne({ _id: new ObjectId(id) });

      if (!existing) {
        throwAppError(ErrorMessageKey.ROUTE_NOT_FOUND, ErrorCode.NOT_FOUND);
      }

      const nextStops = stops?.map((stop, index) => ({
        index,
        stop: stop.stop,
        plannedArrival: stop.plannedArrival,
        plannedDeparture: stop.plannedDeparture,
      }));

      const updated: Route = {
        ...existing,
        type: type ?? existing.type,
        route: route ?? existing.route,
        carrier: carrier ?? existing.carrier,
        stops: nextStops ?? existing.stops,
        updatedAt: nowUtcIso(),
      };

      await collection.updateOne({ _id: new ObjectId(id) }, { $set: updated });
      revalidatePath("/routes");
      return serializeRoute(updated);
    },
  );
