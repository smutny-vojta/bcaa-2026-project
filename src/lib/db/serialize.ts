/**
 * Serializes MongoDB documents for passing to Client Components.
 * Converts _id ObjectId to id string and removes MongoDB-specific fields.
 */

import type { DelayRecord } from "@/features/delay-records/types";
import type { Route } from "@/features/routes/types";

/**
 * Serializes a MongoDB delay record document to a DelayRecord type.
 * Converts _id to id string and removes the _id field.
 */
export function serializeDelayRecord(
  record: Record<string, unknown> & { _id?: unknown },
): DelayRecord {
  return {
    id: String((record._id as unknown) || ""),
    routeId: String(record.routeId || ""),
    tripCode: String(record.tripCode || ""),
    scheduled: String(record.scheduled || ""),
    state: record.state as DelayRecord["state"],
    boardingStop: String(record.boardingStop || ""),
    exitStop: String(record.exitStop || ""),
    checkpoints: (record.checkpoints || []) as DelayRecord["checkpoints"],
    finalDelay: (record.finalDelay as DelayRecord["finalDelay"]) ?? null,
    createdAt: String(record.createdAt || ""),
    updatedAt: String(record.updatedAt || ""),
  };
}

/**
 * Serializes multiple MongoDB delay record documents.
 */
export function serializeDelayRecords(
  records: (Record<string, unknown> & { _id?: unknown })[],
): DelayRecord[] {
  return records.map(serializeDelayRecord);
}

/**
 * Serializes a MongoDB route document to a Route type.
 * Converts _id to id string and removes the _id field.
 */
export function serializeRoute(
  route: Record<string, unknown> & { _id?: unknown },
): Route {
  return {
    id: String((route._id as unknown) || ""),
    type: route.type as Route["type"],
    route: String(route.route || ""),
    carrier: String(route.carrier || ""),
    stops: (route.stops || []) as Route["stops"],
    archivedAt: (route.archivedAt as Route["archivedAt"]) ?? null,
    createdAt: String(route.createdAt || ""),
    updatedAt: String(route.updatedAt || ""),
  };
}

/**
 * Serializes multiple MongoDB route documents.
 */
export function serializeRoutes(
  routes: (Record<string, unknown> & { _id?: unknown })[],
): Route[] {
  return routes.map(serializeRoute);
}
