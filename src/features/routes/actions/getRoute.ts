"use server";

import type { Route } from "@/features/routes/types";
import { routeIdSchema } from "@/features/routes/schema";
import { getRoutesCollection } from "@/lib/db/collections";
import { serializeRoute } from "@/lib/db/serialize";
import { ErrorCode, ErrorMessageKey, throwAppError } from "@/shared/errors";
import { actionClient } from "@/lib/safe-action";
import { ObjectId } from "mongodb";

export const getRoute = actionClient
  .inputSchema(routeIdSchema)
  .action(async ({ parsedInput }): Promise<Route> => {
    const collection = await getRoutesCollection();
    const route = await collection.findOne({ _id: new ObjectId(parsedInput) });

    if (!route) {
      throwAppError(ErrorMessageKey.ROUTE_NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    return serializeRoute(route);
  });
