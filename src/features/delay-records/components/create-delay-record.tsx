"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LucidePlus } from "lucide-react";
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

import { createDelayRecord } from "../actions/createDelayRecord";
import type { CreateDelayRecordInput } from "../types";
import type { Route } from "@/features/routes/types";
import CreateDelayRecordForm from "@/features/delay-records/components/create-delay-record-form";

type CreateDelayRecordProps = {
  routes: Route[];
};

export default function CreateDelayRecord({ routes }: CreateDelayRecordProps) {
  const toastIdRef = useRef<string | number | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { execute, isExecuting } = useAction(createDelayRecord, {
    onExecute: () => {
      toastIdRef.current = toast("Vytvářím záznam...");
    },
    onSuccess: () => {
      toast.dismiss(toastIdRef.current);
      toast.success("Záznam vytvořen!");
      setOpen(false);
      router.refresh();
    },
    onError: (e) => {
      toast.dismiss(toastIdRef.current);
      toast.error("Nepodařilo se vytvořit záznam.");
      console.error(e);
    },
  });

  const handleSubmit = (input: CreateDelayRecordInput) => {
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
          Vytvořit nový záznam
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vytvořit nový záznam</DialogTitle>
          <DialogDescription>
            Vyplňte trasu, spoj a nástupní i výstupní zastávku.
          </DialogDescription>
        </DialogHeader>
        <CreateDelayRecordForm
          routes={routes}
          isSubmitting={isExecuting}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
