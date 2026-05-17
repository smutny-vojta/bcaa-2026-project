import { LucideLoader2 } from "lucide-react";

export default function Loading() {
  return (
    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground">
      <LucideLoader2 className="animate-spin" /> Načítání...
    </span>
  );
}
