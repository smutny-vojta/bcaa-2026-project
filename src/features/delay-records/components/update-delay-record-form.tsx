"use client";

import { useMemo, useState } from "react";

import { FormDialogFooter } from "@/shared/components/ui/form-dialog-footer";
import {
  Field,
  FieldError,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/shared/components/ui/field";
import { cn } from "@/shared/utils/cn";

import type { DelayRecord, UpdateDelayRecordInput } from "../types";
import { delayRecordStateLabels } from "../constants";
import { DelayStopRangePreview } from "./delay-stop-range-preview";

type UpdateDelayRecordFormProps = {
  record: DelayRecord;
  isSubmitting: boolean;
  onSubmit: (input: UpdateDelayRecordInput) => void;
};

type FormErrors = {
  state?: string;
  boardingStop?: string;
  exitStop?: string;
};

export default function UpdateDelayRecordForm({
  record,
  isSubmitting,
  onSubmit,
}: UpdateDelayRecordFormProps) {
  const isLocked = record.state === "COMPLETED" || record.state === "CANCELLED";
  const [state, setState] = useState<DelayRecord["state"]>(record.state);
  const [boardingStop, setBoardingStop] = useState(record.boardingStop);
  const [exitStop, setExitStop] = useState(record.exitStop);
  const [errors, setErrors] = useState<FormErrors>({});

  const stopOptions = record.checkpoints;

  const isSubmitDisabled = useMemo(
    () => isSubmitting || isLocked,
    [isLocked, isSubmitting],
  );

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!state) {
      nextErrors.state = "Vyberte stav záznamu.";
    }

    if (boardingStop.length === 0) {
      nextErrors.boardingStop = "Vyberte nástupní zastávku.";
    }

    if (exitStop.length === 0) {
      nextErrors.exitStop = "Vyberte výstupní zastávku.";
    }

    const boardingIndex = stopOptions.findIndex(
      (checkpoint) => checkpoint.stop === boardingStop,
    );
    const exitIndex = stopOptions.findIndex(
      (checkpoint) => checkpoint.stop === exitStop,
    );

    if (
      boardingIndex !== -1 &&
      exitIndex !== -1 &&
      boardingIndex >= exitIndex
    ) {
      nextErrors.exitStop =
        "Výstupní zastávka musí být až po nástupní zastávce.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (isLocked || !validateForm()) {
      return;
    }

    onSubmit({
      state,
      boardingStop,
      exitStop,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isLocked ? (
        <p className="rounded-lg border border-white-dark bg-white-light px-3 py-2 text-sm text-gray-dark">
          Tento záznam je uzamčený a nelze jej upravovat.
        </p>
      ) : null}

      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="delay-record-state">Stav</FieldLabel>
            <select
              id="delay-record-state"
              value={state}
              onChange={(event) =>
                setState(event.target.value as DelayRecord["state"])
              }
              className={cn(
                "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
              disabled={isLocked}
            >
              {Object.entries(delayRecordStateLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <FieldError>{errors.state}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="delay-record-boarding">
              Nástupní zastávka
            </FieldLabel>
            <select
              id="delay-record-boarding"
              value={boardingStop}
              onChange={(event) => setBoardingStop(event.target.value)}
              className={cn(
                "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
              disabled={isLocked}
            >
              {stopOptions.map((checkpoint) => (
                <option key={checkpoint.stop} value={checkpoint.stop}>
                  {checkpoint.stop}
                </option>
              ))}
            </select>
            <FieldError>{errors.boardingStop}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="delay-record-exit">
              Výstupní zastávka
            </FieldLabel>
            <select
              id="delay-record-exit"
              value={exitStop}
              onChange={(event) => setExitStop(event.target.value)}
              className={cn(
                "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
              disabled={isLocked}
            >
              {stopOptions.map((checkpoint) => (
                <option key={checkpoint.stop} value={checkpoint.stop}>
                  {checkpoint.stop}
                </option>
              ))}
            </select>
            <FieldError>{errors.exitStop}</FieldError>
          </Field>

          <Field>
            <FieldLabel>Rozsah jízdy</FieldLabel>
            <FieldDescription>
              Barevně je vidět, které zastávky zůstanou mimo jízdu a které jsou
              mezi nástupem a výstupem.
            </FieldDescription>
            <DelayStopRangePreview
              stops={stopOptions}
              boardingStop={boardingStop}
              exitStop={exitStop}
            />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FormDialogFooter
        isSubmitting={isSubmitting}
        submitDisabled={isSubmitDisabled}
        submitLabel="Uložit změny"
        submittingLabel="Ukládám..."
      />
    </form>
  );
}
