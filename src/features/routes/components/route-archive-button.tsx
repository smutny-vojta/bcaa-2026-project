"use client";

import { useAction } from "next-safe-action/hooks";
import { LucideTrash } from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "@/shared/components/confirm-dialog";
import { Button } from "@/shared/components/ui/button";
import { useRouter } from "next/navigation";

import { archiveRoute } from "../actions/archiveRoute";

type RouteArchiveButtonProps = {
  routeId: string;
};

export default function RouteArchiveButton({
  routeId,
}: RouteArchiveButtonProps) {
  let toastId: string | number | undefined;
  const router = useRouter();
  const { execute } = useAction(archiveRoute, {
    onExecute: () => {
      toastId = toast.loading("Archiving route...");
    },
    onSuccess: () => {
      toast.dismiss(toastId);
      toast.success("Route archived successfully!");
      router.refresh();
    },
    onError: ({ error }) => {
      toast.dismiss(toastId);
      toast.error("Failed to archive route.");
    },
  });

  return (
    <ConfirmDialog
      trigger={
        <Button variant="destructive" size="icon">
          <LucideTrash />
        </Button>
      }
      title="Archivovat trasu?"
      description="Opravdu chcete archivovat tuto trasu? Tuto akci nelze vrátit."
      confirmLabel="Archivovat"
      cancelLabel="Zrušit"
      destructive
      onConfirm={async () => {
        execute(routeId);
      }}
    />
  );
}
