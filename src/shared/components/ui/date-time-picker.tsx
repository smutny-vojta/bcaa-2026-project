"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/shared/components/ui/input";

import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  disabled = false,
  className,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse ISO datetime string to Date and time
  const parseDateTime = (dateTimeString: string) => {
    if (!dateTimeString) {
      const now = new Date();
      return {
        date: now,
        timeString: "00:00",
      };
    }

    try {
      const date = new Date(dateTimeString);
      const parts = dateTimeString.includes("T")
        ? dateTimeString.split("T")[1]?.split("+")[0]?.split("Z")[0] ||
          "00:00:00"
        : "00:00:00";
      // Convert HH:MM:SS to HH:MM for input type="time"
      const timeString = parts.slice(0, 5);
      return { date, timeString };
    } catch {
      const now = new Date();
      return { date: now, timeString: "00:00" };
    }
  };

  const { date, timeString } = parseDateTime(value);

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return;
    const isoString = newDate.toISOString().split("T")[0];
    const newDateTime = `${isoString}T${timeString}:00`;
    onChange(newDateTime);
  };

  const handleTimeChange = (newTime: string) => {
    const isoString = date.toISOString().split("T")[0];
    const newDateTime = `${isoString}T${newTime}:00`;
    onChange(newDateTime);
  };

  const displayDate = date ? format(date, "PPP") : "Vyberte datum";

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            data-empty={!value}
            className="flex-1 justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayDate}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              handleDateChange(newDate);
              setIsOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <Input
        type="time"
        value={timeString}
        onChange={(e) => handleTimeChange(e.target.value)}
        disabled={disabled}
        className="w-32"
      />
    </div>
  );
}
