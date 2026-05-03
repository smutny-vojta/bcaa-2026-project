import { createRoute } from "@/features/routes/actions/createRoute";
import { createDelayRecord } from "@/features/delay-records/actions/createDelayRecord";
import { resetDatabase } from "./helpers/db";

async function main() {
  const route = await createRoute({
    type: "TRAIN",
    route: "R19",
    carrier: "CD",
    stops: [
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
    ],
  });

  const record = await createDelayRecord({
    routeId: route.id,
    tripCode: "2301",
    state: "PLANNED",
    boardingStop: route.stops[0].stop,
    exitStop: route.stops[1].stop,
  });

  console.log(record);
  console.log(record.checkpoints);
  await resetDatabase();
}

main().catch((error) => {
  console.error("Error in manual test:", error);
  process.exit(1);
});
