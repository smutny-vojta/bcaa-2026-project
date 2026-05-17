export function localDateTimeToUtcIso(value: string): string {
  if (!value) return new Date().toISOString();

  const date = new Date(value);
  return date.toISOString();
}

export function utcIsoToDatetimeLocal(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function utcIsoToTimeValue(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function applyTimeToUtcIso(
  plannedValue: string,
  timeValue: string | null,
): string | null {
  if (!timeValue) {
    return null;
  }

  const plannedDate = new Date(plannedValue);
  const [hours, minutes] = timeValue.split(":");
  plannedDate.setHours(Number(hours), Number(minutes), 0, 0);
  return plannedDate.toISOString();
}
