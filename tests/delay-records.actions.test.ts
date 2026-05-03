import { describe, expect, it, beforeEach } from "vitest";
import { createRoute } from "@/features/routes/actions/createRoute";
import { createDelayRecord } from "@/features/delay-records/actions/createDelayRecord";
import { updateDelayRecord } from "@/features/delay-records/actions/updateDelayRecord";
import { getDelayRecord } from "@/features/delay-records/actions/getDelayRecord";
import { listDelayRecords } from "@/features/delay-records/actions/listDelayRecords";
import { deleteDelayRecord } from "@/features/delay-records/actions/deleteDelayRecord";
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

const pastStops = [
  {
    stop: "Praha hl.n.",
    plannedArrival: "2020-05-02T08:00:00.000Z",
    plannedDeparture: "2020-05-02T08:05:00.000Z",
  },
  {
    stop: "Brno hl.n.",
    plannedArrival: "2020-05-02T10:00:00.000Z",
    plannedDeparture: "2020-05-02T10:05:00.000Z",
  },
];

const earlyStops = [
  {
    stop: "Praha hl.n.",
    plannedArrival: "2026-05-01T08:00:00.000Z",
    plannedDeparture: "2026-05-01T08:05:00.000Z",
  },
  {
    stop: "Brno hl.n.",
    plannedArrival: "2026-05-01T09:00:00.000Z",
    plannedDeparture: "2026-05-01T09:05:00.000Z",
  },
];

const lateStops = [
  {
    stop: "Praha hl.n.",
    plannedArrival: "2026-06-01T08:00:00.000Z",
    plannedDeparture: "2026-06-01T08:05:00.000Z",
  },
  {
    stop: "Brno hl.n.",
    plannedArrival: "2026-06-01T09:00:00.000Z",
    plannedDeparture: "2026-06-01T09:05:00.000Z",
  },
];

const addMinutes = (iso: string, minutes: number) =>
  new Date(new Date(iso).valueOf() + minutes * 60000).toISOString();

const buildStopsFrom = (start: Date) => {
  const stop1Arrival = start.toISOString();
  const stop1Departure = addMinutes(stop1Arrival, 5);
  const stop2Arrival = addMinutes(stop1Arrival, 60);
  const stop2Departure = addMinutes(stop1Arrival, 65);

  return [
    {
      stop: "Praha hl.n.",
      plannedArrival: stop1Arrival,
      plannedDeparture: stop1Departure,
    },
    {
      stop: "Brno hl.n.",
      plannedArrival: stop2Arrival,
      plannedDeparture: stop2Departure,
    },
  ];
};

beforeEach(async () => {
  await resetDatabase();
});

