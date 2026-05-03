import { describe, expect, it } from "vitest";
import { createRouteInputSchema } from "@/features/routes/schema";
import { createDelayRecordInputSchema } from "@/features/delay-records/schema";
import { ErrorCode } from "@/shared/errors";
import { parseOrThrow } from "@/shared/errors";

const validRouteInput = {
  type: "TRAIN",
  route: "R19",
  carrier: "CD",
  stops: [
    {
      stop: "Praha hl.n.",
      plannedArrival: "2026-05-02T08:00:00.000Z",
      plannedDeparture: "2026-05-02T08:05:00.000Z",
    },
  ],
};

describe("schema validation", () => {
  it("accepts valid route input", () => {
    const parsed = parseOrThrow(createRouteInputSchema, validRouteInput);
    expect(parsed.route).toBe("R19");
  });

  it("throws AppError for invalid delay record", () => {
    try {
      parseOrThrow(createDelayRecordInputSchema, {
        routeId: "bad",
        tripCode: "2301",
        state: "PLANNED",
        boardingStop: "",
        exitStop: "",
      });
      throw new Error("Expected error");
    } catch (error) {
      const err = error as { code?: string };
      expect(err.code).toBe(ErrorCode.VALIDATION_ERROR);
    }
  });

  it("rejects invalid date format", () => {
    try {
      parseOrThrow(createRouteInputSchema, {
        ...validRouteInput,
        stops: [
          {
            stop: "Praha hl.n.",
            plannedArrival: "2026-05-02 08:00",
            plannedDeparture: "2026-05-02 08:05",
          },
        ],
      });
      throw new Error("Expected error");
    } catch (error) {
      const err = error as { code?: string };
      expect(err.code).toBe(ErrorCode.VALIDATION_ERROR);
    }
  });
});
