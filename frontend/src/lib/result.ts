type ErrorCode =
  "client_validation_error" | "response_validation_error" | "internal_error";

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
