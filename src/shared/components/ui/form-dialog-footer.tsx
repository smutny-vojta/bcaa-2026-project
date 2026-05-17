"use client";

import { Button } from "@/shared/components/ui/button";
import { DialogClose, DialogFooter } from "@/shared/components/ui/dialog";

type FormDialogFooterProps = {
  submitLabel: string;
  submittingLabel?: string;
  isSubmitting: boolean;
  submitDisabled?: boolean;
};

export function FormDialogFooter({
  submitLabel,
  submittingLabel,
  isSubmitting,
  submitDisabled = false,
}: FormDialogFooterProps) {
  return (
    <DialogFooter>
      <DialogClose asChild>
        <Button type="button" variant="outline" disabled={isSubmitting}>
          Zrušit
        </Button>
      </DialogClose>
      <Button type="submit" disabled={isSubmitting || submitDisabled}>
        {isSubmitting ? (submittingLabel ?? "Ukládám...") : submitLabel}
      </Button>
    </DialogFooter>
  );
}
