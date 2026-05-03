export function generateId(): string {
  const value = crypto.randomUUID();
  return value;
}
