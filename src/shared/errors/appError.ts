import { ErrorCode, errorStatusMap } from "@/shared/errors/errorCodes";
import { ErrorMessageKey, errorMessagesCs } from "@/shared/errors/messages";

export type AppErrorDetails = Record<string, unknown>;

export class AppError extends Error {
  code: ErrorCode;
  status: number;
  messageKey: ErrorMessageKey;
  details?: AppErrorDetails;

  constructor(
    messageKey: ErrorMessageKey,
    code: ErrorCode,
    details?: AppErrorDetails,
    messageOverride?: string,
  ) {
    super(messageOverride ?? errorMessagesCs[messageKey]);
    this.name = "AppError";
    this.code = code;
    this.status = errorStatusMap[code];
    this.messageKey = messageKey;
    this.details = details;
  }
}

export function throwAppError(
  messageKey: ErrorMessageKey,
  code: ErrorCode,
  details?: AppErrorDetails,
): never {
  throw new AppError(messageKey, code, details);
}
