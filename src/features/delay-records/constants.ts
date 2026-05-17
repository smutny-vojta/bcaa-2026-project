export const delayRecordStateLabels: Record<
  "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED",
  string
> = {
  PLANNED: "Plánováno",
  ONGOING: "Probíhá",
  COMPLETED: "Dokončeno",
  CANCELLED: "Zrušeno",
};

export const createDelayRecordStateLabels: Record<
  "PLANNED" | "ONGOING",
  string
> = {
  PLANNED: "Plánováno",
  ONGOING: "Probíhá",
};
