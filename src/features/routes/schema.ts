import { z } from "zod";
import { VehicleType } from "@/shared/constants/enums";

const vehicleTypeSchema = z.enum(VehicleType, {
  message: "type má neplatnou hodnotu.",
});

const utcIsoString = z.iso
  .datetime({ offset: true, message: "Musí být ISO datum a čas." })
  .refine((value) => value.endsWith("Z"), {
    message: "Musí být UTC ISO datum.",
  });

const nonEmptyString = (label: string) =>
  z.string({ message: `${label} musí být text.` }).min(1, {
    message: `${label} nesmí být prázdné.`,
  });

const nonNegativeInt = (label: string) =>
  z
    .number({ message: `${label} musí být číslo.` })
    .int({ message: `${label} musí být celé číslo.` })
    .nonnegative({ message: `${label} musí být nezáporné.` });

const nonEmptyArray = <T>(schema: z.ZodType<T>, label: string) =>
  z.array(schema, { message: `${label} musí být pole.` }).min(1, {
    message: `${label} musí být neprázdné pole.`,
  });

export const routeStopSchema = z.object({
  index: nonNegativeInt("index"),
  stop: nonEmptyString("stop"),
  plannedArrival: utcIsoString,
  plannedDeparture: utcIsoString,
});

export const routeSchema = z.object({
  id: nonEmptyString("id"),
  type: vehicleTypeSchema,
  route: nonEmptyString("route"),
  carrier: nonEmptyString("carrier"),
  stops: nonEmptyArray(routeStopSchema, "stops"),
  archivedAt: utcIsoString.nullable(),
  createdAt: utcIsoString,
  updatedAt: utcIsoString,
});

export const routeIdSchema = nonEmptyString("id");

export const createRouteInputSchema = z.object({
  type: vehicleTypeSchema,
  route: nonEmptyString("route"),
  carrier: nonEmptyString("carrier"),
  stops: nonEmptyArray(
    z.object({
      stop: nonEmptyString("stop"),
      plannedArrival: utcIsoString,
      plannedDeparture: utcIsoString,
    }),
    "stops",
  ),
});

export const updateRouteInputSchema = z.object({
  type: vehicleTypeSchema.optional(),
  route: nonEmptyString("route").optional(),
  carrier: nonEmptyString("carrier").optional(),
  stops: nonEmptyArray(
    z.object({
      stop: nonEmptyString("stop"),
      plannedArrival: utcIsoString,
      plannedDeparture: utcIsoString,
    }),
    "stops",
  ).optional(),
});

export const listRoutesFilterSchema = z.object({
  archivedAt: z.boolean().nullable().optional(),
  type: vehicleTypeSchema.optional(),
  carrier: nonEmptyString("carrier").optional(),
});

export type RouteStopSchema = z.infer<typeof routeStopSchema>;
export type RouteSchema = z.infer<typeof routeSchema>;
export type CreateRouteInputSchema = z.infer<typeof createRouteInputSchema>;
export type UpdateRouteInputSchema = z.infer<typeof updateRouteInputSchema>;
export type RouteIdSchema = z.infer<typeof routeIdSchema>;
export type ListRoutesFilterSchema = z.infer<typeof listRoutesFilterSchema>;
