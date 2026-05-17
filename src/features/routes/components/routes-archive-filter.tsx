import Link from "next/link";

import { Button } from "@/shared/components/ui/button";
import type { ArchivedFilter } from "@/features/routes/utils/archivedFilter";

type RoutesArchiveFilterProps = {
  archivedFilter: ArchivedFilter;
};

const filters: Array<{ label: string; value: ArchivedFilter }> = [
  { label: "Aktivní", value: false },
  { label: "Archivované", value: true },
  { label: "Vše", value: null },
];

export default function RoutesArchiveFilter({
  archivedFilter,
}: RoutesArchiveFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = archivedFilter === filter.value;
        const href =
          filter.value === null
            ? "/routes"
            : `/routes?archived=${String(filter.value)}`;

        return (
          <Button
            key={filter.label}
            asChild
            variant={isActive ? "default" : "outline"}
            size="sm"
          >
            <Link href={href}>{filter.label}</Link>
          </Button>
        );
      })}
    </div>
  );
}
