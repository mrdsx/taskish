import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { EyeIcon, EyeOffIcon } from "lucide-solid";
import { createSignal, Show } from "solid-js";
import { toast } from "somoto";
import { taskService } from "@/features/tasks";
import { queryKeys } from "@/features/tasks/constants";
import { getErrorMessage } from "@/lib/result";
import { useUserStore } from "@/stores/user";
import { FormErrorView } from "./form-error-view";
import { SubmitButton } from "./submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";

export function AuthForm() {
  const [isAuthTokenVisible, setIsAuthTokenVisible] =
    createSignal<boolean>(false);
  const [formError, setFormError] = createSignal<string | null>(null);
  const userStore = useUserStore();

  const queryClient = useQueryClient();
  const authMutation = createMutation(() => ({
    mutationFn: async () => {
      const result = await taskService.getAll();
      if (!result.success) {
        toast.error(getErrorMessage(result.errorCode));
        throw new Error("Failed to authenticate");
      }

      return result.data;
    },
    onSuccess: (tasks) => {
      queryClient.setQueryData(queryKeys.tasks, tasks);
      userStore().setIsAuthenticated(true);
    },
  }));

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    setFormError(null);

    const apiUrl = userStore().apiUrl.trim();
    const authToken = userStore().authToken.trim();

    if (apiUrl.length === 0) {
      setFormError("API URL field is empty");
      return;
    }
    if (authToken.length === 0) {
      setFormError("Auth token field is empty");
      return;
    }

    authMutation.mutate();
  }

  return (
    <Card class="h-fit w-80">
      <CardHeader>
        <CardTitle>Login form</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" onSubmit={handleSubmit}>
          <TextField>
            <TextFieldLabel>API URL</TextFieldLabel>
            <TextFieldInput
              type="text"
              placeholder="http://api.example.com"
              value={userStore().apiUrl}
              onInput={(event) => {
                userStore().setApiUrl(event.currentTarget.value);
              }}
            />
          </TextField>
          <TextField>
            <TextFieldLabel>Auth token</TextFieldLabel>
            <InputGroup>
              <InputGroupInput
                type={isAuthTokenVisible() ? "text" : "password"}
                placeholder="Secret token"
                value={userStore().authToken}
                onInput={(event) => {
                  userStore().setAuthToken(event.currentTarget.value);
                }}
              />
              <InputGroupButton
                onClick={() => setIsAuthTokenVisible(!isAuthTokenVisible())}
              >
                <Show when={isAuthTokenVisible()}>
                  <EyeOffIcon />
                </Show>
                <Show when={!isAuthTokenVisible()}>
                  <EyeIcon />
                </Show>
              </InputGroupButton>
            </InputGroup>
          </TextField>
          <SubmitButton class="w-full" isLoading={authMutation.isPending}>
            Log In
          </SubmitButton>
        </form>
        <FormErrorView class="mt-4" formError={formError()} />
      </CardContent>
    </Card>
  );
}
