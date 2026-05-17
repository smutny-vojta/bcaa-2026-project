"use client";

import { formatDate } from "@/shared/utils/date";

interface DateProps {
  date: Date;
}

export default function DateComponent({ date }: DateProps) {
  const formattedDate = formatDate(date);

  return <span>{formattedDate}</span>;
}
