export const VehicleType = {
  TRAIN: "TRAIN",
  BUS: "BUS",
  TRAM: "TRAM",
  TROLLEYBUS: "TROLLEYBUS",
  METRO: "METRO",
  SHIP: "SHIP",
  CABLE_CAR: "CABLE_CAR",
  AIRPLANE: "AIRPLANE",
} as const;

export type VehicleType = (typeof VehicleType)[keyof typeof VehicleType];

export const DelayState = {
  PLANNED: "PLANNED",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type DelayState = (typeof DelayState)[keyof typeof DelayState];

export const DelayReason = {
  TRAFFIC: "TRAFFIC",
  TECHNICAL_ISSUES: "TECHNICAL_ISSUES",
  WEATHER: "WEATHER",
  STAFF_SHORTAGE: "STAFF_SHORTAGE",
  VEHICLE_FAILURE: "VEHICLE_FAILURE",
  INFRASTRUCTURE: "INFRASTRUCTURE",
  ACCIDENT: "ACCIDENT",
  SECURITY: "SECURITY",
  CONGESTION: "CONGESTION",
  CONNECTION_WAIT: "CONNECTION_WAIT",
  DISPATCHING_DELAY: "DISPATCHING_DELAY",
  MAINTENANCE: "MAINTENANCE",
  OTHER: "OTHER",
} as const;

export type DelayReason = (typeof DelayReason)[keyof typeof DelayReason];
