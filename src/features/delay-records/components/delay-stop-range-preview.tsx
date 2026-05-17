"use client";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/cn";

type StopLike = {
  stop: string;
  index?: number;
};

type DelayStopRangePreviewProps = {
  stops: StopLike[];
  boardingStop: string;
  exitStop: string;
};

function getStopVariant(
  stopIndex: number,
  boardingIndex: number,
  exitIndex: number,
) {
  if (stopIndex < boardingIndex || stopIndex > exitIndex) {
    return "ghost";
  }

  if (stopIndex === boardingIndex) {
    return "outline";
  }

  if (stopIndex === exitIndex) {
    return "secondary";
  }

  return "default";
}

function getStopLabel(
  stopIndex: number,
  boardingIndex: number,
  exitIndex: number,
) {
  if (stopIndex < boardingIndex || stopIndex > exitIndex) {
    return "nepojede";
  }

  if (stopIndex === boardingIndex) {
    return "nástup";
  }

  if (stopIndex === exitIndex) {
    return "výstup";
  }

  return "pojede";
}

export function DelayStopRangePreview({
  stops,
  boardingStop,
  exitStop,
}: DelayStopRangePreviewProps) {
  const boardingIndex = stops.findIndex((stop) => stop.stop === boardingStop);
  const exitIndex = stops.findIndex((stop) => stop.stop === exitStop);

  if (boardingIndex === -1 || exitIndex === -1) {
    return null;
  }

  const rangeInvalid = boardingIndex >= exitIndex;

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Badge variant="outline" className="h-4 px-1.5 py-0 text-[10px]">
            nástup
          </Badge>
          <span>od této zastávky se jede</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <Badge variant="secondary" className="h-4 px-1.5 py-0 text-[10px]">
            výstup
          </Badge>
          <span>tady cesta končí</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <Badge variant="ghost" className="h-4 px-1.5 py-0 text-[10px]">
            nepojede
          </Badge>
          <span>stanice mimo trasu jízdy</span>
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {stops.map((stop, index) => {
          const variant = getStopVariant(index, boardingIndex, exitIndex);
          const label = getStopLabel(index, boardingIndex, exitIndex);
          const travelClassName =
            index === boardingIndex
              ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-200"
              : index === exitIndex
                ? "border-amber-500 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-500/10 dark:text-amber-200"
                : "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-200";

          return (
            <Badge
              key={stop.index ?? stop.stop}
              variant={variant}
              className={cn(
                "max-w-48 px-2 py-1 text-xs",
                index < boardingIndex || index > exitIndex
                  ? "opacity-60"
                  : travelClassName,
                rangeInvalid && "ring-1 ring-destructive/40",
              )}
              title={`${stop.stop} · ${label}`}
            >
              <span className="max-w-48 truncate">{stop.stop}</span>
              <span className="ml-1 opacity-80">{label}</span>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