describe("delay records actions", () => {
  it("creates a delay record with checkpoints", async () => {
    const route = await createRoute({
      type: "TRAIN",
      route: "R19",
      carrier: "CD",
      stops: baseStops,
    });

    const record = await createDelayRecord({
      routeId: route.id,
      tripCode: "2301",
      state: "PLANNED",
      boardingStop: route.stops[0].stop,
      exitStop: route.stops[1].stop,
    });

    expect(record.checkpoints).toHaveLength(2);
    expect(record.checkpoints[0].arrival.actual).toBeNull();
  });

  it("computes finalDelay on completion", async () => {
    const route = await createRoute({
      type: "TRAIN",
      route: "R19",
      carrier: "CD",
      stops: baseStops,
    });

    const record = await createDelayRecord({
      routeId: route.id,
      tripCode: "2301",
      state: "PLANNED",
      boardingStop: route.stops[0].stop,
      exitStop: route.stops[1].stop,
    });

    const completed = await updateDelayRecord(record.id, {
      state: "ONGOING",
    });

    const finished = await updateDelayRecord(completed.id, {
      state: "COMPLETED",
      checkpoints: [
        {
          stop: route.stops[1].stop,
          arrival: {
            actual: "2026-05-02T10:15:00.000Z",
          },
        },
      ],
    });

    expect(finished.finalDelay).toBe(10);
  });

  it("computes finalDelay when on time", async () => {
    const route = await createRoute({
      type: "TRAIN",
      route: "R19",
      carrier: "CD",
      stops: baseStops,
    });

    const record = await createDelayRecord({
      routeId: route.id,
      tripCode: "2302",
      state: "PLANNED",
      boardingStop: route.stops[0].stop,
      exitStop: route.stops[1].stop,
    });

    await updateDelayRecord(record.id, { state: "ONGOING" });

    const finished = await updateDelayRecord(record.id, {
      state: "COMPLETED",
      checkpoints: [
        {
          stop: route.stops[1].stop,
          arrival: {
            actual: route.stops[1].plannedDeparture,
          },
        },
      ],
    });

    expect(finished.finalDelay).toBe(0);
  });

  it("rejects negative finalDelay", async () => {
    const route = await createRoute({
      type: "TRAIN",
      route: "R19",
      carrier: "CD",
      stops: baseStops,
    });

    const record = await createDelayRecord({
      routeId: route.id,
      tripCode: "2303",
      state: "ONGOING",
      boardingStop: route.stops[0].stop,
      exitStop: route.stops[1].stop,
    });

    try {
      await updateDelayRecord(record.id, {
        state: "COMPLETED",
        checkpoints: [
          {
            stop: route.stops[1].stop,
            arrival: {
              actual: "2026-05-02T10:00:00.000Z",
            },
          },
        ],
      });
      throw new Error("Expected error");
    } catch (error) {
      const err = error as { code?: string };
      expect(err.code).toBe(ErrorCode.CONFLICT);
    }
  });

  it("returns not found error when delay record is missing", async () => {
    try {
      await getDelayRecord("missing");
      throw new Error("Expected error");
    } catch (error) {
      const err = error as { code?: string };
      expect(err.code).toBe(ErrorCode.VALIDATION_ERROR);
    }
  });

  it("rejects boarding/exit stop mismatch", async () => {
    const route = await createRoute({
      type: "TRAIN",
      route: "R19",
      carrier: "CD",
      stops: baseStops,
    });

    try {
      await createDelayRecord({
        routeId: route.id,
        tripCode: "2301",
        state: "PLANNED",
        boardingStop: route.stops[1].stop,
        exitStop: route.stops[0].stop,
      });
      throw new Error("Expected error");
    } catch (error) {
      const err = error as { code?: string };
      expect(err.code).toBe(ErrorCode.INVALID_STATE);
    }
  });

  it("rejects invalid state transition", async () => {
    const route = await createRoute({
      type: "TRAIN",
      route: "R19",
      carrier: "CD",
      stops: baseStops,
    });

    const record = await createDelayRecord({
      routeId: route.id,
      tripCode: "2301",
      state: "PLANNED",
      boardingStop: route.stops[0].stop,
      exitStop: route.stops[1].stop,
    });

    try {
      await updateDelayRecord(record.id, { state: "COMPLETED" });
      throw new Error("Expected error");
    } catch (error) {
      const err = error as { code?: string };
      expect(err.code).toBe(ErrorCode.INVALID_STATE);
    }
  });

  it("rejects completion without actual arrival", async () => {
    const route = await createRoute({
      type: "TRAIN",
      route: "R19",
      carrier: "CD",
      stops: baseStops,
    });

    const record = await createDelayRecord({
      routeId: route.id,
      tripCode: "2301",
      state: "ONGOING",
      boardingStop: route.stops[0].stop,
      exitStop: route.stops[1].stop,
    });

    try {
      await updateDelayRecord(record.id, { state: "COMPLETED" });
      throw new Error("Expected error");
    } catch (error) {
      const err = error as { code?: string };
      expect(err.code).toBe(ErrorCode.CONFLICT);
    }
  });

  it("auto-advances planned record to ongoing on get", async () => {
    const route = await createRoute({
      type: "TRAIN",
      route: "R19",
      carrier: "CD",
      stops: pastStops,
    });

    const record = await createDelayRecord({
      routeId: route.id,
      tripCode: "2301",
      state: "PLANNED",
      boardingStop: route.stops[0].stop,
      exitStop: route.stops[1].stop,
    });

    const updated = await getDelayRecord(record.id);
    expect(updated?.state).toBe("ONGOING");
  });

  it("auto-advances when scheduled is now", async () => {
    const start = new Date(Date.now() - 5 * 60000);
    const route = await createRoute({
      type: "TRAIN",
      route: "R19",
      carrier: "CD",
      stops: buildStopsFrom(start),
    });

    const record = await createDelayRecord({
      routeId: route.id,
      tripCode: "2304",
      state: "PLANNED",
      boardingStop: route.stops[0].stop,
      exitStop: route.stops[1].stop,
    });

    const updated = await getDelayRecord(record.id);
    expect(updated.state).toBe("ONGOING");
  });

  it("keeps planned state when scheduled is in the future", async () => {
    const start = new Date(Date.now() + 60 * 60000);
    const route = await createRoute({
      type: "TRAIN",
      route: "R19",
      carrier: "CD",
      stops: buildStopsFrom(start),
    });

    const record = await createDelayRecord({
      routeId: route.id,
      tripCode: "2305",
      state: "PLANNED",
      boardingStop: route.stops[0].stop,
      exitStop: route.stops[1].stop,
    });

    const updated = await getDelayRecord(record.id);
    expect(updated.state).toBe("PLANNED");
  });

  it("auto-advances planned records to ongoing on list", async () => {
    const route = await createRoute({
      type: "TRAIN",
      route: "R19",
      carrier: "CD",
      stops: pastStops,
    });

    await createDelayRecord({
      routeId: route.id,
      tripCode: "2301",
      state: "PLANNED",
      boardingStop: route.stops[0].stop,
      exitStop: route.stops[1].stop,
    });

    const records = await listDelayRecords({ routeId: route.id });
    expect(records[0]?.state).toBe("ONGOING");
  });

  it("filters delay records by scheduled range", async () => {
    const earlyRoute = await createRoute({
      type: "TRAIN",
      route: "R19",
      carrier: "CD",
      stops: earlyStops,
    });

    const lateRoute = await createRoute({
      type: "TRAIN",
      route: "R20",
      carrier: "CD",
      stops: lateStops,
    });

    const earlyRecord = await createDelayRecord({
      routeId: earlyRoute.id,
      tripCode: "2306",
      state: "PLANNED",
      boardingStop: earlyRoute.stops[0].stop,
      exitStop: earlyRoute.stops[1].stop,
    });

    const lateRecord = await createDelayRecord({
      routeId: lateRoute.id,
      tripCode: "2307",
      state: "PLANNED",
      boardingStop: lateRoute.stops[0].stop,
      exitStop: lateRoute.stops[1].stop,
    });

    const records = await listDelayRecords({
      scheduledFrom: "2026-05-15T00:00:00.000Z",
      scheduledTo: "2026-06-15T00:00:00.000Z",
    });

    expect(records).toHaveLength(1);
    expect(records[0]?.id).toBe(lateRecord.id);
    expect(records[0]?.id).not.toBe(earlyRecord.id);
  });

  it("filters delay records by finalDelay range", async () => {
    const route = await createRoute({
      type: "TRAIN",
      route: "R21",
      carrier: "CD",
      stops: earlyStops,
    });

    const recordLow = await createDelayRecord({
      routeId: route.id,
      tripCode: "2308",
      state: "PLANNED",
      boardingStop: route.stops[0].stop,
      exitStop: route.stops[1].stop,
    });

    const recordHigh = await createDelayRecord({
      routeId: route.id,
      tripCode: "2309",
      state: "PLANNED",
      boardingStop: route.stops[0].stop,
      exitStop: route.stops[1].stop,
    });

    await updateDelayRecord(recordLow.id, { state: "ONGOING" });
    await updateDelayRecord(recordHigh.id, { state: "ONGOING" });

    await updateDelayRecord(recordLow.id, {
      state: "COMPLETED",
      checkpoints: [
        {
          stop: route.stops[1].stop,
          arrival: {
            actual: addMinutes(route.stops[1].plannedDeparture, 10),
          },
        },
      ],
    });

    await updateDelayRecord(recordHigh.id, {
      state: "COMPLETED",
      checkpoints: [
        {
          stop: route.stops[1].stop,
          arrival: {
            actual: addMinutes(route.stops[1].plannedDeparture, 20),
          },
        },
      ],
    });

    const records = await listDelayRecords({
      finalDelayMin: 15,
      finalDelayMax: 25,
    });

    expect(records).toHaveLength(1);
    expect(records[0]?.id).toBe(recordHigh.id);
  });

  it("deletes a delay record", async () => {
    const route = await createRoute({
      type: "TRAIN",
      route: "R30",
      carrier: "CD",
      stops: baseStops,
    });

    const record = await createDelayRecord({
      routeId: route.id,
      tripCode: "2310",
      state: "PLANNED",
      boardingStop: route.stops[0].stop,
      exitStop: route.stops[1].stop,
    });

    await deleteDelayRecord(record.id);

    const records = await listDelayRecords({ routeId: route.id });
    expect(records).toHaveLength(0);
  });

  it("returns not found error when deleting missing record", async () => {
    try {
      await deleteDelayRecord("missing");
      throw new Error("Expected error");
    } catch (error) {
      const err = error as { code?: string };
      expect(err.code).toBe(ErrorCode.NOT_FOUND);
    }
  });

  it("rejects checkpoint update for unknown stop", async () => {
    const route = await createRoute({
      type: "TRAIN",
      route: "R19",
      carrier: "CD",
      stops: baseStops,
    });

    const record = await createDelayRecord({
      routeId: route.id,
      tripCode: "2301",
      state: "ONGOING",
      boardingStop: route.stops[0].stop,
      exitStop: route.stops[1].stop,
    });

    try {
      await updateDelayRecord(record.id, {
        checkpoints: [
          {
            stop: "Neznama",
            arrival: { actual: "2026-05-02T10:15:00.000Z" },
          },
        ],
      });
      throw new Error("Expected error");
    } catch (error) {
      const err = error as { code?: string };
      expect(err.code).toBe(ErrorCode.NOT_FOUND);
    }
  });
});
