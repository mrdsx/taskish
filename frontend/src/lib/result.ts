type ErrorCode =
  | "auth_error" //401
  | "not_found_error" //404
  | "client_validation_error"
  | "server_validation_error" //423
  | "response_validation_error"
  | "internal_error" //500
  | "unknown_error";

type SuccessfulResult<T> = {
  data: T;
  success: true;
  errorCode: null;
};

type ErrorResult = {
  data: null;
  success: false;
  errorCode: ErrorCode;
};

export type Result<T> = SuccessfulResult<T> | ErrorResult;

export function buildSuccessfulResult<T>(data: T): SuccessfulResult<T> {
  return { data, success: true, errorCode: null };
}

export function buildErrorResult(errorCode: ErrorCode): ErrorResult {
  return { data: null, success: false, errorCode };
}

const errorCodesObject = {
  401: "auth_error",
  404: "not_found_error",
  423: "server_validation_error",
  500: "internal_error",
} as const satisfies Record<number, Exclude<ErrorCode, "unknown_error">>;

export function getErrorCode(status: number): ErrorCode {
  return errorCodesObject[status] ?? "unknown_error";
}

const errorMessagesObject = {
  auth_error: "Failed to authenticate",
  not_found_error: "Not found",
  client_validation_error: "Invalid data",
  server_validation_error: "Invalid data",
  response_validation_error: "Invalid response",
  internal_error: "Internal server error",
  unknown_error: "Unexpected error",
} as const satisfies Record<ErrorCode, string>;

export function getErrorMessage(errorCode: string): string {
  return errorMessagesObject[errorCode] ?? errorMessagesObject.unknown_error;
}
