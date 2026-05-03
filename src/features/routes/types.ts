import type { VehicleType } from "@/shared/constants/enums";

export type RouteStop = {
  index: number;
  stop: string;
  plannedArrival: string;
  plannedDeparture: string;
};

export type Route = {
  id: string;
  type: VehicleType;
  route: string;
  carrier: string;
  stops: RouteStop[];
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateRouteStopInput = {
  stop: string;
  plannedArrival: string;
  plannedDeparture: string;
};

export type CreateRouteInput = {
  type: VehicleType;
  route: string;
  carrier: string;
  stops: CreateRouteStopInput[];
};

export type UpdateRouteStopInput = {
  stop: string;
  plannedArrival: string;
  plannedDeparture: string;
};

export type UpdateRouteInput = {
  type?: VehicleType;
  route?: string;
  carrier?: string;
  stops?: UpdateRouteStopInput[];
};

export type ListRoutesFilter = {
  archivedAt?: boolean | null;
  type?: VehicleType;
  carrier?: string;
};
