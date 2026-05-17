"use client";

import { useMemo, useRef, useState } from "react";

import { LucidePencil } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { updateDelayRecord } from "../actions/updateDelayRecord";
import type {
  DelayCheckpoint,
  DelayRecord,
  UpdateDelayRecordInput,
} from "../types";
import { Badge } from "../../../shared/components/ui/badge";
import { Button } from "../../../shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "../../../shared/components/ui/field";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/components/ui/table";
import { DelayReason } from "../../../shared/constants/enums";
import { cn } from "../../../shared/utils/cn";
import {
  applyTimeToUtcIso,
  utcIsoToDatetimeLocal,
  utcIsoToTimeValue,
} from "../../../shared/utils/datetime";
import { formatTime } from "../../../shared/utils/time";
import { useRouter } from "next/navigation";

const reasonLabels: Record<DelayReason, string> = {
  TRAFFIC: "Doprava",
  TECHNICAL_ISSUES: "Technické problémy",
  WEATHER: "Počasí",
  STAFF_SHORTAGE: "Nedostatek personálu",
  VEHICLE_FAILURE: "Porucha vozidla",
  INFRASTRUCTURE: "Infrastruktura",
  ACCIDENT: "Nehoda",
  SECURITY: "Bezpečnostní zásah",
  CONGESTION: "Dopravní zácpa",
  CONNECTION_WAIT: "Čekání na přípoj",
  DISPATCHING_DELAY: "Provozní zdržení",
  MAINTENANCE: "Údržba",
  OTHER: "Jiné",
};

function isInTravelSegment(
  index: number,
  boardingIndex: number,
  exitIndex: number,
) {
  return index >= boardingIndex && index <= exitIndex;
}

function isDelayed(actual: string | null, planned: string) {
  return Boolean(actual) && actual !== planned;
}

function TimeCell({
  actual,
  planned,
}: {
  actual: string | null;
  planned: string;
}) {
  if (!actual) {
    return <span className="text-muted-foreground">—</span>;
  }

  const delayed = isDelayed(actual, planned);

  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={cn(
          "tabular-nums",
          delayed && "font-medium text-destructive",
        )}
      >
        {formatTime(new Date(actual))}
      </span>
      {delayed ? (
        <span className="tabular-nums text-xs text-muted-foreground line-through">
          {formatTime(new Date(planned))}
        </span>
      ) : null}
    </div>
  );
}

function ReasonBadge({ reason }: { reason: DelayReason | null }) {
  if (!reason) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <Badge variant="outline" className="border-white-dark">
      {reasonLabels[reason as DelayReason]}
    </Badge>
  );
}

