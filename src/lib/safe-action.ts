import { createSafeActionClient } from "next-safe-action";
import { AppError } from "@/shared/errors/appError";

export const actionClient = createSafeActionClient({
  handleServerError: (e) => {
    if (e instanceof AppError) {
      return {
        message: e.message,
        code: e.code,
      };
    }

    console.error("[Server Error]:", e);
    return "Something went wrong while executing the operation.";
  },
});
