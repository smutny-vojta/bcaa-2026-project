"use server";

import type { Route } from "@/features/routes/types";
import { routeIdSchema } from "@/features/routes/schema";
import { getRoutesCollection } from "@/lib/db/collections";
import {
  ErrorCode,
  ErrorMessageKey,
  parseOrThrow,
  throwAppError,
} from "@/shared/errors";

export async function getRoute(id: string): Promise<Route> {
  const parsedId = parseOrThrow(routeIdSchema, id);
  const collection = await getRoutesCollection();
  const route = await collection.findOne({ id: parsedId });

  if (!route) {
    throwAppError(ErrorMessageKey.ROUTE_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return route;
}
