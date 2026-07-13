import { useUserStore } from "@/stores/user";

export async function fetchApi(path: `/${string}`, init?: RequestInit) {
  const apiUrl = useUserStore.getState().apiUrl;
  const authToken = useUserStore.getState().authToken;

  return await fetch(apiUrl + path, {
    ...init,
    headers: {
      "auth-token": authToken,
      ...init?.headers,
    },
  });
}
