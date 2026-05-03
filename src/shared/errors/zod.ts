import type { z } from "zod";
import { ErrorCode } from "@/shared/errors/errorCodes";
import { ErrorMessageKey } from "@/shared/errors/messages";
import { AppError } from "@/shared/errors/appError";

export function parseOrThrow<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  data: unknown,
): z.infer<TSchema> {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }

  throw new AppError(
    ErrorMessageKey.VALIDATION_ERROR,
    ErrorCode.VALIDATION_ERROR,
    {
      issues: result.error.issues,
    },
  );
}
