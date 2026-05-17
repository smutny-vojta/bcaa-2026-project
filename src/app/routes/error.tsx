"use client";

import { Button } from "@/shared/components/ui/button";

export default function RoutesError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-destructive/20 bg-background p-6">
      <div>
        <p className="font-heading text-lg font-medium text-destructive">
          Nepodařilo se načíst trasy
        </p>
        <p className="text-sm text-muted-foreground">
          Zkuste stránku načíst znovu.
        </p>
      </div>
      <div>
        <Button variant="outline" onClick={reset}>
          Zkusit znovu
        </Button>
      </div>
    </div>
  );
}
