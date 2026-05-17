export type ArchivedFilter = boolean | null;

export function parseArchivedFilter(value?: string): ArchivedFilter {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return null;
}
