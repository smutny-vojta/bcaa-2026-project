"use client";

import { formatTime } from "@/shared/utils/time";
import { useEffect, useState } from "react";

interface TimeProps {
  date: Date;
  seconds: boolean;
  reactive?: boolean;
}

export default function TimeComponent({
  date,
  seconds = false,
  reactive = false,
}: TimeProps) {
  const [formattedTime, setFormattedTime] = useState(formatTime(date, seconds));

  useEffect(() => {
    if (!reactive) return;

    const interval = setInterval(() => {
      setFormattedTime(formatTime(new Date(), seconds));
    }, 1000);

    return () => clearInterval(interval);
  }, [date, seconds, reactive]);

  return <span>{formattedTime}</span>;
}
