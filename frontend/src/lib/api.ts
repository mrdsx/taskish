export async function fetchApi(
  path: `/${string}`,
  init?: RequestInit,
): Promise<Response> {
  return await fetch(`/api${path}`, {
    credentials: "include",
    ...init,
  });
}
