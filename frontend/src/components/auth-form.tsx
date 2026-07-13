import { useMutation } from "@tanstack/solid-query";
import { createSignal } from "solid-js";
import { taskService } from "@/features/tasks";
import { useUserStore } from "@/stores/user";
import { FormErrorView } from "./form-error-view";
import { SubmitButton } from "./submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";

export function AuthForm() {
  const [formError, setFormError] = createSignal<string | null>(null);
  const user = useUserStore();
  const authMutation = useMutation(() => ({
    mutationFn: async () => {
      const result = await taskService.getAll();
      if (!result.success) {
        setFormError("Invalid credentials");
        throw new Error("Invalid credentials");
      }
    },
    onSuccess: () => {
      user().setIsAuthenticated(true);
    },
  }));

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    setFormError(null);

    const apiUrl = user().apiUrl.trim();
    const authToken = user().authToken.trim();

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
              value={user().apiUrl}
              onInput={(event) => {
                user().setApiUrl(event.currentTarget.value);
              }}
            />
          </TextField>
          <TextField>
            <TextFieldLabel>Auth token</TextFieldLabel>
            <TextFieldInput
              type="text"
              placeholder="Secret token"
              value={user().authToken}
              onInput={(event) => {
                user().setAuthToken(event.currentTarget.value);
              }}
            />
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
