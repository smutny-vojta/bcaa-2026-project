import { z } from "zod";
import { DelayReason, DelayState } from "@/shared/constants/enums";

const delayStateSchema = z.enum(DelayState, {
  message: "state má neplatnou hodnotu.",
});
const delayReasonSchema = z.enum(DelayReason, {
  message: "reason má neplatnou hodnotu.",
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

export const delayCheckpointSchema = z.object({
  index: nonNegativeInt("index"),
  stop: nonEmptyString("stop"),
  arrival: z.object({
    planned: utcIsoString,
    actual: utcIsoString.nullable(),
  }),
  departure: z.object({
    planned: utcIsoString,
    actual: utcIsoString.nullable(),
  }),
  reason: delayReasonSchema.nullable(),
  note: nonEmptyString("note").optional(),
});

export const delayRecordSchema = z.object({
  id: nonEmptyString("id"),
  routeId: nonEmptyString("routeId"),
  tripCode: nonEmptyString("tripCode"),
  scheduled: utcIsoString,
  state: delayStateSchema,
  boardingStop: nonEmptyString("boardingStop"),
  exitStop: nonEmptyString("exitStop"),
  checkpoints: nonEmptyArray(delayCheckpointSchema, "checkpoints"),
  finalDelay: nonNegativeInt("finalDelay").nullable(),
  createdAt: utcIsoString,
  updatedAt: utcIsoString,
});

export const delayRecordIdSchema = nonEmptyString("id");

export const createDelayRecordInputSchema = z.object({
  routeId: nonEmptyString("routeId"),
  tripCode: nonEmptyString("tripCode"),
  state: z.enum([DelayState.PLANNED, DelayState.ONGOING], {
    message: "state musí být PLANNED nebo ONGOING.",
  }),
  boardingStop: nonEmptyString("boardingStop"),
  exitStop: nonEmptyString("exitStop"),
});

export const updateDelayRecordInputSchema = z.object({
  state: delayStateSchema.optional(),
  boardingStop: nonEmptyString("boardingStop").optional(),
  exitStop: nonEmptyString("exitStop").optional(),
  checkpoints: z
    .array(
      z.object({
        stop: nonEmptyString("stop"),
        arrival: z
          .object({
            actual: utcIsoString.nullable(),
          })
          .optional(),
        departure: z
          .object({
            actual: utcIsoString.nullable(),
          })
          .optional(),
        reason: delayReasonSchema.nullable().optional(),
        note: nonEmptyString("note").nullable().optional(),
      }),
    )
    .min(1, { message: "checkpoints musí být neprázdné pole." })
    .optional(),
});

export const listDelayRecordsFilterSchema = z.object({
  routeId: nonEmptyString("routeId").optional(),
  tripCode: nonEmptyString("tripCode").optional(),
  state: delayStateSchema.optional(),
  scheduledFrom: utcIsoString.optional(),
  scheduledTo: utcIsoString.optional(),
  finalDelayMin: nonNegativeInt("finalDelayMin").optional(),
  finalDelayMax: nonNegativeInt("finalDelayMax").optional(),
});

export type DelayCheckpointSchema = z.infer<typeof delayCheckpointSchema>;
export type DelayRecordSchema = z.infer<typeof delayRecordSchema>;
export type CreateDelayRecordInputSchema = z.infer<
  typeof createDelayRecordInputSchema
>;
export type UpdateDelayRecordInputSchema = z.infer<
  typeof updateDelayRecordInputSchema
>;
export type DelayRecordIdSchema = z.infer<typeof delayRecordIdSchema>;
export type ListDelayRecordsFilterSchema = z.infer<
  typeof listDelayRecordsFilterSchema
>;
