"use client";

import * as React from "react";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/utils/cn";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  disabled = false,
  className,
}: TimePickerProps) {
  const parseTime = (timeString: string) => {
    if (!timeString) return { hours: "00", minutes: "00", seconds: "00" };
    const [hours = "00", minutes = "00", seconds = "00"] =
      timeString.split(":");
    return { hours, minutes, seconds };
  };

  const { hours, minutes, seconds } = parseTime(value);

  const handleTimeChange = (
    newHours: string,
    newMinutes: string,
    newSeconds: string,
  ) => {
    // Pad with zeros
    const h = newHours.padStart(2, "0");
    const m = newMinutes.padStart(2, "0");
    const s = newSeconds.padStart(2, "0");
    onChange(`${h}:${m}:${s}`);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">HH</label>
        <Input
          type="number"
          min="0"
          max="23"
          value={hours}
          onChange={(e) => {
            const val = Math.min(
              23,
              Math.max(0, parseInt(e.target.value) || 0),
            );
            handleTimeChange(val.toString(), minutes, seconds);
          }}
          disabled={disabled}
          className="w-12 text-center"
        />
      </div>
      <div className="text-lg font-semibold">:</div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">MM</label>
        <Input
          type="number"
          min="0"
          max="59"
          value={minutes}
          onChange={(e) => {
            const val = Math.min(
              59,
              Math.max(0, parseInt(e.target.value) || 0),
            );
            handleTimeChange(hours, val.toString(), seconds);
          }}
          disabled={disabled}
          className="w-12 text-center"
        />
      </div>
      <div className="text-lg font-semibold">:</div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">SS</label>
        <Input
          type="number"
          min="0"
          max="59"
          value={seconds}
          onChange={(e) => {
            const val = Math.min(
              59,
              Math.max(0, parseInt(e.target.value) || 0),
            );
            handleTimeChange(hours, minutes, val.toString());
          }}
          disabled={disabled}
          className="w-12 text-center"
        />
      </div>
    </div>
  );
}
