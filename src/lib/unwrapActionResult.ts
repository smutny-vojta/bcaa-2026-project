type ActionResult<T> = {
  data?: T;
  serverError?: { message: string; code?: string } | string;
  validationErrors?: Record<string, unknown>;
};

export function unwrapActionResult<T>(result: ActionResult<T> | T): T {
  if (
    result &&
    typeof result === "object" &&
    ("data" in result ||
      "serverError" in result ||
      "validationErrors" in result)
  ) {
    const actionResult = result as ActionResult<T>;

    if (actionResult.serverError) {
      const message =
        typeof actionResult.serverError === "string"
          ? actionResult.serverError
          : actionResult.serverError.message;
      throw new Error(message);
    }

    if (actionResult.validationErrors) {
      throw new Error("Validation error");
    }

    if (actionResult.data !== undefined) {
      return actionResult.data as T;
    }
  }

  return result as T;
}
