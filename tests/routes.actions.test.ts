import { describe, expect, it, beforeEach } from "vitest";
import { createRoute } from "@/features/routes/actions/createRoute";
import { archiveRoute } from "@/features/routes/actions/archiveRoute";
import { getRoute } from "@/features/routes/actions/getRoute";
import { listRoutes } from "@/features/routes/actions/listRoutes";
import { updateRoute } from "@/features/routes/actions/updateRoute";
import { ErrorCode } from "@/shared/errors";
import { resetDatabase } from "./helpers/db";

const baseStops = [
  {
    stop: "Praha hl.n.",
    plannedArrival: "2026-05-02T08:00:00.000Z",
    plannedDeparture: "2026-05-02T08:05:00.000Z",
  },
  {
    stop: "Brno hl.n.",
    plannedArrival: "2026-05-02T10:00:00.000Z",
    plannedDeparture: "2026-05-02T10:05:00.000Z",
  },
];

beforeEach(async () => {
  await resetDatabase();
});

describe("routes actions", () => {
  it("creates and fetches a route", async () => {
    const route = await createRoute({
      type: "TRAIN",
      route: "R19",
      carrier: "CD",
      stops: baseStops,
    });

    const fetched = await getRoute(route.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe(route.id);
    expect(fetched?.stops).toHaveLength(2);
    expect(fetched?.stops[0].stop).toBe("Praha hl.n.");
  });

  it("updates stops", async () => {
    const route = await createRoute({
      type: "TRAIN",
      route: "R19",
      carrier: "CD",
      stops: baseStops,
    });

    const updated = await updateRoute(route.id, {
      stops: [
        {
          stop: "Praha hl.n.",
          plannedArrival: "2026-05-02T08:01:00.000Z",
          plannedDeparture: "2026-05-02T08:06:00.000Z",
        },
        {
          stop: "Ostrava hl.n.",
          plannedArrival: "2026-05-02T11:00:00.000Z",
          plannedDeparture: "2026-05-02T11:05:00.000Z",
        },
      ],
    });

    expect(updated.stops[0].stop).toBe("Praha hl.n.");
    expect(updated.stops[1].stop).toBe("Ostrava hl.n.");
  });

  it("soft deletes a route", async () => {
    const route = await createRoute({
      type: "TRAIN",
      route: "R19",
      carrier: "CD",
      stops: baseStops,
    });

    await archiveRoute(route.id);
    const archived = await getRoute(route.id);
    expect(archived?.archivedAt).not.toBeNull();

    const activeOnly = await listRoutes({ archivedAt: false });
    expect(activeOnly).toHaveLength(0);

    const archivedOnly = await listRoutes({ archivedAt: true });
    expect(archivedOnly).toHaveLength(1);
  });

  it("returns archived and active when no filter is provided", async () => {
    const route = await createRoute({
      type: "TRAIN",
      route: "R19",
      carrier: "CD",
      stops: baseStops,
    });

    await archiveRoute(route.id);

    const allRoutes = await listRoutes();
    expect(allRoutes).toHaveLength(1);
  });

  it("filters routes by type", async () => {
    await createRoute({
      type: "TRAIN",
      route: "R19",
      carrier: "CD",
      stops: baseStops,
    });
    await createRoute({
      type: "BUS",
      route: "B10",
      carrier: "DP",
      stops: baseStops,
    });

    const trains = await listRoutes({ type: "TRAIN" });
    expect(trains).toHaveLength(1);
    expect(trains[0]?.type).toBe("TRAIN");
  });

  it("filters routes by carrier", async () => {
    await createRoute({
      type: "TRAIN",
      route: "R19",
      carrier: "CD",
      stops: baseStops,
    });
    await createRoute({
      type: "TRAIN",
      route: "R20",
      carrier: "RJ",
      stops: baseStops,
    });

    const routes = await listRoutes({ carrier: "CD" });
    expect(routes).toHaveLength(1);
    expect(routes[0]?.carrier).toBe("CD");
  });

  it("throws not found error for missing route", async () => {
    try {
      await getRoute("missing");
      throw new Error("Expected error");
    } catch (error) {
      const err = error as { code?: string };
      expect(err.code).toBe(ErrorCode.NOT_FOUND);
    }
  });

  it("throws not found error for missing route update", async () => {
    try {
      await updateRoute("missing", { route: "R20" });
      throw new Error("Expected error");
    } catch (error) {
      const err = error as { code?: string };
      expect(err.code).toBe(ErrorCode.NOT_FOUND);
    }
  });

  it("fails validation when route input is invalid", async () => {
    try {
      await createRoute({
        type: "TRAIN",
        route: "",
        carrier: "CD",
        stops: [],
      });
      throw new Error("Expected error");
    } catch (error) {
      const err = error as { code?: string };
      expect(err.code).toBe(ErrorCode.VALIDATION_ERROR);
    }
  });
});
