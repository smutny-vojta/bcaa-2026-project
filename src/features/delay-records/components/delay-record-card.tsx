import Link from "next/link";

import { Badge } from "@/shared/components/ui/badge";
import { formatDate } from "@/shared/utils/date";
import { formatTime } from "@/shared/utils/time";
import {
  LucideClockFading,
  LucideMapPin,
  LucideMapPinCheckInside,
  LucideTrainFront,
} from "lucide-react";

import type { DelayRecord } from "../types";
import { delayRecordStateLabels } from "../constants";

type DelayRecordCardProps = {
  delayRecord: DelayRecord;
};

const stateColors: Record<DelayRecord["state"], string> = {
  PLANNED: "bg-foreground",
  ONGOING: "bg-blue-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500",
};

export default function DelayRecordCard({ delayRecord }: DelayRecordCardProps) {
  const {
    id,
    scheduled,
    tripCode,
    boardingStop,
    exitStop,
    finalDelay,
    state,
    checkpoints,
  } = delayRecord;

  return (
    <Link
      href={`/delay-records/${id}`}
      className="group block h-fit w-full min-w-xs"
    >
      <div className="transition-transform duration-150 group-hover:-translate-y-0.5">
        <div
          className={`rounded-t-lg p-3 text-background ${stateColors[state]}`}
        >
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <LucideClockFading size={20} />
              <p>{formatDate(new Date(scheduled))}</p>
            </div>
            <div className="flex items-center gap-2">
              <LucideTrainFront size={20} />
              <p>{tripCode}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-x-4 rounded-b-lg bg-white-light p-3">
          <div className="flex flex-1 flex-col gap-y-3">
            <div className="flex gap-x-4">
              <LucideMapPin size={20} />
              <div className="flex flex-col gap-y-0">
                <p className="text-lg font-bold leading-5">{boardingStop}</p>
                <p className="col-start-2 text-sm leading-4 text-gray-dark">
                  nástup {formatTime(new Date(scheduled))}
                </p>
              </div>
            </div>
            <div className="flex gap-x-4">
              <LucideMapPinCheckInside size={20} />
              <div className="flex flex-col gap-y-0">
                <p className="text-lg font-bold leading-5">{exitStop}</p>
                <p className="col-start-2 text-sm leading-4 text-gray-dark">
                  výstup {formatTime(new Date(scheduled))}
                </p>
              </div>
            </div>
          </div>
          <div className="w-px border-l border-white-dark" />
          <div className="flex min-w-32 flex-col justify-center gap-2">
            <p className="text-sm font-bold text-gray-dark">
              Celkové zpoždění:
            </p>
            <p className="my-auto text-4xl font-bold">
              {finalDelay === null ? "—" : `${finalDelay} min`}
            </p>
            <p className="text-sm font-bold text-gray-dark">
              Počet checkpointů:{" "}
              <span className="text-xs font-bold text-foreground">
                {checkpoints.length}
              </span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
