export function nowUtcIso(): string {
  return new Date().toISOString();
}

export function formatTime(date: Date, seconds: boolean = false): string {
  return date.toLocaleTimeString("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
    second: seconds ? "2-digit" : undefined,
  });
}
