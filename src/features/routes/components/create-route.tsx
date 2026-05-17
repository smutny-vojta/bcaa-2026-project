"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { LucidePlus } from "lucide-react";

import { useAction } from "next-safe-action/hooks";
import { createRoute } from "../actions/createRoute";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import CreateRouteForm from "@/features/routes/components/create-route-form";
import type { CreateRouteInput } from "@/features/routes/types";

export default function CreateRoute() {
  const toastIdRef = useRef<string | number | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { execute, isExecuting } = useAction(createRoute, {
    onExecute: () => {
      toastIdRef.current = toast("Vytvářím linku...");
    },
    onSuccess: () => {
      toast.dismiss(toastIdRef.current);
      toast.success("Linka vytvořena!");
      setOpen(false);
      router.refresh();
    },
    onError: () => {
      toast.dismiss(toastIdRef.current);
      toast.error("Nepodařilo se vytvořit linku.");
    },
  });

  const handleSubmit = (input: CreateRouteInput) => {
    execute(input);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default" size="lg" disabled={isExecuting}>
          <LucidePlus />
          Vytvořit novou linku
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vytvořit novou linku</DialogTitle>
          <DialogDescription>
            Vyplňte základní informace a zastávky trasy.
          </DialogDescription>
        </DialogHeader>
        <CreateRouteForm isSubmitting={isExecuting} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
