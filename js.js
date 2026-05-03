const routeSchema = {
  id: "route-123", // unique route identifier
  type: "TRAIN", // vehicle type: TRAIN, BUS, TRAM, TROLLEYBUS, METRO, SHIP, CABLE_CAR, AIRPLANE
  route: "Praha - Brno", // route name or description
  carrier: "ČD", // transportation company name
  stops: [
    // array of stops on the route
    {
      index: 0, // stop order index
      stopId: "550e8400-e29b-41d4-a716-446655440000", // unique stop identifier (UUID)
      stopName: "Praha hl.", // stop name
      plannedArrival: "2024-10-08T08:00:00.000Z", // planned arrival time (UTC ISO string)
      plannedDeparture: "2024-10-08T08:05:00.000Z", // planned departure time (UTC ISO string)
    },
    {
      index: 1,
      stopId: "550e8400-e29b-41d4-a716-446655440001",
      stopName: "Brno hl.n.",
      plannedArrival: "2024-10-08T10:30:00.000Z",
      plannedDeparture: "2024-10-08T10:35:00.000Z",
    },
  ],
  archivedAt: null, // archive timestamp or null (UTC ISO string)
  createdAt: "2024-10-01T12:00:00.000Z", // creation timestamp (UTC ISO string)
  updatedAt: "2024-10-01T12:00:00.000Z", // last update timestamp (UTC ISO string)
};

const delayRecordSchema = {
  id: "delay-456", // unique delay record identifier
  routeId: "route-123", // associated route identifier
  tripCode: "TRAIN-789", // trip code or identifier
  scheduled: "2024-10-08T08:00:00.000Z", // scheduled departure time (UTC ISO string)
  state: "ONGOING", // delay state: PLANNED, ONGOING, COMPLETED, CANCELLED
  boardingStopId: "550e8400-e29b-41d4-a716-446655440000", // boarding stop identifier (UUID)
  exitStopId: "550e8400-e29b-41d4-a716-446655440001", // exit stop identifier (UUID)
  checkpoints: [
    // array of delay checkpoints
    {
      index: 0, // checkpoint order index
      stopId: "550e8400-e29b-41d4-a716-446655440000", // stop identifier (UUID)
      stopName: "Praha hl.n.", // stop name
      arrival: {
        planned: "2024-10-08T08:00:00.000Z", // planned arrival (UTC ISO string)
        actual: "2024-10-08T08:02:00.000Z", // actual arrival or null (UTC ISO string)
      },
      departure: {
        planned: "2024-10-08T08:05:00.000Z", // planned departure (UTC ISO string)
        actual: "2024-10-08T08:10:00.000Z", // actual departure or null (UTC ISO string)
      },
      reason: "TECHNICAL_ISSUES", // delay reason or null: TRAFFIC, TECHNICAL_ISSUES, WEATHER, STAFF_SHORTAGE, VEHICLE_FAILURE, INFRASTRUCTURE, ACCIDENT, SECURITY, CONGESTION, CONNECTION_WAIT, DISPATCHING_DELAY, MAINTENANCE, OTHER
      note: "Ztráta lopatky na uhlí.", // optional additional note
    },
    {
      index: 1,
      stopId: "550e8400-e29b-41d4-a716-446655440001",
      stopName: "Brno hl.n.",
      arrival: {
        planned: "2024-10-08T10:30:00.000Z",
        actual: null, // not yet arrived
      },
      departure: {
        planned: "2024-10-08T10:35:00.000Z",
        actual: null, // not yet departed
      },
      reason: null, // no delay reason yet
      note: undefined, // optional note not provided
    },
  ],
  finalDelay: 5, // final delay in minutes or null
  createdAt: "2024-10-08T07:50:00.000Z", // creation timestamp (UTC ISO string)
  updatedAt: "2024-10-08T08:10:00.000Z", // last update timestamp (UTC ISO string)
};
