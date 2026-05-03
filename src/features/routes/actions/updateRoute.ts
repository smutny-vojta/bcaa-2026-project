"use server";

import type { Route, UpdateRouteInput } from "@/features/routes/types";
import {
  routeIdSchema,
  updateRouteInputSchema,
} from "@/features/routes/schema";
import { getRoutesCollection } from "@/lib/db/collections";
import { nowUtcIso } from "@/lib/time/utc";
import {
  ErrorCode,
  ErrorMessageKey,
  parseOrThrow,
  throwAppError,
} from "@/shared/errors";

export async function updateRoute(
  id: string,
  data: UpdateRouteInput,
): Promise<Route> {
  const parsedId = parseOrThrow(routeIdSchema, id);
  const parsed = parseOrThrow(updateRouteInputSchema, data);
  const collection = await getRoutesCollection();
  const existing = await collection.findOne({ id: parsedId });

  if (!existing) {
    throwAppError(ErrorMessageKey.ROUTE_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  let stops = existing.stops;

  if (parsed.stops) {
    stops = parsed.stops.map((stop, index) => ({
      index,
      stop: stop.stop,
      plannedArrival: stop.plannedArrival,
      plannedDeparture: stop.plannedDeparture,
    }));
  }

  const updated: Route = {
    ...existing,
    type: parsed.type ?? existing.type,
    route: parsed.route ?? existing.route,
    carrier: parsed.carrier ?? existing.carrier,
    stops,
    updatedAt: nowUtcIso(),
  };

  await collection.updateOne({ id: parsedId }, { $set: updated });
  return updated;
}
