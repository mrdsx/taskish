import { fetchApi } from "@/lib/api";
import {
  buildErrorResult,
  buildSuccessfulResult,
  getErrorCode,
  type Result,
} from "@/lib/result";
import z from "zod";
import { requestAttemptSchema } from "./schemas";
import type { RequestAttempt } from "./types";

class RequestAttemptsService {
  public async getAll(): Promise<Result<RequestAttempt[]>> {
    const response = await fetchApi("/request-attempts");
    if (!response.ok) {
      return buildErrorResult(getErrorCode(response.status));
    }

    const data = await response.json();
    const responseParse = z.array(requestAttemptSchema).safeParse(data);
    if (!responseParse.success) {
      return buildErrorResult("response_validation_error");
    }

    return buildSuccessfulResult(responseParse.data);
  }
}

export const requestAttemptsService = new RequestAttemptsService();
