export const formatDate = (date: Date) => {
  return date
    .toLocaleDateString("cs-CZ", {
      weekday: "short",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    })
    .replaceAll(". ", ".");
};
