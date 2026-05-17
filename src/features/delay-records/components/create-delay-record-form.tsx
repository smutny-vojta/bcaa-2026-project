"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { FormDialogFooter } from "@/shared/components/ui/form-dialog-footer";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/utils/cn";

import type { CreateDelayRecordInput } from "../types";
import type { Route } from "@/features/routes/types";
import { createDelayRecordStateLabels } from "../constants";

type CreateDelayRecordFormProps = {
  routes: Route[];
  isSubmitting: boolean;
  onSubmit: (input: CreateDelayRecordInput) => void;
};

type FormErrors = {
  routeId?: string;
  tripCode?: string;
  state?: string;
  boardingStop?: string;
  exitStop?: string;
};

export default function CreateDelayRecordForm({
  routes,
  isSubmitting,
  onSubmit,
}: CreateDelayRecordFormProps) {
  const [routeId, setRouteId] = useState(routes[0]?.id ?? "");
  const [tripCode, setTripCode] = useState("");
  const [state, setState] =
    useState<CreateDelayRecordInput["state"]>("PLANNED");
  const [boardingStop, setBoardingStop] = useState("");
  const [exitStop, setExitStop] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === routeId),
    [routeId, routes],
  );

  useEffect(() => {
    if (!selectedRoute) {
      setBoardingStop("");
      setExitStop("");
      return;
    }

    const firstStop = selectedRoute.stops[0]?.stop ?? "";
    const lastStop =
      selectedRoute.stops[selectedRoute.stops.length - 1]?.stop ?? "";

    setBoardingStop((current) => current || firstStop);
    setExitStop((current) => current || lastStop);
  }, [selectedRoute]);

  const stopOptions = selectedRoute?.stops ?? [];

  const isSubmitDisabled = useMemo(
    () =>
      isSubmitting ||
      routeId.length === 0 ||
      tripCode.trim().length === 0 ||
      boardingStop.length === 0 ||
      exitStop.length === 0,
    [boardingStop, exitStop, isSubmitting, routeId, tripCode],
  );

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (routeId.length === 0) {
      nextErrors.routeId = "Vyberte trasu.";
    }

    if (tripCode.trim().length === 0) {
      nextErrors.tripCode = "Kód spoje je povinný.";
    }

    if (!state) {
      nextErrors.state = "Vyberte stav záznamu.";
    }

    if (boardingStop.length === 0) {
      nextErrors.boardingStop = "Vyberte nástupní zastávku.";
    }

    if (exitStop.length === 0) {
      nextErrors.exitStop = "Vyberte výstupní zastávku.";
    }

    if (selectedRoute) {
      const boardingIndex = selectedRoute.stops.findIndex(
        (stop) => stop.stop === boardingStop,
      );
      const exitIndex = selectedRoute.stops.findIndex(
        (stop) => stop.stop === exitStop,
      );

      if (
        boardingIndex !== -1 &&
        exitIndex !== -1 &&
        boardingIndex >= exitIndex
      ) {
        nextErrors.exitStop =
          "Výstupní zastávka musí být až po nástupní zastávce.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      routeId,
      tripCode: tripCode.trim(),
      state,
      boardingStop,
      exitStop,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="delay-record-route">Trasa</FieldLabel>
            <select
              id="delay-record-route"
              value={routeId}
              onChange={(event) => {
                setRouteId(event.target.value);
                setErrors((current) => ({ ...current, routeId: undefined }));
              }}
              className={cn(
                "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
            >
              <option value="" disabled>
                Vyberte trasu
              </option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.route} - {route.carrier}
                </option>
              ))}
            </select>
            <FieldError>{errors.routeId}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="delay-record-trip-code">Kód spoje</FieldLabel>
            <Input
              id="delay-record-trip-code"
              autoComplete="off"
              placeholder="RJ252"
              value={tripCode}
              onChange={(event) => setTripCode(event.target.value)}
              aria-invalid={Boolean(errors.tripCode)}
            />
            <FieldError>{errors.tripCode}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="delay-record-state">Stav</FieldLabel>
            <select
              id="delay-record-state"
              value={state}
              onChange={(event) =>
                setState(event.target.value as CreateDelayRecordInput["state"])
              }
              className={cn(
                "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
            >
              {Object.entries(createDelayRecordStateLabels).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
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
              disabled={!selectedRoute}
            >
              <option value="" disabled>
                Vyberte nástupní zastávku
              </option>
              {stopOptions.map((stop) => (
                <option key={stop.index} value={stop.stop}>
                  {stop.stop}
                </option>
              ))}
            </select>
            <FieldDescription>
              Vyberte zastávku, na které cestující nastupují.
            </FieldDescription>
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
              disabled={!selectedRoute}
            >
              <option value="" disabled>
                Vyberte výstupní zastávku
              </option>
              {stopOptions.map((stop) => (
                <option key={stop.index} value={stop.stop}>
                  {stop.stop}
                </option>
              ))}
            </select>
            <FieldDescription>
              Výstup musí být až po nástupní zastávce.
            </FieldDescription>
            <FieldError>{errors.exitStop}</FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>

      <FormDialogFooter
        isSubmitting={isSubmitting}
        submitDisabled={isSubmitDisabled}
        submitLabel="Vytvořit záznam"
        submittingLabel="Vytvářím..."
      />
    </form>
  );
}
