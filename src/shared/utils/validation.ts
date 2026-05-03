export function assertNonEmpty(value: string, field: string): void {
  if (!value.trim()) {
    throw new Error(`${field} nesmí být prázdné.`);
  }
}
