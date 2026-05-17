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
import { LucidePen } from "lucide-react";

import { useAction } from "next-safe-action/hooks";
import { updateRoute } from "../actions/updateRoute";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import UpdateRouteForm from "@/features/routes/components/update-route-form";
import type { Route, UpdateRouteInput } from "@/features/routes/types";

interface UpdateRouteProps {
  route: Route;
}

export default function UpdateRoute({ route }: UpdateRouteProps) {
  const toastIdRef = useRef<string | number | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { execute, isExecuting } = useAction(updateRoute, {
    onExecute: () => {
      toastIdRef.current = toast("Ukládám změny...");
    },
    onSuccess: () => {
      toast.dismiss(toastIdRef.current);
      toast.success("Linka uložena!");
      setOpen(false);
      router.refresh();
    },
    onError: (error) => {
      toast.dismiss(toastIdRef.current);
      toast.error("Nepodařilo se uložit linku.");
      console.log(error);
    },
  });

  const handleSubmit = (input: UpdateRouteInput) => {
    execute({ id: route.id, data: input });
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
          <DialogTitle>Upravit linku</DialogTitle>
          <DialogDescription>
            Upravte informace a zastávky trasy.
          </DialogDescription>
        </DialogHeader>
        <UpdateRouteForm
          route={route}
          isSubmitting={isExecuting}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
