"use server";

import type { Route } from "@/features/routes/types";
import { listRoutesFilterSchema } from "@/features/routes/schema";
import { getRoutesCollection } from "@/lib/db/collections";
import { serializeRoutes } from "@/lib/db/serialize";
import { actionClient } from "@/lib/safe-action";

export const listRoutes = actionClient
  .inputSchema(listRoutesFilterSchema)
  .action(
    async ({
      parsedInput: { archivedAt, carrier, type },
    }): Promise<Route[]> => {
      const collection = await getRoutesCollection();
      const query: Record<string, unknown> = {};

      if (archivedAt === true) {
        query.archivedAt = { $ne: null };
      } else if (archivedAt === false) {
        query.archivedAt = null;
      }

      if (type) {
        query.type = type;
      }

      if (carrier) {
        query.carrier = carrier;
      }

      const routes = await collection.find(query).toArray();
      return serializeRoutes(routes);
    },
  );
