"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LucidePen } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

import { updateDelayRecord } from "../actions/updateDelayRecord";
import type { DelayRecord, UpdateDelayRecordInput } from "../types";
import UpdateDelayRecordForm from "./update-delay-record-form";

type UpdateDelayRecordProps = {
  record: DelayRecord;
};

export default function UpdateDelayRecord({ record }: UpdateDelayRecordProps) {
  const toastIdRef = useRef<string | number | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { execute, isExecuting } = useAction(updateDelayRecord, {
    onExecute: () => {
      toastIdRef.current = toast("Ukládám změny...");
    },
    onSuccess: () => {
      toast.dismiss(toastIdRef.current);
      toast.success("Záznam uložen!");
      setOpen(false);
      router.refresh();
    },
    onError: () => {
      toast.dismiss(toastIdRef.current);
      toast.error("Nepodařilo se uložit záznam.");
    },
  });

  const handleSubmit = (input: UpdateDelayRecordInput) => {
    execute({ id: record.id, data: input });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default" size="icon" disabled={isExecuting}>
          <LucidePen />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upravit záznam</DialogTitle>
          <DialogDescription>
            Upravte stav záznamu, nástupní zastávku a výstupní zastávku.
          </DialogDescription>
        </DialogHeader>
        <UpdateDelayRecordForm
          record={record}
          isSubmitting={isExecuting}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
