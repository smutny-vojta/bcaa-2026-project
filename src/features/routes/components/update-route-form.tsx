"use client";

import { useMemo, useState } from "react";
import { LucidePlus, LucideTrash2 } from "lucide-react";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/shared/components/ui/field";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { FormDialogFooter } from "@/shared/components/ui/form-dialog-footer";
import {
  VehicleType,
  type VehicleType as VehicleTypeType,
} from "@/shared/constants/enums";
import { cn } from "@/shared/utils/cn";
import { DateTimePicker } from "@/shared/components/ui/date-time-picker";
import { localDateTimeToUtcIso } from "@/shared/utils/datetime";
import { vehicleTypeLabels } from "../constants";

import type { Route, UpdateRouteInput } from "../types";
import { Label } from "@/shared/components/ui/label";

type StopFormValue = {
  stop: string;
  plannedArrival: string;
  plannedDeparture: string;
};

type FormErrors = {
  type?: string;
  route?: string;
  carrier?: string;
  stops?: string;
};

type UpdateRouteFormProps = {
  route: Route;
  isSubmitting: boolean;
  onSubmit: (input: UpdateRouteInput) => void;
};

const vehicleTypeOptions = Object.values(VehicleType);

export default function UpdateRouteForm({
  route,
  isSubmitting,
  onSubmit,
}: UpdateRouteFormProps) {
  const [type, setType] = useState<VehicleTypeType>(route.type);
  const [routeName, setRouteName] = useState(route.route);
  const [carrier, setCarrier] = useState(route.carrier);
  const [stops, setStops] = useState<StopFormValue[]>(
    route.stops.map((s) => ({
      stop: s.stop,
      plannedArrival: s.plannedArrival,
      plannedDeparture: s.plannedDeparture,
    })),
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const canRemoveStop = stops.length > 1;

  const isSubmitDisabled = useMemo(
    () =>
      isSubmitting ||
      routeName.trim().length === 0 ||
      carrier.trim().length === 0 ||
      stops.some(
        (stop) =>
          stop.stop.trim().length === 0 ||
          stop.plannedArrival.length === 0 ||
          stop.plannedDeparture.length === 0,
      ),
    [carrier, isSubmitting, routeName, stops],
  );

  const upsertStop = (
    index: number,
    field: keyof StopFormValue,
    value: string,
  ) => {
    setStops((prev) =>
      prev.map((stop, i) => (i === index ? { ...stop, [field]: value } : stop)),
    );
  };

  const addStop = () => {
    setStops((prev) => [
      ...prev,
      { stop: "", plannedArrival: "", plannedDeparture: "" },
    ]);
  };

  const removeStop = (index: number) => {
    if (!canRemoveStop) {
      return;
    }

    setStops((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!type) {
      nextErrors.type = "Vyberte typ vozidla.";
    }
    if (routeName.trim().length === 0) {
      nextErrors.route = "Nazev linky je povinny.";
    }
    if (carrier.trim().length === 0) {
      nextErrors.carrier = "Dopravce je povinny.";
    }

    if (
      stops.length === 0 ||
      stops.some(
        (stop) =>
          stop.stop.trim().length === 0 ||
          stop.plannedArrival.length === 0 ||
          stop.plannedDeparture.length === 0,
      )
    ) {
      nextErrors.stops = "Vyplnte vsechny zastavky vcetne casu.";
    }

    for (const stop of stops) {
      if (stop.plannedArrival && stop.plannedDeparture) {
        const arrival = new Date(stop.plannedArrival);
        const departure = new Date(stop.plannedDeparture);
        if (
          Number.isNaN(arrival.getTime()) ||
          Number.isNaN(departure.getTime())
        ) {
          nextErrors.stops = "Casy zastavek musi mit validni hodnotu.";
          break;
        }
        if (departure < arrival) {
          nextErrors.stops = "Odjezd nemuze byt drive nez prijezd.";
          break;
        }
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      type,
      route: routeName.trim(),
      carrier: carrier.trim(),
      stops: stops.map((stop) => ({
        stop: stop.stop.trim(),
        plannedArrival: localDateTimeToUtcIso(stop.plannedArrival),
        plannedDeparture: localDateTimeToUtcIso(stop.plannedDeparture),
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="route-type">Dopravní prostředek</FieldLabel>
            <select
              id="route-type"
              value={type}
              onChange={(event) =>
                setType(event.target.value as VehicleTypeType)
              }
              className={cn(
                "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
            >
              {vehicleTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {vehicleTypeLabels[option]}
                </option>
              ))}
            </select>
            <FieldError>{errors.type}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="route-name">Název linky</FieldLabel>
            <Input
              id="route-name"
              autoComplete="off"
              placeholder="R19"
              value={routeName}
              onChange={(event) => setRouteName(event.target.value)}
              aria-invalid={Boolean(errors.route)}
            />
            <FieldError>{errors.route}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="carrier">Dopravce</FieldLabel>
            <Input
              id="carrier"
              autoComplete="off"
              placeholder="Ceske drahy"
              value={carrier}
              onChange={(event) => setCarrier(event.target.value)}
              aria-invalid={Boolean(errors.carrier)}
            />
            <FieldError>{errors.carrier}</FieldError>
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel>Zastávky</FieldLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addStop}
              >
                <LucidePlus />
                Přidat zastávku
              </Button>
            </div>
            <FieldDescription>
              Každá zastávka musí obsahovat název, plánovaný příjezd a plánovaný
              odjezd.
            </FieldDescription>

            <div className="space-y-3">
              {stops.map((stop, index) => (
                <div key={index} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{index + 1}. zastávka</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStop(index)}
                      disabled={!canRemoveStop}
                    >
                      <LucideTrash2 />
                      Odebrat
                    </Button>
                  </div>

                  <Input
                    placeholder="Název zastávky"
                    value={stop.stop}
                    onChange={(event) =>
                      upsertStop(index, "stop", event.target.value)
                    }
                  />

                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Plánovaný příjezd
                      </Label>
                      <DateTimePicker
                        value={stop.plannedArrival}
                        onChange={(value) =>
                          upsertStop(index, "plannedArrival", value)
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Plánovaný odjezd
                      </Label>
                      <DateTimePicker
                        value={stop.plannedDeparture}
                        onChange={(value) =>
                          upsertStop(index, "plannedDeparture", value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <FieldError>{errors.stops}</FieldError>
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
