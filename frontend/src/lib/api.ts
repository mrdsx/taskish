import { API_URL } from "./constants";

export async function fetchApi(
  path: `/${string}`,
  init?: RequestInit,
): Promise<Response> {
  return await fetch(`${API_URL}/api${path}`, {
    credentials: "include",
    ...init,
  });
}
