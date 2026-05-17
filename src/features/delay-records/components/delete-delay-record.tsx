"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { LucideTrash } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import ConfirmDialog from "@/shared/components/confirm-dialog";
import { Button } from "@/shared/components/ui/button";

import { deleteDelayRecord } from "../actions/deleteDelayRecord";

type DeleteDelayRecordProps = {
  recordId: string;
};

export default function DeleteDelayRecord({
  recordId,
}: DeleteDelayRecordProps) {
  const router = useRouter();
  const toastIdRef = useRef<string | number | undefined>(undefined);
  const { execute } = useAction(deleteDelayRecord, {
    onExecute: () => {
      toastIdRef.current = toast.loading("Mazání záznamu...");
    },
    onSuccess: () => {
      toast.dismiss(toastIdRef.current);
      toast.success("Záznam smazán!");
      router.push("/delay-records");
      router.refresh();
    },
    onError: () => {
      toast.dismiss(toastIdRef.current);
      toast.error("Nepodařilo se smazat záznam.");
    },
  });

  return (
    <ConfirmDialog
      trigger={
        <Button variant="destructive" size="icon">
          <LucideTrash />
        </Button>
      }
      title="Smazat záznam?"
      description="Opravdu chcete tento záznam o zpoždění smazat? Tuto akci nelze vrátit."
      confirmLabel="Smazat"
      cancelLabel="Zrušit"
      destructive
      onConfirm={async () => {
        execute(recordId);
      }}
    />
  );
}
