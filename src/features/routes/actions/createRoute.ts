"use server";

import type { Route } from "@/features/routes/types";
import { createRouteInputSchema } from "@/features/routes/schema";
import { getRoutesCollection } from "@/lib/db/collections";
import { nowUtcIso } from "@/shared/utils/time";
import { generateId } from "@/shared/utils/ids";
import { actionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";

export const createRoute = actionClient
  .inputSchema(createRouteInputSchema)
  .action(
    async ({ parsedInput: { carrier, route, stops, type } }): Promise<void> => {
      const now = nowUtcIso();
      const newRoute: Route = {
        id: generateId(),
        type: type,
        route: route,
        carrier: carrier,
        stops: stops.map((stop, index) => ({
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
      await collection.insertOne(newRoute);

      revalidatePath("/routes");
    },
  );
