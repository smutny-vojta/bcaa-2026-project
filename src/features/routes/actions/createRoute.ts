"use server";

import type { CreateRouteInput, Route } from "@/features/routes/types";
import { createRouteInputSchema } from "@/features/routes/schema";
import { getRoutesCollection } from "@/lib/db/collections";
import { nowUtcIso } from "@/lib/time/utc";
import { generateId } from "@/shared/utils/ids";
import { parseOrThrow } from "@/shared/errors";

export async function createRoute(data: CreateRouteInput): Promise<Route> {
  const parsed = parseOrThrow(createRouteInputSchema, data);

  const now = nowUtcIso();
  const route: Route = {
    id: generateId(),
    type: parsed.type,
    route: parsed.route,
    carrier: parsed.carrier,
    stops: parsed.stops.map((stop, index) => ({
      index,
      stop: stop.stop,
      plannedArrival: stop.plannedArrival,
      plannedDeparture: stop.plannedDeparture,
    })),
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const collection = await getRoutesCollection();
  await collection.insertOne(route);
  return route;
}
