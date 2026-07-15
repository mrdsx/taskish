import { createQuery } from "@tanstack/solid-query";
import { LoaderCircle, ShieldIcon } from "lucide-solid";
import { createSignal, For, Match, Switch } from "solid-js";
import { toast } from "somoto";
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
import { requestAttemptsService } from "../services";

export function RecentRequestAttemptsDialog() {
  const [wasOpenedForFirstTime, setWasOpenedForFirstTime] =
    createSignal<boolean>(false);

  const requestAttemptsQuery = createQuery(() => ({
    queryKey: queryKeys.ipList,
    queryFn: async () => {
      const result = await requestAttemptsService.getAll();
      if (!result.success) {
        toast.error(getErrorMessage(result.errorCode));
        throw new Error("Failed to fetch the request attempts");
      }

      return result.data;
    },
    enabled: wasOpenedForFirstTime(),
  }));

  const sortedRequestAttempts = () =>
    requestAttemptsQuery.data.toSorted((attemptA, attemptB) => {
      return (
        new Date(attemptB.lastAttempt).getTime() -
        new Date(attemptA.lastAttempt).getTime()
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
            Recent request attempts{" "}
            <RefreshButton
              size="icon-sm"
              isRefreshing={requestAttemptsQuery.isRefetching}
              onlyIcon
              refresh={requestAttemptsQuery.refetch}
            />
          </DialogTitle>
        </DialogHeader>
        <Switch>
          <Match when={requestAttemptsQuery.isError}>
            <p class="text-destructive">Failed to fetch request</p>
          </Match>
          <Match when={requestAttemptsQuery.isPending}>
            <LoaderCircle class="animate-spin justify-self-center my-2" />
          </Match>
          <Match when={requestAttemptsQuery.isSuccess}>
            <ul class="max-h-80 space-y-2 overflow-auto">
              <For
                each={sortedRequestAttempts()}
                fallback={<div>No logins found</div>}
              >
                {(requestAttempt, index) => (
                  <li>
                    <p>
                      <span class="font-semibold">{index() + 1}.</span>{" "}
                      {requestAttempt.host} (Requests: {requestAttempt.attempts}
                      )
                    </p>
                    <p class="text-sm text-muted-foreground">
                      Last attempt:{" "}
                      {new Date(requestAttempt.lastAttempt).toLocaleString()}
                    </p>
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
