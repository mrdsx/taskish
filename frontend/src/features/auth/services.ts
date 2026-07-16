import z from "zod";
import { fetchApi } from "@/lib/api";
import {
  buildErrorResult,
  buildSuccessfulResult,
  getErrorCode,
  type Result,
} from "@/lib/result";
import { authSessionSchema } from "./schemas";
import type { AuthSession } from "./types";

class AuthService {
  public async logIn(password: string): Promise<Result<null>> {
    const response = await fetchApi("/auth/login", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${password}`,
      },
    });
    if (!response.ok) {
      return buildErrorResult(getErrorCode(response.status));
    }

    return buildSuccessfulResult(null);
  }

  public async logOut(): Promise<Result<null>> {
    const response = await fetchApi("/auth/logout", {
      method: "POST",
    });
    if (!response.ok) {
      return buildErrorResult(getErrorCode(response.status));
    }

    return buildSuccessfulResult(null);
  }

  public async getAuthSessions(): Promise<Result<AuthSession[]>> {
    const response = await fetchApi("/auth/sessions");
    if (!response.ok) {
      return buildErrorResult(getErrorCode(response.status));
    }

    const data = await response.json();
    const responseParse = z.array(authSessionSchema).safeParse(data);
    if (!responseParse.success) {
      return buildErrorResult("response_validation_error");
    }

    return buildSuccessfulResult(responseParse.data);
  }
}

export const authService = new AuthService();
