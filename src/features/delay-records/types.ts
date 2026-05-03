import type { DelayReason, DelayState } from "@/shared/constants/enums";

export type DelayCheckpoint = {
  index: number;
  stop: string;
  arrival: {
    planned: string;
    actual: string | null;
  };
  departure: {
    planned: string;
    actual: string | null;
  };
  reason: DelayReason | null;
  note?: string;
};

export type DelayRecord = {
  id: string;
  routeId: string;
  tripCode: string;
  scheduled: string;
  state: DelayState;
  boardingStop: string;
  exitStop: string;
  checkpoints: DelayCheckpoint[];
  finalDelay: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateDelayRecordInput = {
  routeId: string;
  tripCode: string;
  state: "PLANNED" | "ONGOING";
  boardingStop: string;
  exitStop: string;
};

export type UpdateDelayRecordInput = {
  state?: DelayState;
  boardingStop?: string;
  exitStop?: string;
  checkpoints?: Array<{
    stop: string;
    arrival?: { actual: string | null };
    departure?: { actual: string | null };
    reason?: DelayReason | null;
    note?: string | null;
  }>;
};

export type ListDelayRecordsFilter = {
  routeId?: string;
  tripCode?: string;
  state?: DelayState;
  scheduledFrom?: string;
  scheduledTo?: string;
  finalDelayMin?: number;
  finalDelayMax?: number;
};
