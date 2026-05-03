export const ErrorMessageKey = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  ROUTE_NOT_FOUND: "ROUTE_NOT_FOUND",
  ROUTE_NO_STOPS: "ROUTE_NO_STOPS",
  STOP_ID_NOT_ON_ROUTE: "STOP_ID_NOT_ON_ROUTE",
  DUPLICATE_STOP_ID: "DUPLICATE_STOP_ID",
  DELAY_RECORD_NOT_FOUND: "DELAY_RECORD_NOT_FOUND",
  BOARDING_STOP_MISSING: "BOARDING_STOP_MISSING",
  EXIT_STOP_MISSING: "EXIT_STOP_MISSING",
  BOARDING_BEFORE_EXIT: "BOARDING_BEFORE_EXIT",
  STATE_LOCKED: "STATE_LOCKED",
  INVALID_STATE_TRANSITION: "INVALID_STATE_TRANSITION",
  BOARDING_EXIT_CHANGE_NOT_ALLOWED: "BOARDING_EXIT_CHANGE_NOT_ALLOWED",
  CHECKPOINT_NOT_FOUND: "CHECKPOINT_NOT_FOUND",
  ARRIVAL_ACTUAL_REQUIRED: "ARRIVAL_ACTUAL_REQUIRED",
  FINAL_DELAY_NEGATIVE: "FINAL_DELAY_NEGATIVE",
} as const;

export type ErrorMessageKey =
  (typeof ErrorMessageKey)[keyof typeof ErrorMessageKey];

export const errorMessagesCs: Record<ErrorMessageKey, string> = {
  VALIDATION_ERROR: "Validace selhala.",
  ROUTE_NOT_FOUND: "Linka nebyla nalezena.",
  ROUTE_NO_STOPS: "Linka nemá žádné zastávky.",
  STOP_ID_NOT_ON_ROUTE: "Zadaná zastávka na dané lince neexistuje.",
  DUPLICATE_STOP_ID: "Trasa obsahuje duplicitni stopId.",
  DELAY_RECORD_NOT_FOUND: "Záznam o zpoždění nebyl nalezen.",
  BOARDING_STOP_MISSING: "Zastávka pro nástup musí na lince existovat.",
  EXIT_STOP_MISSING: "Zastávka pro výstup musí na lince existovat.",
  BOARDING_BEFORE_EXIT:
    "Zastávka pro nástup musí být před zastávkou pro výstup.",
  STATE_LOCKED:
    "Stav nelze změnit, pokud je záznam označen jako Dokončený nebo Zrušený.",
  INVALID_STATE_TRANSITION: "Neplatný přechod stavu.",
  BOARDING_EXIT_CHANGE_NOT_ALLOWED:
    "Nástupní a výstupní zastávky nelze změnit, pokud záznam není ve stavu Naplánováno.",
  CHECKPOINT_NOT_FOUND: "Zastávka nebyla nalezena.",
  ARRIVAL_ACTUAL_REQUIRED:
    "Čas příjezdu musí být nastaven pro výstupní zastávku při dokončení.",
  FINAL_DELAY_NEGATIVE: "Konečné zpoždění nemůže být záporné.",
};
