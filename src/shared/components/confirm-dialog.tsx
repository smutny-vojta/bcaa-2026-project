"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

type ConfirmDialogProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  trigger?: React.ReactNode; // optional trigger element (e.g. an icon button)
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  destructive?: boolean;
};

export function ConfirmDialog({
  title = "Are you sure?",
  description,
  trigger,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  open,
  onOpenChange,
  destructive = false,
}: ConfirmDialogProps) {
  const [loading, setLoading] = React.useState(false);

  async function handleConfirm() {
    try {
      setLoading(true);
      await onConfirm();
      onOpenChange?.(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{cancelLabel}</Button>
          </DialogClose>

          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Working..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDialog;
