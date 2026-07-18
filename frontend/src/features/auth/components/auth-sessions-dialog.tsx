import { createQuery } from "@tanstack/solid-query";
import { LoaderCircle, ShieldIcon } from "lucide-solid";
import { createSignal, For, Match, Switch } from "solid-js";
import { toast } from "somoto";
import { EmptyErrorView } from "@/components/empty-error-view";
import { RefreshButton } from "@/components/refresh-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getErrorMessage } from "@/lib/result";
import { queryKeys } from "../query-keys";
import { authService } from "../services";
import { AuthSessionItemView } from "./auth-session-item-view";

export function AuthSessionsDialog() {
  const [wasOpenedForFirstTime, setWasOpenedForFirstTime] =
    createSignal<boolean>(false);

  const authSessionsQuery = createQuery(() => ({
    queryKey: queryKeys.authSessions,
    queryFn: async () => {
      const result = await authService.getAuthSessions();
      if (!result.success) {
        toast.error(getErrorMessage(result.errorCode));
        throw new Error("Failed to fetch the auth sessions");
      }

      return result.data;
    },
    enabled: wasOpenedForFirstTime(),
  }));

  const sortedAuthSessions = () =>
    authSessionsQuery.data.toSorted((sessionA, sessionB) => {
      return (
        new Date(sessionB.lastLogin).getTime() -
        new Date(sessionA.lastLogin).getTime()
      );
    });

  return (
    <Dialog onOpenChange={() => setWasOpenedForFirstTime(true)}>
      <DialogTrigger as={Button} variant="outline">
        <ShieldIcon />
      </DialogTrigger>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            Recent auth sessions{" "}
            <RefreshButton
              size="icon-sm"
              isRefreshing={authSessionsQuery.isRefetching}
              onlyIcon
              refresh={authSessionsQuery.refetch}
            />
          </DialogTitle>
        </DialogHeader>
        <Switch>
          <Match when={authSessionsQuery.isError}>
            <EmptyErrorView retry={authSessionsQuery.refetch} />
          </Match>
          <Match when={authSessionsQuery.isPending}>
            <LoaderCircle class="animate-spin justify-self-center my-2" />
          </Match>
          <Match when={authSessionsQuery.isSuccess}>
            <ul class="max-h-80 space-y-4 overflow-auto">
              <For
                each={sortedAuthSessions()}
                fallback={<div>No logins found</div>}
              >
                {(authSession) => (
                  <li>
                    <AuthSessionItemView authSession={authSession} />
                  </li>
                )}
              </For>
            </ul>
          </Match>
        </Switch>
      </DialogContent>
    </Dialog>
  );
}