type CheckpointEditDialogProps = {
  checkpoint: DelayCheckpoint;
  recordId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function CheckpointEditDialog({
  checkpoint,
  recordId,
  open,
  onOpenChange,
}: CheckpointEditDialogProps) {
  const router = useRouter();
  const toastIdRef = useRef<string | number | undefined>(undefined);
  const plannedArrival = utcIsoToDatetimeLocal(checkpoint.arrival.planned);
  const plannedDeparture = utcIsoToDatetimeLocal(checkpoint.departure.planned);
  const [arrivalActual, setArrivalActual] = useState(
    utcIsoToTimeValue(checkpoint.arrival.actual ?? checkpoint.arrival.planned),
  );
  const [departureActual, setDepartureActual] = useState(
    utcIsoToTimeValue(
      checkpoint.departure.actual ?? checkpoint.departure.planned,
    ),
  );
  const [reason, setReason] = useState<DelayReason | null>(checkpoint.reason);
  const [note, setNote] = useState(checkpoint.note ?? "");

  const { execute, isExecuting } = useAction(updateDelayRecord, {
    onExecute: () => {
      toastIdRef.current = toast.loading("Ukládám checkpoint...");
    },
    onSuccess: () => {
      toast.dismiss(toastIdRef.current);
      toast.success("Checkpoint uložen!");
      onOpenChange(false);
      router.refresh();
    },
    onError: () => {
      toast.dismiss(toastIdRef.current);
      toast.error("Nepodařilo se uložit checkpoint.");
    },
  });

  const handleSave = () => {
    const input: UpdateDelayRecordInput = {
      checkpoints: [
        {
          stop: checkpoint.stop,
          arrival: {
            actual: applyTimeToUtcIso(
              checkpoint.arrival.planned,
              arrivalActual,
            ),
          },
          departure: {
            actual: applyTimeToUtcIso(
              checkpoint.departure.planned,
              departureActual,
            ),
          },
          reason,
          note: note.trim().length > 0 ? note.trim() : null,
        },
      ],
    };

    execute({ id: recordId, data: input });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-140">
        <DialogHeader>
          <DialogTitle>Upravit checkpoint</DialogTitle>
          <DialogDescription>
            Upravte skutečný příjezd, odjezd, důvod a poznámku pro{" "}
            {checkpoint.stop}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 rounded-lg border bg-white-light p-3 md:grid-cols-2">
            <Field>
              <FieldLabel>Plánovaný příjezd</FieldLabel>
              <Input type="datetime-local" value={plannedArrival} disabled />
            </Field>
            <Field>
              <FieldLabel>Plánovaný odjezd</FieldLabel>
              <Input type="datetime-local" value={plannedDeparture} disabled />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor={`arrival-${checkpoint.stop}`}>
              Skutečný příjezd
            </FieldLabel>
            <Input
              id={`arrival-${checkpoint.stop}`}
              type="time"
              step="60"
              value={arrivalActual}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setArrivalActual(event.target.value)
              }
            />
          </Field>

          <Field>
            <FieldLabel htmlFor={`departure-${checkpoint.stop}`}>
              Skutečný odjezd
            </FieldLabel>
            <Input
              id={`departure-${checkpoint.stop}`}
              type="time"
              step="60"
              value={departureActual}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setDepartureActual(event.target.value)
              }
            />
          </Field>

          <Field>
            <FieldLabel htmlFor={`reason-${checkpoint.stop}`}>Důvod</FieldLabel>
            <select
              id={`reason-${checkpoint.stop}`}
              value={reason ?? ""}
              onChange={(event) =>
                setReason(
                  event.target.value === ""
                    ? null
                    : (event.target.value as DelayCheckpoint["reason"]),
                )
              }
              className={cn(
                "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
            >
              <option value="">Bez důvodu</option>
              {Object.entries(reasonLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field>
            <Label htmlFor={`note-${checkpoint.stop}`}>Poznámka</Label>
            <Input
              id={`note-${checkpoint.stop}`}
              value={note}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setNote(event.target.value)
              }
              placeholder="Volitelná poznámka"
            />
            <FieldDescription>
              Poznámka se uloží jen pokud není prázdná.
            </FieldDescription>
          </Field>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Zrušit
          </Button>
          <Button onClick={handleSave} disabled={isExecuting}>
            {isExecuting ? "Ukládám..." : "Uložit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type DelayDetailTableProps = {
  delayRecord: DelayRecord;
};

export default function DelayDetailTable({
  delayRecord,
}: DelayDetailTableProps) {
  const [selectedCheckpoint, setSelectedCheckpoint] =
    useState<DelayCheckpoint | null>(null);

  const boardingIndex = useMemo(
    () =>
      delayRecord.checkpoints.findIndex(
        (checkpoint: DelayCheckpoint) =>
          checkpoint.stop === delayRecord.boardingStop,
      ),
    [delayRecord.boardingStop, delayRecord.checkpoints],
  );
  const exitIndex = useMemo(
    () =>
      delayRecord.checkpoints.findIndex(
        (checkpoint: DelayCheckpoint) =>
          checkpoint.stop === delayRecord.exitStop,
      ),
    [delayRecord.checkpoints, delayRecord.exitStop],
  );

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Stanice a zpoždění</h2>
          {delayRecord.state === "COMPLETED" ||
          delayRecord.state === "CANCELLED" ? (
            <Badge variant="outline" className="border-white-dark">
              Záznam je uzamčený
            </Badge>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-lg border bg-white-light">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Stanice</TableHead>
                <TableHead>Příjezd</TableHead>
                <TableHead>Odjezd</TableHead>
                <TableHead>Důvod</TableHead>
                <TableHead>Poznámka</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {delayRecord.checkpoints.length ? (
                delayRecord.checkpoints.map((checkpoint, index) => {
                  const isTravelSegment =
                    boardingIndex !== -1 &&
                    exitIndex !== -1 &&
                    isInTravelSegment(index, boardingIndex, exitIndex);

                  return (
                    <TableRow key={checkpoint.index}>
                      <TableCell className="align-top font-semibold text-gray-dark">
                        {index + 1}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "text-foreground",
                                isTravelSegment && "font-semibold",
                              )}
                            >
                              {checkpoint.stop}
                            </span>
                            {isTravelSegment ? (
                              <span className="text-xs font-medium text-gray-dark">
                                {index === boardingIndex
                                  ? "nástup"
                                  : index === exitIndex
                                    ? "výstup"
                                    : "jede"}
                              </span>
                            ) : null}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {isDelayed(
                              checkpoint.arrival.actual,
                              checkpoint.arrival.planned,
                            ) ||
                            isDelayed(
                              checkpoint.departure.actual,
                              checkpoint.departure.planned,
                            )
                              ? "Zpoždění"
                              : "Bez zpoždění"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <TimeCell
                          actual={checkpoint.arrival.actual}
                          planned={checkpoint.arrival.planned}
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <TimeCell
                          actual={checkpoint.departure.actual}
                          planned={checkpoint.departure.planned}
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <ReasonBadge reason={checkpoint.reason} />
                      </TableCell>
                      <TableCell className="align-top">
                        <span className="text-sm text-gray-dark">
                          {checkpoint.note?.trim().length
                            ? checkpoint.note
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="align-top">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setSelectedCheckpoint(checkpoint)}
                          disabled={
                            delayRecord.state === "COMPLETED" ||
                            delayRecord.state === "CANCELLED"
                          }
                        >
                          <LucidePencil className="h-4 w-4" />
                          <span className="sr-only">
                            Upravit {checkpoint.stop}
                          </span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Žádné checkpointy.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedCheckpoint ? (
        <CheckpointEditDialog
          checkpoint={selectedCheckpoint}
          recordId={delayRecord.id}
          open={Boolean(selectedCheckpoint)}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedCheckpoint(null);
            }
          }}
        />
      ) : null}
    </>
  );
}
