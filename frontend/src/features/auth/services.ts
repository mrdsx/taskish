import { fetchApi } from "@/lib/api";
import {
  buildErrorResult,
  buildSuccessfulResult,
  getErrorCode,
  type Result,
} from "@/lib/result";

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
}

export const authService = new AuthService();
